/* ============================================================
   CLEAR 計算部 (core)  — 画面(DOM)には一切触らない。
   データ v2:
     players[]  { id, name, school, level(1〜5) }       … 選手は1人ずつ
     pairs[]    { id, a, b, level|null }                 … 2人をつなぐ記録。level が null なら平均
     リーグ戦・トーナメントの「出場単位(entry)」 = シングルスは選手、ダブルスはペア(id で呼ぶ)
     練習試合の試合の側 = 選手idの配列(1人 or 2人)。2人のときは登録ペアがあればそれを使う
   ============================================================ */
const Core = (() => {
"use strict";
const RANK_MAX = 5;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clone = (o) => JSON.parse(JSON.stringify(o));
let _uidN = 0;
const uid = () => Math.random().toString(36).slice(2, 9) + (Date.now() + _uidN++).toString(36).slice(-4);
const to5 = (v) => clamp(Math.ceil(v / 2), 1, RANK_MAX);
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
}
function shuffle(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
const isEmptyGames = (g) => !g || g.every((x) => x[0] == null && x[1] == null);
const keyOf = (a, b) => (a < b ? `${a}__${b}` : `${b}__${a}`);

/* ---------- 選手とペア(全形式で共通) ---------- */
function playerMap(e) { const m = {}; e.players.forEach((p) => (m[p.id] = p)); return m; }
function pairMap(e) { const m = {}; e.pairs.forEach((p) => (m[p.id] = p)); return m; }
function pairOfPlayer(e, id) { return e.pairs.find((p) => p.a === id || p.b === id) || null; }
function partnerOf(e, id) { const pr = pairOfPlayer(e, id); return pr ? (pr.a === id ? pr.b : pr.a) : null; }
function schoolsOf(a, b) { const x = (a.school || "").trim(), y = (b.school || "").trim(); return x === y ? x : [x, y].filter(Boolean).join("・"); }
function pairLevel(e, pr) {
  if (pr.level != null) return pr.level;
  const pm = playerMap(e), A = pm[pr.a], B = pm[pr.b];
  return A && B ? (A.level + B.level) / 2 : 3;
}
/* 平均を 0.5 刻みにそろえる(表示・手入力用) */
const roundHalf = (v) => clamp(Math.round(v * 2) / 2, 1, RANK_MAX);
function isCrossSchool(e, pr) {
  const pm = playerMap(e), A = pm[pr.a], B = pm[pr.b];
  return !!(A && B && (A.school || "").trim() !== (B.school || "").trim());
}
/* 2人をペアにする。すでに組んでいる人は、その組を解いてから。戻り値 { pair, cross, broke:[解いたペア] } */
function makePair(e, a, b) {
  if (a === b) return null;
  const pm = playerMap(e);
  if (!pm[a] || !pm[b]) return null;
  const broke = e.pairs.filter((p) => [a, b].some((x) => p.a === x || p.b === x));
  e.pairs = e.pairs.filter((p) => !broke.includes(p));
  const pair = { id: uid(), a, b, level: null };
  e.pairs.push(pair);
  return { pair, cross: isCrossSchool(e, pair), broke };
}
function removePair(e, pairId) { e.pairs = e.pairs.filter((p) => p.id !== pairId); }

/* 出場単位(entry)。シングルス=選手、ダブルス=ペア */
function isDbl(e) { return e.type === "doubles"; }
function entries(e) {
  if (!isDbl(e)) return e.players.map((p) => ({ id: p.id, kind: "p", name: p.name, school: (p.school || "").trim(), level: p.level, ids: [p.id] }));
  const pm = playerMap(e);
  return e.pairs.filter((pr) => pm[pr.a] && pm[pr.b]).map((pr) => ({
    id: pr.id, kind: "pair", name: `${pm[pr.a].name}・${pm[pr.b].name}`, names: [pm[pr.a].name, pm[pr.b].name],
    school: schoolsOf(pm[pr.a], pm[pr.b]), level: pairLevel(e, pr), ids: [pr.a, pr.b],
  }));
}
function entryMap(e) { const m = {}; entries(e).forEach((x) => (m[x.id] = x)); return m; }
/* ダブルスで、どのペアにも入っていない選手(リーグ・トーナメントには出られない) */
function unpairedPlayers(e) { const inP = new Set(e.pairs.flatMap((p) => [p.a, p.b])); return e.players.filter((p) => !inP.has(p.id)); }
function unitWord(e) { return isDbl(e) ? "ペア" : "選手"; }
function letter(i) { return LETTERS[i] || String(i + 1); }

/* ---------- リーグ分け ---------- */
function dupCost(list) {
  const c = {};
  list.forEach((p) => { const k = (p.school || "").trim(); if (k) c[k] = (c[k] || 0) + 1; });
  return Object.values(c).reduce((s, n) => s + (n * (n - 1)) / 2, 0);
}
function planSizes(n, size) {
  if (n < 2) return n ? [n] : [];
  let K = Math.max(1, Math.round(n / size));
  while (K > 1 && Math.floor(n / K) < 3) K--;
  const base = Math.floor(n / K), extra = n % K;
  return Array.from({ length: K }, (_, i) => base + (i < extra ? 1 : 0));
}
function groupSizesFor(e, n) {
  const sizes = planSizes(n, e.groupSize);
  if (e.splitMethod !== "balanced" || sizes.length < 2) return sizes;
  const K = sizes.length, out = new Array(K).fill(0);
  for (let i = 0; i < n; i++) { const r = Math.floor(i / K), j = i % K; out[r % 2 === 0 ? j : K - 1 - j]++; }
  return out;
}
/* e.leagues = [{ id, ids:[entry id] }] を作る */
function autoAssign(e, seed) {
  const rand = rng(seed == null ? Date.now() : seed);
  const ps = shuffle(entries(e), rand).sort((a, b) => b.level - a.level);
  const sizes = planSizes(ps.length, e.groupSize);
  const K = sizes.length;
  let groups, canSwap;
  if (e.splitMethod === "balanced") {
    groups = Array.from({ length: K }, () => []);
    const pot = {};
    ps.forEach((p, i) => { const r = Math.floor(i / K), j = i % K; groups[r % 2 === 0 ? j : K - 1 - j].push(p); pot[p.id] = r; });
    canSwap = (p, q) => pot[p.id] === pot[q.id];
  } else {
    groups = [];
    let k = 0;
    sizes.forEach((n) => { groups.push(ps.slice(k, k + n)); k += n; });
    canSwap = (p, q) => Math.abs(p.level - q.level) <= e.tolerance;
  }
  if (e.spreadSchools) {
    for (let iter = 0; iter < 300; iter++) {
      let improved = false;
      for (let i = 0; i < K && !improved; i++) for (let j = i + 1; j < K && !improved; j++) {
        const before = dupCost(groups[i]) + dupCost(groups[j]);
        if (before === 0) continue;
        for (let a = 0; a < groups[i].length && !improved; a++) for (let b = 0; b < groups[j].length && !improved; b++) {
          const p = groups[i][a], q = groups[j][b];
          if (p.school === q.school || !canSwap(p, q)) continue;
          groups[i][a] = q; groups[j][b] = p;
          if (dupCost(groups[i]) + dupCost(groups[j]) < before) improved = true;
          else { groups[i][a] = p; groups[j][b] = q; }
        }
      }
      if (!improved) break;
    }
  }
  e.leagues = groups.map((g) => ({ id: uid(), ids: g.sort((a, b) => b.level - a.level).map((p) => p.id) }));
}
function leagueIndexOf(e, id) { return e.leagues.findIndex((l) => l.ids.includes(id)); }
function unassigned(e) { const s = new Set(e.leagues.flatMap((l) => l.ids)); return entries(e).filter((p) => !s.has(p.id)); }
function moveToLeague(e, id, to) {
  const em = entryMap(e);
  e.leagues.forEach((l) => (l.ids = l.ids.filter((x) => x !== id)));
  if (to >= 0 && e.leagues[to]) { e.leagues[to].ids.push(id); e.leagues[to].ids.sort((x, y) => em[y].level - em[x].level); }
}

function roundRobin(ids) {
  const arr = ids.slice();
  if (arr.length < 2) return [];
  if (arr.length % 2) arr.push(null);
  const n = arr.length, rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const pairs = []; let bye = null;
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i], b = arr[n - 1 - i];
      if (a && b) pairs.push(r % 2 && i === 0 ? [b, a] : [a, b]); else bye = a || b;
    }
    rounds.push({ pairs, bye });
    arr.splice(1, 0, arr.pop());
  }
  return rounds;
}
const matchCount = (n) => (n * (n - 1)) / 2;
const dayCount = (e, n) => Math.max(1, Math.ceil(Math.max(0, n - 1) / e.maxPerDay));
function splitDays(rounds, max) {
  const days = [];
  let cur = [], cnt = {};
  rounds.forEach((r) => {
    const ids = r.pairs.flat();
    if (cur.length && ids.some((id) => (cnt[id] || 0) + 1 > max)) { days.push(cur); cur = []; cnt = {}; }
    cur.push(r);
    ids.forEach((id) => (cnt[id] = (cnt[id] || 0) + 1));
  });
  if (cur.length) days.push(cur);
  return days;
}

/* ---------- 結果(リーグ戦: 出場単位どうし) ---------- */
function gamesOf(e, a, b) {
  const r = e.results[keyOf(a, b)];
  const g = (r && r.g) || [];
  return g.slice(0, e.games).map((x) => (a < b ? [x[0], x[1]] : [x[1], x[0]]));
}
function cleanResult(R, key) { const r = R[key]; if (r && isEmptyGames(r.g) && !r.wo && !r.win) delete R[key]; }
function setScore(e, a, b, gi, side, val) {
  const key = keyOf(a, b);
  const r = e.results[key] || (e.results[key] = { g: [] });
  while (r.g.length <= gi) r.g.push([null, null]);
  r.g[gi][a < b ? side : 1 - side] = val;
  delete r.win;
  cleanResult(e.results, key);
}
function setWo(e, a, b, who) {
  const key = keyOf(a, b);
  const r = e.results[key] || (e.results[key] = { g: [] });
  if (who) { r.wo = who; delete r.win; } else delete r.wo;
  cleanResult(e.results, key);
}
function setWin(e, a, b, who) {
  const key = keyOf(a, b);
  const r = e.results[key] || (e.results[key] = { g: [] });
  if (who) { r.win = who; r.g = []; delete r.wo; } else delete r.win;
  cleanResult(e.results, key);
}
const woOf = (e, a, b) => { const r = e.results[keyOf(a, b)]; return (r && r.wo) || null; };
const winOf = (e, a, b) => { const r = e.results[keyOf(a, b)]; return (r && r.win) || null; };
function outcomeOf(e, games, a, b, wo, win) {
  const need = e.games === 1 ? 1 : 2;
  if (wo === a || wo === b) {
    const winner = wo === a ? b : a, P = need * e.points;
    return { winner, wo, ga: winner === a ? need : 0, gb: winner === b ? need : 0, pa: winner === a ? P : 0, pb: winner === b ? P : 0, started: true };
  }
  if ((win === a || win === b) && isEmptyGames(games)) {
    return { winner: win, quick: true, ga: win === a ? need : 0, gb: win === b ? need : 0, pa: 0, pb: 0, started: true };
  }
  let ga = 0, gb = 0, pa = 0, pb = 0, started = false;
  games.slice(0, e.games).forEach(([x, y]) => {
    if (x != null || y != null) started = true;
    if (x == null || y == null) return;
    pa += x; pb += y;
    if (x > y) ga++; else if (y > x) gb++;
  });
  const winner = ga >= need ? a : gb >= need ? b : null;
  return { winner, ga, gb, pa, pb, started };
}
const outcome = (e, a, b) => outcomeOf(e, gamesOf(e, a, b), a, b, woOf(e, a, b), winOf(e, a, b));
function extraGame(e, games) {
  const need = e.games === 1 ? 1 : 2;
  let ga = 0, gb = 0;
  for (const [x, y] of games.slice(0, e.games)) {
    if (x == null && y == null) continue;
    if (ga >= need || gb >= need) return true;
    if (x != null && y != null) { if (x > y) ga++; else if (y > x) gb++; }
  }
  return false;
}
function gameWarn(e, x, y) {
  if (x == null || y == null) return false;
  const w = Math.max(x, y), l = Math.min(x, y), t = e.points;
  if (w === l) return true;
  const cap = t === 21 ? 30 : t === 15 ? 21 : 15;
  if (w === t) return l > t - 2;
  if (w > t && w < cap) return w - l !== 2;
  if (w === cap) return !(l === cap - 1 || l === cap - 2);
  return true;
}
/* 入力できる点数の上限(21点なら30) */
const scoreCap = (e) => (e.points === 21 ? 30 : e.points === 15 ? 21 : 15);

/* ---------- 順位 (BWF 一般競技規程 16.2) ---------- */
function standings(e, league) {
  const em = entryMap(e);
  const ids = league.ids.filter((id) => em[id]);
  const rows = ids.map((id, order) => ({ id, p: em[id], order, played: 0, w: 0, l: 0, gw: 0, gl: 0, pf: 0, pa: 0 }));
  const byId = {}; rows.forEach((r) => (byId[r.id] = r));
  let finished = 0;
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const o = outcome(e, ids[i], ids[j]);
    if (!o.winner) continue;
    finished++;
    const A = byId[ids[i]], B = byId[ids[j]];
    A.played++; B.played++;
    A.gw += o.ga; A.gl += o.gb; B.gw += o.gb; B.gl += o.ga;
    A.pf += o.pa; A.pa += o.pb; B.pf += o.pb; B.pa += o.pa;
    if (o.winner === A.id) { A.w++; B.l++; } else { B.w++; A.l++; }
  }
  const tiers = rankTiers(e, rows);
  const sorted = [];
  tiers.forEach((t) => {
    const rank = sorted.length + 1;
    t.sort((x, y) => x.order - y.order).forEach((r) => { r.rank = rank; r.lots = t.length > 1 && r.played > 0; sorted.push(r); });
  });
  return { rows, sorted, finished, total: matchCount(ids.length), lots: tiers.some((t) => t.length > 1 && t[0].played > 0) };
}
function rankTiers(e, rows) {
  const split = (arr, key) => {
    const m = new Map();
    arr.forEach((r) => { const k = key(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); });
    return [...m.entries()].sort((a, b) => b[0] - a[0]).map((x) => x[1]);
  };
  const h2h = ([a, b]) => {
    const w = outcome(e, a.id, b.id).winner;
    return w === a.id ? [[a], [b]] : w === b.id ? [[b], [a]] : null;
  };
  const keys = [(r) => r.gw - r.gl, (r) => r.pf - r.pa];
  const resolve = (grp, level) => {
    if (grp.length === 1) return [grp];
    if (grp.length === 2) { const h = h2h(grp); if (h) return h; }
    if (level >= keys.length) return [grp];
    return split(grp, keys[level]).flatMap((p) => resolve(p, level + 1));
  };
  return split(rows, (r) => r.w).flatMap((g) => resolve(g, 0));
}

/* ---------- トーナメント ---------- */
function seedPositions(N) {
  const pos = new Array(N);
  const place = (lo, size, s, atTop, topLevel) => {
    if (size === 1) { pos[lo] = s; return; }
    const half = size / 2;
    const partner = (N / size) * 2 + 1 - s;
    if (topLevel) { place(lo, half, s, true, false); place(lo + half, half, partner, true, false); }
    else if (atTop) { place(lo, half, s, true, false); place(lo + half, half, partner, false, false); }
    else { place(lo, half, partner, true, false); place(lo + half, half, s, false, false); }
  };
  if (N === 1) return [1];
  place(0, N, 1, true, true);
  return pos;
}
function roundName(K, r) { const d = K - r; return d === 0 ? "決勝" : d === 1 ? "準決勝" : d === 2 ? "準々決勝" : `${r}回戦`; }
function bracketEntries(e, seed) {
  const list = shuffle(entries(e), rng(seed == null ? Date.now() : seed)).sort((a, b) => b.level - a.level).map((p) => ({ id: p.id, tier: p.level }));
  const ranked = new Array(list.length).fill(null);
  const locked = new Set();
  list.filter((x) => e.seeds[x.id] && e.seeds[x.id] <= list.length).sort((a, b) => e.seeds[a.id] - e.seeds[b.id])
    .forEach((x) => { ranked[e.seeds[x.id] - 1] = x; locked.add(x.id); });
  const rest = list.filter((x) => !locked.has(x.id));
  for (let i = 0; i < ranked.length; i++) if (!ranked[i]) ranked[i] = rest.shift();
  return { list: ranked, tol: e.tolerance, locked };
}
function buildBracket(e, seed) {
  const { list, tol, locked } = bracketEntries(e, seed);
  if (list.length < 2) return false;
  let N = 2;
  while (N < list.length) N *= 2;
  const slots = seedPositions(N).map((s) => (s <= list.length ? list[s - 1].id : null));
  if (e.spreadSchools) { const tier = {}; list.forEach((x) => (tier[x.id] = x.tier)); spreadBracket(e, slots, tier, tol, locked); }
  const seeds = {};
  locked.forEach((id) => (seeds[id] = e.seeds[id]));
  e.bracket = { slots, results: {}, seeds };
  return true;
}
function spreadBracket(e, slots, tier, tol, locked) {
  const em = entryMap(e);
  const N = slots.length, K = Math.log2(N);
  const school = (i) => (slots[i] && em[slots[i]] ? em[slots[i]].school : "");
  const meet = (i, j) => { let r = 1; while (i >> r !== j >> r) r++; return r; };
  const contrib = (i) => {
    const sc = school(i);
    if (!sc) return 0;
    let c = 0;
    for (let j = 0; j < N; j++) if (j !== i && school(j) === sc) c += Math.pow(4, K - meet(i, j));
    return c;
  };
  for (let iter = 0; iter < 30; iter++) {
    let improved = false;
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      if (!slots[i] || !slots[j] || school(i) === school(j)) continue;
      if (locked && (locked.has(slots[i]) || locked.has(slots[j]))) continue;
      if (Math.abs(tier[slots[i]] - tier[slots[j]]) > tol) continue;
      const before = contrib(i) + contrib(j);
      [slots[i], slots[j]] = [slots[j], slots[i]];
      if (contrib(i) + contrib(j) < before) improved = true; else [slots[i], slots[j]] = [slots[j], slots[i]];
    }
    if (!improved) break;
  }
}
function bracketState(e) {
  const B = e.bracket;
  if (!B) return null;
  const em = entryMap(e);
  const N = B.slots.length, K = Math.log2(N);
  const slots = B.slots.map((id) => (id && em[id] ? id : null));
  const decide = (n) => {
    if (n.a && n.a !== "?" && n.b && n.b !== "?") {
      const res = B.results[n.mid];
      const same = res && res.a === n.a && res.b === n.b;
      n.o = outcomeOf(e, same ? res.g || [] : [], n.a, n.b, same ? res.wo : null, same ? res.win : null);
      n.out = n.o.winner || "?";
    } else n.out = "?";
  };
  const rounds = [];
  let prev = slots.map((id) => ({ out: id, cnt: id ? 1 : 0 }));
  for (let r = 1; r <= K; r++) {
    const cur = [];
    for (let i = 0; i < prev.length / 2; i++) {
      const L = prev[2 * i], R = prev[2 * i + 1];
      const n = { r, i, mid: `r${r}-${i}`, a: L.out, b: R.out, L, R, cnt: L.cnt + R.cnt, real: L.cnt > 0 && R.cnt > 0 };
      if (!n.real) n.out = L.cnt ? L.out : R.cnt ? R.out : null; else decide(n);
      cur.push(n);
    }
    rounds.push(cur);
    prev = cur;
  }
  let third = null;
  if (e.tThird && K >= 2) {
    const [s1, s2] = rounds[K - 2];
    const loser = (s) => (s.o && s.o.winner ? (s.o.winner === s.a ? s.b : s.a) : "?");
    if (s1.real && s2.real) { third = { r: K, mid: "third", a: loser(s1), b: loser(s2), L: s1, R: s2, real: true, isThird: true }; decide(third); }
  }
  let num = 1;
  for (let r = 0; r < K - 1; r++) rounds[r].forEach((n) => { if (n.real) n.num = num++; });
  if (third) third.num = num++;
  const final = rounds[K - 1][0];
  if (final.real) final.num = num++;
  rounds.forEach((nodes) => nodes.forEach((n) => (n.label = roundName(K, n.r))));
  if (third) third.label = "3位決定戦";
  const champion = final.real ? (final.o && final.o.winner) || null : final.out || null;
  return { N, K, slots, rounds, third, final, champion };
}
function bracketMatches(st) {
  const list = [];
  st.rounds.forEach((nodes) => nodes.forEach((n) => { if (n.real) list.push(n); }));
  if (st.third) list.push(st.third);
  return list.sort((x, y) => x.num - y.num);
}
function findNode(st, mid) {
  if (mid === "third") return st.third;
  for (const nodes of st.rounds) for (const n of nodes) if (n.mid === mid) return n;
  return null;
}
function bResult(e, n) {
  const R = e.bracket.results;
  let r = R[n.mid];
  if (!r || r.a !== n.a || r.b !== n.b) r = R[n.mid] = { a: n.a, b: n.b, g: [] };
  return r;
}
function setBScore(e, n, gi, side, val) {
  const r = bResult(e, n);
  while (r.g.length <= gi) r.g.push([null, null]);
  r.g[gi][side] = val; delete r.win;
  cleanResult(e.bracket.results, n.mid);
}
function setBWo(e, n, who) { const r = bResult(e, n); if (who) { r.wo = who; delete r.win; } else delete r.wo; cleanResult(e.bracket.results, n.mid); }
function setBWin(e, n, who) { const r = bResult(e, n); if (who) { r.win = who; r.g = []; delete r.wo; } else delete r.win; cleanResult(e.bracket.results, n.mid); }
function swapSlots(e, i, j) { const s = e.bracket.slots; if (i === j || !s[i] || !s[j]) return false; [s[i], s[j]] = [s[j], s[i]]; return true; }

/* ---------- 練習試合 ---------- */
/* 試合の側 = 選手idの配列。まとめて「かたまり(unit)」として扱うための道具 */
const sideIds = (side) => (Array.isArray(side) ? side.filter(Boolean) : side ? [side] : []);
function sideLevel(e, side) {
  const ids = sideIds(side), pm = playerMap(e);
  if (ids.length === 2) { const pr = e.pairs.find((p) => (p.a === ids[0] && p.b === ids[1]) || (p.a === ids[1] && p.b === ids[0])); if (pr) return pairLevel(e, pr); }
  return ids.length ? ids.reduce((s, id) => s + (pm[id] ? pm[id].level : 3), 0) / ids.length : 0;
}
function pOutcome(e, m) {
  const o = outcomeOf(e, (m.g || []).slice(0, e.games), "a", "b", null, m.win);
  if (!o.winner && m.win && !isEmptyGames(m.g)) { const need = e.games === 1 ? 1 : 2; return Object.assign(o, { winner: m.win, ga: m.win === "a" ? need : Math.min(o.ga, need - 1), gb: m.win === "b" ? need : Math.min(o.gb, need - 1), started: true }); }
  return o;
}
function pPlaced(r) { const out = []; r.matches.forEach((m) => m.a.concat(m.b).forEach((x) => x && out.push(x))); return out; }
function pHistory(e, upto) {
  const faced = {}, partner = {}, games = {};
  const add = (o, a, b, n) => { const k = keyOf(a, b); (o[k] || (o[k] = [])).push(n); };
  e.practice.rounds.slice(0, upto).forEach((r, ri) => r.matches.forEach((m) => {
    const A = m.a.filter(Boolean), B = m.b.filter(Boolean);
    A.forEach((x) => B.forEach((y) => add(faced, x, y, ri + 1)));
    if (A.length === 2) add(partner, A[0], A[1], ri + 1);
    if (B.length === 2) add(partner, B[0], B[1], ri + 1);
    A.concat(B).forEach((x) => (games[x] = (games[x] || 0) + 1));
  }));
  return { faced, partner, games, prev: upto };
}
const avgLv = (S) => S.reduce((s, p) => s + p.level, 0) / S.length;
/* 1試合の「悪さ」。小さいほどよい。優先: ①ランク差 ②続けてかぶり ③他校 ④かぶり */
function pMatchCost(H, tol, avoid, A, B, byPair, levelOf) {
  let c = 0;
  if (A.length === 2) {
    const d = Math.abs(levelOf(A) - levelOf(B));
    c += d * 6 + (d > tol ? (d - tol) * 400 : 0);
  }
  for (const x of A) for (const y of B) {
    const d = Math.abs(x.level - y.level);
    const one = A.length === 1;
    if (one) c += d * 1.5 + (d > tol ? (d - tol) * 300 : 0); else c += d * 0.5;
    if (avoid && x.school && x.school === y.school) c += one ? 150 : 50;
    const f = H.faced[keyOf(x.id, y.id)];
    if (f) c += f.length * (one ? 100 : 30) + (f.includes(H.prev) ? (one ? 250 : 160) : 0);
  }
  if (A.length === 2) {
    c += Math.abs(A[0].level + A[1].level - B[0].level - B[1].level) * 3;
    if (!byPair) [A, B].forEach(([p, q]) => {
      const f = H.partner[keyOf(p.id, q.id)];
      if (f) c += f.length * 100;
      c += Math.abs(p.level - q.level) * 0.3;
    });
  }
  return c;
}
/* 毎回組み替えのダブルスで、登録ペア以外の人をその回転だけ「同じ学校の中で」ペアにする。
   学校をまたぐ組は作らない。相方が見つからない人は待機に回る */
function tempPairs(e, players, H, rand) {
  const left = players.slice().sort((a, b) => b.level - a.level || (a.school || "").localeCompare(b.school || "", "ja"));
  const out = [];
  for (let i = 0; i < left.length; i++) {
    const p = left[i];
    let bi = -1, bc = Infinity;
    for (let j = i + 1; j < left.length; j++) {
      const q = left[j];
      if ((p.school || "").trim() !== (q.school || "").trim()) continue;
      const c = Math.abs(p.level - q.level) + (H.partner[keyOf(p.id, q.id)] || []).length * 5 + rand() * 0.6;
      if (c < bc) { bc = c; bi = j; }
    }
    if (bi > 0) { out.push([p.id, left[bi].id]); left.splice(bi, 1); left.splice(i, 1); i--; }
  }
  return out;
}
/* 固定ペアを自動で作る:同じ学校の中でランクが近い人どうし。余った人はペアなし。登録済みのペアはそのまま */
function autoPairs(e) {
  const inP = new Set(e.pairs.flatMap((p) => [p.a, p.b]));
  const left = e.players.filter((p) => !inP.has(p.id) && (p.school || "").trim()).sort((a, b) => b.level - a.level);
  const made = [];
  for (let i = 0; i < left.length; i++) {
    const j = left.findIndex((q, k) => k > i && q.school.trim() === left[i].school.trim());
    if (j > 0) { made.push({ id: uid(), a: left[i].id, b: left[j].id, level: null }); left.splice(j, 1); left.splice(i, 1); i--; }
  }
  e.pairs = e.pairs.concat(made);
  return made.length;
}
/* 抜く人(赤: 次の回転も)。id を ri 番目の回転から外す */
function keepFrom(x) { return x.from; }
function keptAt(e, ri) { return [...new Set(e.practice.dayOff.filter((x) => ri >= keepFrom(x)).map((x) => x.id))]; }

/* 1回転ぶんの組み合わせ。kind: singles | doubles。rest: 休む人。upto: この回転の番号。must: 必ず入れる人
   戻り値 { matches:[{id,a:[ids],b:[ids],g:[],win:null}], bench:[ids] } */
function genRound(e, kind, rest, upto, must = [], seed, reunite = false, fixedOverride) {
  const H = pHistory(e, upto), tol = e.practice.tol, avoid = e.practice.avoidSchool;
  const fixed = kind === "doubles" && (fixedOverride == null ? e.practice.pairMode === "fixed" : fixedOverride);
  const pool = e.players.filter((p) => !rest.includes(p.id));
  const inPool = new Set(pool.map((p) => p.id));
  const pm = playerMap(e);
  const baseSeed = seed == null ? Date.now() : seed;
  const rand0 = rng((baseSeed ^ (upto * 104729)) >>> 0);
  let units, leftover = [];
  const regNow = kind === "doubles" ? e.pairs.filter((p) => inPool.has(p.a) && inPool.has(p.b)) : [];
  const byPair = kind === "doubles";
  if (byPair) {
    let pairs;
    if (fixed) pairs = regNow.map((p) => [p.a, p.b]);
    else {
      const used0 = new Set(regNow.flatMap((p) => [p.a, p.b]));
      pairs = regNow.map((p) => [p.a, p.b]).concat(tempPairs(e, pool.filter((p) => !used0.has(p.id)), H, rand0));
    }
    units = pairs.map(([a, b]) => [pm[a], pm[b]]);
    // 固定ペアの片方が休むとき「別の人と組む」: 相方がいなくなった人を、同じ学校の中で組ませる
    if (fixed && reunite) { const u0 = new Set(units.flat().map((p) => p.id)); tempPairs(e, pool.filter((p) => !u0.has(p.id)), H, rand0).forEach(([a, b]) => units.push([pm[a], pm[b]])); }
    const used = new Set(units.flat().map((p) => p.id));
    leftover = pool.filter((p) => !used.has(p.id)).map((p) => p.id);
  } else units = pool.map((p) => [p]);
  const size = byPair ? 2 : 2, half = 1; // 単位(unit)は1人 or 1ペア。試合は2単位
  const nm = Math.floor(units.length / 2), nSlot = nm * 2;
  if (nm < 1) return { matches: [], bench: pool.map((p) => p.id), leftover };
  const gOf = (p) => H.games[p.id] || 0;
  const maxG = Math.max(0, ...pool.map(gOf));
  const sitCost = (u) => u.reduce((s, p) => s + 25 * (maxG - gOf(p)) + (must.includes(p.id) ? 5000 : 0), 0);
  const levelOf = (S) => { if (S.length === 2) { const pr = e.pairs.find((x) => (x.a === S[0].id && x.b === S[1].id) || (x.a === S[1].id && x.b === S[0].id)); if (pr) return pairLevel(e, pr); } return avgLv(S); };
  const lvl = (u) => levelOf(u);
  const rand = rng((baseSeed ^ (upto * 7919)) >>> 0);
  let best = null, bestCost = Infinity;
  for (let t = 0; t < 10; t++) {
    const byGames = shuffle(units.slice(), rand).sort((a, b) => b.reduce((s, p) => s + gOf(p), 0) - a.reduce((s, p) => s + gOf(p), 0));
    const bench = byGames.slice(0, units.length - nSlot);
    const slots = shuffle(units.filter((u) => !bench.includes(u)), rand).sort((a, b) => lvl(b) - lvl(a));
    const arr = slots.concat(bench);
    const costAt = (k) => {
      if (k >= nSlot) return sitCost(arr[k]);
      const m = Math.floor(k / 2) * 2;
      return pMatchCost(H, tol, avoid, arr[m], arr[m + 1], byPair, levelOf);
    };
    let cur = 0;
    for (let m = 0; m < nSlot; m += 2) cur += costAt(m);
    for (let k = nSlot; k < arr.length; k++) cur += costAt(k);
    let local = arr.slice(), localCost = cur;
    const N = 3500;
    for (let it = 0; it < N; it++) {
      const i = Math.floor(rand() * arr.length), j = Math.floor(rand() * arr.length);
      if (i === j || (i >= nSlot && j >= nSlot)) continue;
      const touch = (k) => (k < nSlot ? Math.floor(k / 2) * 2 : k);
      if (touch(i) === touch(j)) continue;
      const keys = [...new Set([touch(i), touch(j)])];
      const before = keys.reduce((s, k) => s + costAt(k), 0);
      [arr[i], arr[j]] = [arr[j], arr[i]];
      const after = keys.reduce((s, k) => s + costAt(k), 0);
      const T = 6 * (1 - it / N);
      if (after <= before || rand() < Math.exp(-(after - before) / Math.max(T, 0.01))) {
        cur += after - before;
        if (cur < localCost - 1e-9) { localCost = cur; local = arr.slice(); }
      } else [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (localCost < bestCost) { bestCost = localCost; best = local; }
  }
  const matches = [];
  for (let m = 0; m < nSlot; m += 2) matches.push({ id: uid(), a: best[m].map((p) => p.id), b: best[m + 1].map((p) => p.id), g: [], win: null });
  const avg = (m) => (sideLevel(e, m.a) + sideLevel(e, m.b)) / 2;
  matches.sort((x, y) => avg(y) - avg(x));
  return { matches, bench: best.slice(nSlot).flat().map((p) => p.id).concat(leftover), leftover };
}
/* 固定ペアの片方が休むときの相方の候補(待機中の人から、ランクと学校が近い順) */
function partnerCandidates(e, forId, pool) {
  const pm = playerMap(e), me = pm[forId];
  return pool.filter((id) => id !== forId && pm[id]).map((id) => pm[id])
    .sort((x, y) => (((x.school || "").trim() === (me.school || "").trim() ? 0 : 100) + Math.abs(x.level - me.level)) - (((y.school || "").trim() === (me.school || "").trim() ? 0 : 100) + Math.abs(y.level - me.level)));
}
function pCum(e) {
  const out = [], cnt = {};
  e.practice.rounds.forEach((r) => { pPlaced(r).forEach((id) => (cnt[id] = (cnt[id] || 0) + 1)); out.push({ ...cnt }); });
  return out;
}
function pIssues(e, ri) {
  const r = e.practice.rounds[ri], pm = playerMap(e), tol = e.practice.tol, H = pHistory(e, ri);
  const nm = (id) => (pm[id] ? pm[id].name || "(名前なし)" : "—");
  const placed = pPlaced(r), cnt = {};
  placed.forEach((id) => (cnt[id] = (cnt[id] || 0) + 1));
  const dup = Object.keys(cnt).filter((id) => cnt[id] > 1);
  const dayCnt = {};
  e.practice.rounds.slice(0, ri + 1).filter((x) => x.day === r.day).forEach((x) => pPlaced(x).forEach((id) => (dayCnt[id] = (dayCnt[id] || 0) + 1)));
  const per = r.matches.map((m) => {
    const out = [];
    const A = m.a.filter(Boolean), B = m.b.filter(Boolean);
    const both = A.concat(B);
    if (A.length < m.a.length || B.length < m.b.length) out.push({ lv: "warn", t: "空き枠:入れる人を、下の置き場からここへドラッグ" });
    both.filter((id, i) => both.indexOf(id) !== i || dup.includes(id)).forEach((id) => out.push({ lv: "err", t: `${nm(id)} が同じ回転に2回入っています` }));
    if (A.length && B.length) {
      const d = Math.abs(sideLevel(e, A) - sideLevel(e, B));
      if (d > tol) out.push({ lv: "warn", t: `ランク差 ${Math.round(d * 10) / 10}(設定は${tol === 0 ? "同じランクだけ" : `前後${tol}まで`})` });
      if (e.practice.avoidSchool) {
        const same = [];
        A.forEach((x) => B.forEach((y) => { if (pm[x] && pm[y] && (pm[x].school || "").trim() && pm[x].school.trim() === (pm[y].school || "").trim()) same.push(`${nm(x)} と ${nm(y)}`); }));
        if (same.length) out.push({ lv: "info", t: `同じ学校どうし:${same.join("、")}` });
      }
      A.forEach((x) => B.forEach((y) => { const f = H.faced[keyOf(x, y)]; if (f) out.push({ lv: "dup", t: `${f.includes(H.prev) ? "続けてかぶり" : "かぶり"}:${nm(x)} と ${nm(y)} は第${f.join("・第")}回転でも対戦` }); }));
    }
    [A, B].forEach((S) => { if (S.length === 2) {
      const reg = e.pairs.some((p) => (p.a === S[0] && p.b === S[1]) || (p.a === S[1] && p.b === S[0]));
      if (!reg) { const f = H.partner[keyOf(S[0], S[1])]; if (f) out.push({ lv: "warn", t: `${nm(S[0])}・${nm(S[1])} は第${f[0]}回転でもペア` }); }
      if (pm[S[0]] && pm[S[1]] && (pm[S[0]].school || "").trim() !== (pm[S[1]].school || "").trim()) out.push({ lv: "info", t: `別の学校どうしのペア:${schoolsOf(pm[S[0]], pm[S[1]])}` });
    } });
    both.filter((id, i) => both.indexOf(id) === i && dayCnt[id] > e.maxPerDay).forEach((id) => out.push({ lv: "warn", t: `${nm(id)} は${r.day}日目に${dayCnt[id]}試合目(上限${e.maxPerDay})` }));
    return out;
  });
  const unplaced = e.players.filter((p) => !placed.includes(p.id) && !r.rest.includes(p.id)).map((p) => p.id);
  return { per, dup, unplaced, resting: r.rest.filter((id) => pm[id]) };
}
/* 成績。個人ごと(pStats)とペアごと(pairStats) */
function pStats(e) {
  const rounds = e.practice.rounds;
  const days = [...new Set(rounds.map((r) => r.day))].sort((a, b) => a - b);
  const rate = (w, l) => (w + l ? Math.round((w / (w + l)) * 100) : null);
  const rows = e.players.map((p) => {
    const byR = rounds.map((r) => (pPlaced(r).includes(p.id) ? "play" : r.rest.includes(p.id) ? "rest" : "none"));
    let games = 0, w = 0, l = 0;
    const day = {};
    days.forEach((d) => (day[d] = { g: 0, w: 0, l: 0 }));
    rounds.forEach((r) => r.matches.forEach((m) => {
      const side = m.a.includes(p.id) ? "a" : m.b.includes(p.id) ? "b" : null;
      if (!side) return;
      games++; day[r.day].g++;
      const o = pOutcome(e, m);
      if (o.winner) { if (o.winner === side) { w++; day[r.day].w++; } else { l++; day[r.day].l++; } }
    }));
    let prev = null;
    days.forEach((d) => { const x = day[d]; x.rate = rate(x.w, x.l); x.delta = x.rate != null && prev != null ? x.rate - prev : null; if (x.rate != null) prev = x.rate; });
    return { p, byR, games, w, l, rate: rate(w, l), day };
  });
  return { rows, days };
}
function pairStats(e) {
  const map = new Map();
  e.practice.rounds.forEach((r) => r.matches.forEach((m) => ["a", "b"].forEach((s) => {
    const ids = m[s].filter(Boolean);
    if (ids.length !== 2) return;
    const key = ids.slice().sort().join("+");
    const row = map.get(key) || { ids, games: 0, w: 0, l: 0 };
    const o = pOutcome(e, m);
    row.games++;
    if (o.winner) { if (o.winner === s) row.w++; else row.l++; }
    map.set(key, row);
  })));
  return [...map.values()].map((x) => ({ ...x, rate: x.w + x.l ? Math.round((x.w / (x.w + x.l)) * 100) : null }));
}
function totals(e) {
  let finished = 0, total = 0;
  if (e.mode === "practice") { e.practice.rounds.forEach((r) => r.matches.forEach((m) => { total++; if (pOutcome(e, m).winner) finished++; })); return { finished, total }; }
  if (e.mode === "league") e.leagues.forEach((l) => { const s = standings(e, l); finished += s.finished; total += s.total; });
  if (e.mode === "tournament") { const st = bracketState(e); if (st) bracketMatches(st).forEach((n) => { total++; if (n.o && n.o.winner) finished++; }); }
  return { finished, total };
}

/* ---------- 保存データの形(v2)と、古い形からの移し替え ---------- */
const SCHEMA = 2;
function blankEvent(over) {
  return Object.assign({
    v: SCHEMA, name: "名前なし", date: today(), mode: "league", type: "singles", games: 1, points: 21, maxPerDay: 6,
    groupSize: 4, splitMethod: "level", spreadSchools: true, tolerance: 0, tTop: 2, tThird: true,
    players: [], pairs: [], leagues: [], results: {}, bracket: null, seeds: {},
    practice: { tol: 1, avoidSchool: true, pairMode: "rotate", kind: "singles", dayOff: [], rounds: [] }, updatedAt: 0,
  }, over || {});
}
/* 古い形(v1)や、v2 の読み込み。どちらも v2 を返す。元のオブジェクトは変えない */
function migrate(raw) {
  raw = clone(raw || {});
  if (raw.v === SCHEMA) return normalize2(raw);
  const old = raw;
  const ev = blankEvent({ id: old.id, name: old.name || "名前なし", date: old.date || today(), updatedAt: old.updatedAt || 0 });
  // 形式。「リーグ戦→決勝トーナメント(both)」は廃止:リーグ戦として開く(決勝の表は legacyBracket に残す)
  let mode = ["league", "tournament", "both", "practice"].includes(old.mode) ? old.mode : null;
  const hasL = old.leagues && old.leagues.length, hasB = !!(old.bracket && Array.isArray(old.bracket.slots));
  if (!mode) mode = hasB && (hasL || old.tSource === "league") ? "both" : hasB ? "tournament" : "league";
  if (mode === "both") { ev.legacyBracket = old.bracket || null; mode = "league"; }
  ev.mode = mode;
  ev.type = old.type === "doubles" && mode !== "practice" ? "doubles" : "singles";
  ev.games = old.games === 3 ? 3 : 1;
  ev.points = [11, 15, 21].includes(old.points) ? old.points : 21;
  ev.maxPerDay = clamp(parseInt(old.maxPerDay, 10) || 6, 1, 12);
  ev.groupSize = clamp(parseInt(old.groupSize, 10) || 4, 3, 8);
  ev.splitMethod = old.splitMethod === "balanced" || old.splitMethod === "level" ? old.splitMethod : "level";
  ev.spreadSchools = old.spreadSchools !== false;
  ev.tolerance = clamp(parseInt(old.tolerance, 10) || 0, 0, 4);
  ev.tTop = clamp(parseInt(old.tTop, 10) || 2, 1, 4);
  ev.tThird = old.tThird !== false;
  const lvl = (v) => clamp(parseInt(v, 10) || 3, 1, 10);
  const oldPlayers = (Array.isArray(old.players) ? old.players : []).filter((p) => p && p.id);
  const needTo5 = old.rankScale !== RANK_MAX && oldPlayers.some((p) => lvl(p.level) > RANK_MAX);
  const L = (p) => { const v = lvl(p.level); return clamp(needTo5 ? to5(v) : v, 1, RANK_MAX); };
  const dbl = ev.type === "doubles";
  const idMap = {}; // 旧 player id -> 新しい entry id(ダブルスはペアid = 旧id のまま。結果のキーが変わらない)
  oldPlayers.forEach((p) => {
    const sid = String(p.id), name = String(p.name || ""), school = String(p.school || "");
    if (!dbl) { ev.players.push({ id: sid, name, school, level: L(p) }); return; }
    const [s1, s2] = school.includes("・") ? school.split("・").map((x) => x.trim()) : [school, school];
    const a = { id: sid + "-1", name, school: s1, level: L(p) }, b = { id: sid + "-2", name: String(p.name2 || ""), school: s2 || s1, level: L(p) };
    ev.players.push(a, b);
    ev.pairs.push({ id: sid, a: a.id, b: b.id, level: null });
    idMap[sid] = sid;
  });
  const entryIds = new Set(dbl ? ev.pairs.map((x) => x.id) : ev.players.map((x) => x.id));
  const pids = new Set(ev.players.map((p) => p.id));
  const seen = new Set();
  ev.leagues = (Array.isArray(old.leagues) ? old.leagues : []).filter((l) => l && typeof l === "object").map((l) => ({
    id: String(l.id || uid()), ids: (l.playerIds || []).map(String).filter((id) => entryIds.has(id) && !seen.has(id) && seen.add(id)),
  }));
  ev.results = old.results && typeof old.results === "object" ? old.results : {};
  const usedSeed = new Set();
  Object.entries(old.seeds && typeof old.seeds === "object" ? old.seeds : {}).forEach(([id, s]) => {
    const n = parseInt(s, 10);
    if (entryIds.has(id) && n >= 1 && !usedSeed.has(n)) { ev.seeds[id] = n; usedSeed.add(n); }
  });
  const bs = old.bracket && Array.isArray(old.bracket.slots) ? old.bracket.slots.length : 0;
  if (mode === "tournament" && bs >= 2 && (bs & (bs - 1)) === 0) {
    ev.bracket = {
      slots: old.bracket.slots.map((x) => (x && entryIds.has(String(x)) ? String(x) : null)),
      results: old.bracket.results && typeof old.bracket.results === "object" ? old.bracket.results : {},
      seeds: old.bracket.seeds && typeof old.bracket.seeds === "object" ? old.bracket.seeds : {},
    };
  }
  // 練習試合
  const pr = old.practice && typeof old.practice === "object" ? old.practice : {};
  const tol = parseInt(pr.tol, 10);
  const idsAll = pids;
  const side = (arr, n) => Array.from({ length: n }, (_, i) => { const id = Array.isArray(arr) ? arr[i] : null; return id && idsAll.has(String(id)) ? String(id) : null; });
  const seenP = new Set();
  const addPair = ([a, b]) => {
    a = String(a); b = String(b);
    if (!a || !b || a === b || !idsAll.has(a) || !idsAll.has(b) || seenP.has(a) || seenP.has(b)) return;
    seenP.add(a); seenP.add(b); ev.pairs.push({ id: uid(), a, b, level: null });
  };
  if (mode === "practice") {
    (Array.isArray(pr.locked) ? pr.locked : []).forEach((x) => Array.isArray(x) && addPair(x));
    (Array.isArray(pr.pairs) ? pr.pairs : []).forEach((x) => Array.isArray(x) && addPair(x));
    ev.practice = {
      tol: Number.isNaN(tol) ? 1 : clamp(tol, 0, RANK_MAX - 1), avoidSchool: pr.avoidSchool !== false,
      pairMode: pr.pairMode === "fixed" ? "fixed" : "rotate", kind: pr.kind === "doubles" ? "doubles" : "singles",
      dayOff: (Array.isArray(pr.dayOff) ? pr.dayOff : []).filter((x) => x && idsAll.has(String(x.id)))
        .map((x) => ({ id: String(x.id), from: x.fromId ? Math.max(0, (pr.rounds || []).findIndex((r) => r.id === x.fromId)) : Math.max(0, parseInt(x.from, 10) || 0) })),
      rounds: (Array.isArray(pr.rounds) ? pr.rounds : []).filter((r) => r && typeof r === "object").map((r) => {
        const kind = r.kind === "doubles" ? "doubles" : "singles", n = kind === "doubles" ? 2 : 1;
        return {
          id: String(r.id || uid()), day: clamp(parseInt(r.day, 10) || 1, 1, 30), kind, fixed: kind === "doubles" && !!r.fixed,
          rest: [...new Set((Array.isArray(r.rest) ? r.rest : []).map(String).filter((id) => idsAll.has(id)))],
          matches: (Array.isArray(r.matches) ? r.matches : []).filter((m) => m && typeof m === "object").map((m) => ({
            id: String(m.id || uid()), a: side(m.a, n), b: side(m.b, n),
            g: (Array.isArray(m.g) ? m.g : []).slice(0, 3).map((x) => [x && x[0] != null ? Number(x[0]) : null, x && x[1] != null ? Number(x[1]) : null]),
            win: m.win === "a" || m.win === "b" ? m.win : null,
          })),
        };
      }),
    };
    // 1ゲーム時代の練習試合: 3ゲームマッチ(15点)に一度だけ切り替える
    if (!pr.fmt3b && ev.games !== 3) {
      const ms = ev.practice.rounds.flatMap((r) => r.matches);
      const realPts = ms.some((m) => m.g.some((x) => (x[0] || 0) > 2 || (x[1] || 0) > 2));
      ms.forEach((m) => {
        const x = m.g[0];
        const done = x && x[0] != null && x[1] != null && x[0] !== x[1];
        if (done) m.win = x[0] > x[1] ? "a" : "b";
        if (!done || Math.max(x[0], x[1]) <= 2) m.g = []; else m.g = [x];
      });
      ev.games = 3;
      if (!realPts) ev.points = 15;
    }
  }
  ev.legacy = { v: 1 }; // 移し替え済みの印
  return normalize2(ev);
}
/* v2 を整える(壊れた参照を捨てる)。何度かけても同じ結果 */
function normalize2(ev) {
  const base = blankEvent();
  const e = Object.assign(base, ev);
  e.v = SCHEMA;
  e.mode = ["league", "tournament", "practice"].includes(e.mode) ? e.mode : "league";
  e.type = e.mode !== "practice" && e.type === "doubles" ? "doubles" : "singles";
  e.games = e.games === 3 ? 3 : 1;
  e.points = [11, 15, 21].includes(e.points) ? e.points : 21;
  e.players = (Array.isArray(e.players) ? e.players : []).filter((p) => p && p.id).map((p) => ({ id: String(p.id), name: String(p.name || ""), school: String(p.school || ""), level: clamp(parseInt(p.level, 10) || 3, 1, RANK_MAX) }));
  const pids = new Set(e.players.map((p) => p.id)), used = new Set();
  e.pairs = (Array.isArray(e.pairs) ? e.pairs : []).filter((x) => x && x.id && pids.has(x.a) && pids.has(x.b) && x.a !== x.b && !used.has(x.a) && !used.has(x.b) && used.add(x.a) && used.add(x.b))
    .map((x) => ({ id: String(x.id), a: x.a, b: x.b, level: x.level == null ? null : clamp(Number(x.level) || 3, 1, RANK_MAX) }));
  const eids = new Set(entries(e).map((x) => x.id));
  e.leagues = (Array.isArray(e.leagues) ? e.leagues : []).map((l) => ({ id: String(l.id || uid()), ids: (l.ids || []).filter((id) => eids.has(id)) }));
  const pr = e.practice || {};
  e.practice = Object.assign(blankEvent().practice, pr);
  e.practice.rounds = (e.practice.rounds || []).map((r) => ({ ...r, rest: (r.rest || []).filter((id) => pids.has(id)) }));
  return e;
}

return {
  RANK_MAX, LETTERS, clamp, clone, uid, to5, today, rng, shuffle, keyOf, isEmptyGames,
  playerMap, pairMap, pairOfPlayer, partnerOf, schoolsOf, pairLevel, roundHalf, isCrossSchool, makePair, removePair,
  isDbl, entries, entryMap, unpairedPlayers, unitWord, letter,
  dupCost, planSizes, groupSizesFor, autoAssign, leagueIndexOf, unassigned, moveToLeague,
  roundRobin, matchCount, dayCount, splitDays,
  gamesOf, setScore, setWo, setWin, woOf, winOf, outcomeOf, outcome, extraGame, gameWarn, scoreCap, cleanResult,
  standings, rankTiers,
  seedPositions, roundName, bracketEntries, buildBracket, bracketState, bracketMatches, findNode, setBScore, setBWo, setBWin, swapSlots,
  sideIds, sideLevel, pOutcome, pPlaced, pHistory, pMatchCost, tempPairs, autoPairs, keptAt, genRound, partnerCandidates, pCum, pIssues, pStats, pairStats, totals,
  SCHEMA, blankEvent, migrate, normalize2,
};
})();
if (typeof module !== "undefined") module.exports = Core;
