// 何台のブラウザからでも同じデータを読み書きできる、テスト用の偽 Supabase サーバー(本物の決まりをまねる)
// 使い方: node tests/mock-server.cjs [port]   → http://localhost:<port>/clear/remote.html を開く
// - /clear/... などの静的ファイルは tests/site から出す
// - POST /api/q   : 表の読み書き(events / roster / backups / shares)。ログインした人の行だけ
// - POST /api/rpc : share_create / share_get / share_score / share_court(supabase/share.sql と同じ決まり)
// - GET  /api/changes?since=ms : その時刻より後に変わった events の行(リアルタイムのかわりに、画面が1秒ごとに見に来る)
const http = require("http"), fs = require("fs"), path = require("path");
const PORT = Number(process.argv[2] || 8790);
const SITE = path.join(__dirname, "site");
const DB = { events: [], roster: [], backups: [], shares: [], tries: {} };
const USERS = { "t@example.com": { id: "u-1", pw: "password1" }, "t2@example.com": { id: "u-2", pw: "password2" } };
const LOG = [];
const now = () => Date.now();
const log = (s) => { LOG.push(new Date().toISOString().slice(11, 19) + " " + s); if (LOG.length > 2000) LOG.shift(); };

function find(code, ip) {
  const t = (DB.tries[ip] || []).filter((x) => x > now() - 600000);
  DB.tries[ip] = t;
  if (t.length >= 10) throw new Error("too many tries");
  const s = /^[0-9]{8}$/.test(code || "") && DB.shares.find((x) => x.code === code && x.enabled);
  if (!s) t.push(now());
  return s || null;
}
function evOf(s) { return DB.events.find((r) => r.user_id === s.user_id && r.id === s.event_id); }
function shareView(s) {
  const ev = evOf(s), d = ev && ev.data;
  if (!d || d.mode !== "practice") return null;
  return JSON.parse(JSON.stringify({
    name: d.name, date: d.date, games: d.games, points: d.points,
    players: (d.players || []).map((p) => ({ id: p.id, name: p.name, school: p.school })),
    rounds: ((d.practice && d.practice.rounds) || []).map((r) => ({ id: r.id, day: r.day, matches: (r.matches || []).map((m) => ({ id: m.id, ct: m.ct, a: m.a, b: m.b, g: m.g || [], win: m.win })) })),
    updatedAt: d.updatedAt,
  }));
}
function locate(s, rid, mid) {
  const ev = evOf(s);
  if (!ev) throw new Error("event not found");
  const r = ev.data.practice.rounds.find((x) => x.id === rid);
  if (!r) throw new Error("round not found");
  const m = r.matches.find((x) => x.id === mid);
  if (!m) throw new Error("match not found");
  return { ev, m };
}
function touch(ev) { ev.data.updatedAt = now(); ev.updated = now(); }
function rpc(fn, a, uid, ip) {
  if (fn === "share_create") {
    if (!uid) throw new Error("login required");
    if (!DB.events.some((r) => r.user_id === uid && r.id === a.p_event)) throw new Error("event not found");
    DB.shares = DB.shares.filter((x) => !(x.user_id === uid && x.event_id === a.p_event));
    let c; do c = String(Math.floor(Math.random() * 1e8)).padStart(8, "0"); while (DB.shares.some((x) => x.code === c));
    DB.shares.push({ code: c, user_id: uid, event_id: a.p_event, enabled: true });
    return c;
  }
  if (fn === "share_get") { const s = find(a.p_code, ip); return s ? shareView(s) : null; }
  if (fn === "share_score") {
    const s = find(a.p_code, ip); if (!s) return null;
    const { ev, m } = locate(s, a.p_round, a.p_mid), d = ev.data;
    const pts = d.points || 21, ng = d.games === 3 ? 3 : 1, cap = pts === 21 ? 30 : pts === 15 ? 21 : 15;
    if (a.p_base != null && JSON.stringify(m.g || []) !== JSON.stringify(a.p_base)) throw new Error("conflict");
    if (!Array.isArray(a.p_g) || !a.p_g.length || a.p_g.length > ng) throw new Error("bad score");
    const need = ng === 3 ? 2 : 1; let wa = 0, wb = 0, gap = false;
    for (const g of a.p_g) {
      if (!Array.isArray(g) || g.length !== 2 || g.some((v) => v !== null && !(Number.isInteger(v) && v >= 0 && v <= cap))) throw new Error("bad score");
      if (g[0] == null && g[1] == null) { gap = true; continue; }
      if (gap || wa >= need || wb >= need) throw new Error("bad score");
      if (g[0] != null && g[1] != null) { const hi = Math.max(...g), lo = Math.min(...g); if ((hi === lo && hi >= cap) || (hi > pts && hi - lo > 2)) throw new Error("bad score"); if (hi !== lo && (hi >= cap || (hi >= pts && hi - lo >= 2))) { if (g[0] > g[1]) wa++; else wb++; } }
    }
    m.g = a.p_g; m.win = null; touch(ev);
    log(`score ${a.p_mid} ${JSON.stringify(a.p_g)}`);
    return shareView(s);
  }
  if (fn === "share_court") {
    const s = find(a.p_code, ip); if (!s) return null;
    if (!/^[0-9A-Z]{0,2}$/.test(a.p_ct == null ? "x" : a.p_ct)) throw new Error("bad court");
    const { ev, m } = locate(s, a.p_round, a.p_mid);
    m.ct = a.p_ct; touch(ev); log(`court ${a.p_mid} ${a.p_ct}`);
    return shareView(s);
  }
  throw new Error("unknown function");
}
function q(b, uid) {
  const T = b.table;
  if (!DB[T] || T === "tries") throw new Error("no table");
  if (!uid) throw new Error("permission denied");
  const own = (r) => r.user_id === uid;
  const match = (r) => own(r) && (b.filters || []).every(([k, v]) => r[k] === v);
  const pick = (r) => (T === "shares" ? { code: r.code, enabled: r.enabled } : { id: r.id, data: r.data });
  if (b.op === "upsert") {
    const row = Object.assign({}, b.row, { user_id: uid });
    const i = DB[T].findIndex((r) => r.user_id === uid && r.id === row.id);
    row.updated = now();
    if (i >= 0) DB[T][i] = row; else DB[T].push(row);
    if (T === "events") log(`teacher save ${row.id}`);
    return null;
  }
  if (b.op === "delete") { DB[T] = DB[T].filter((r) => !match(r)); return null; }
  if (b.op === "update") { DB[T].filter(match).forEach((r) => Object.assign(r, b.patch)); return null; }
  const rows = DB[T].filter(match).map(pick);
  return b.single ? rows[0] || null : rows;
}
const send = (res, code, obj) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };
http.createServer((req, res) => {
  const u = new URL(req.url, "http://x"), ip = req.headers["x-test-ip"] || req.socket.remoteAddress;
  const sess = req.headers["x-test-user"] || "";
  if (u.pathname === "/api/log") return send(res, 200, LOG);
  if (u.pathname === "/api/db") return send(res, 200, DB);
  if (u.pathname === "/api/changes") {
    const since = Number(u.searchParams.get("since") || 0);
    return send(res, 200, { now: now(), rows: DB.events.filter((r) => r.user_id === sess && (r.updated || 0) > since).map((r) => ({ id: r.id, user_id: r.user_id, data: r.data })) });
  }
  if (u.pathname === "/api/login") {
    let body = ""; req.on("data", (c) => (body += c)); req.on("end", () => {
      const { email, password } = JSON.parse(body || "{}"), x = USERS[email];
      if (!x || x.pw !== password) return send(res, 200, { error: "Invalid login credentials" });
      send(res, 200, { user: { id: x.id, email } });
    }); return;
  }
  if (u.pathname === "/api/q" || u.pathname === "/api/rpc") {
    let body = ""; req.on("data", (c) => (body += c)); req.on("end", () => {
      try {
        const b = JSON.parse(body || "{}");
        const data = u.pathname === "/api/q" ? q(b, sess) : rpc(b.fn, b.args || {}, sess, ip);
        send(res, 200, { data, error: null });
      } catch (e) { send(res, 200, { data: null, error: { message: e.message } }); }
    }); return;
  }
  const f = path.join(SITE, decodeURIComponent(u.pathname));
  if (!f.startsWith(SITE)) { res.writeHead(403); return res.end(); }
  fs.readFile(f.endsWith("/") ? f + "index.html" : f, (e, d) => {
    if (e) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": f.endsWith(".js") ? "text/javascript" : f.endsWith(".png") ? "image/png" : "text/html; charset=utf-8" });
    res.end(d);
  });
}).listen(PORT, () => console.log("mock server http://localhost:" + PORT + "/clear/remote.html"));
