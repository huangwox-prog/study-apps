// テスト用の偽 Supabase(メモリと localStorage だけで動く)
(() => {
  const DB0 = JSON.parse(localStorage.getItem("__mockdb") || '{"events":[],"backups":[],"roster":[],"users":{"t@example.com":{"id":"u-1","pw":"password1"}}}');
  const DB = Object.assign({ roster: [], shares: [] }, DB0);
  const persist = () => localStorage.setItem("__mockdb", JSON.stringify(DB));
  window.__mockdb = DB;
  let session = JSON.parse(localStorage.getItem("__mocksess") || "null");
  const subs = [];
  let tries = 0;
  const emit = (ev, s) => subs.forEach((f) => f(ev, s));
  const q = (table) => {
    const st = { table, filters: [], op: "select" };
    const run = async () => {
      let rows = DB[table].filter((r) => st.filters.every(([k, v]) => r[k] === v));
      if (st.op === "update") { rows.forEach((r) => Object.assign(r, st.patch)); persist(); return { data: null, error: null }; }
      if (st.op === "delete") { DB[table] = DB[table].filter((r) => !rows.includes(r)); persist(); return { data: null, error: null }; }
      const pick = (r) => (table === "shares" ? { code: r.code, enabled: r.enabled } : { id: r.id, data: r.data });
      if (st.single) return { data: rows[0] ? pick(rows[0]) : null, error: null };
      return { data: rows.map(pick), error: null };
    };
    const b = {
      select() { return b; }, eq(k, v) { st.filters.push([k, v]); return b; },
      maybeSingle() { st.single = true; return run(); },
      delete() { st.op = "delete"; return b; },
      update(patch) { st.op = "update"; st.patch = patch; return b; },
      async upsert(row) { const i = DB[table].findIndex((r) => r.user_id === row.user_id && r.id === row.id); if (i >= 0) DB[table][i] = row; else DB[table].push(row); persist(); return { error: null }; },
      then(res, rej) { return run().then(res, rej); },
    };
    return b;
  };
  window.supabase = { createClient: () => ({
    from: (t) => { const b = q(t); if (t === "shares" && session) b.eq("user_id", session.user.id); return b; },
    // 生徒用コードの関数(supabase/share.sql と同じ決まり)
    async rpc(fn, a) {
      const find = (c) => { if (tries >= 10) throw new Error("too many tries"); const s = /^[0-9]{8}$/.test(c) && DB.shares.find((x) => x.code === c && x.enabled); if (!s) tries++; return s; };
      const get = (c) => { const s = find(c); if (!s) return null; const ev = DB.events.find((r) => r.user_id === s.user_id && r.id === s.event_id); const d = ev && ev.data; if (!d || d.mode !== "practice") return null;
        return JSON.parse(JSON.stringify({ name: d.name, date: d.date, games: d.games, points: d.points, players: d.players.map((p) => ({ id: p.id, name: p.name, school: p.school })),
          rounds: d.practice.rounds.map((r) => ({ id: r.id, day: r.day, matches: r.matches.map((m) => ({ id: m.id, ct: m.ct, a: m.a, b: m.b, g: m.g || [], win: m.win })) })), updatedAt: d.updatedAt })); };
      try {
        if (fn === "share_create") { if (!session) throw new Error("login required"); const uid = session.user.id; if (!DB.events.some((r) => r.user_id === uid && r.id === a.p_event)) throw new Error("event not found");
          DB.shares = DB.shares.filter((x) => !(x.user_id === uid && x.event_id === a.p_event)); let c; do c = String(Math.floor(Math.random() * 1e8)).padStart(8, "0"); while (DB.shares.some((x) => x.code === c));
          DB.shares.push({ code: c, user_id: uid, event_id: a.p_event, enabled: true }); persist(); return { data: c, error: null }; }
        if (fn === "share_get") return { data: get(a.p_code), error: null };
        if (fn === "share_score") { const s = find(a.p_code); if (!s) return { data: null, error: null }; const ev = DB.events.find((r) => r.user_id === s.user_id && r.id === s.event_id);
          const r = ev.data.practice.rounds.find((x) => x.id === a.p_round); if (!r) throw new Error("round not found"); const m = r.matches.find((x) => x.id === a.p_mid); if (!m) throw new Error("match not found");
          const d = ev.data, pts = d.points || 21, ng = d.games === 3 ? 3 : 1, cap = pts === 21 ? 30 : pts === 15 ? 21 : 15;
          if (!Array.isArray(a.p_g) || !a.p_g.length || a.p_g.length > ng) throw new Error("bad score");
          for (const g of a.p_g) {
            if (!Array.isArray(g) || g.length !== 2 || g.some((v) => v !== null && !(Number.isInteger(v) && v >= 0 && v <= cap))) throw new Error("bad score");
            if (g[0] != null && g[1] != null) { const hi = Math.max(...g), lo = Math.min(...g); if ((hi === lo && hi >= cap) || (hi > pts && hi - lo > 2)) throw new Error("bad score"); }
          }
          m.g = a.p_g; m.win = null; ev.data.updatedAt = Date.now(); persist(); return { data: get(a.p_code), error: null }; }
        return { data: null, error: { message: "unknown function" } };
      } catch (e) { return { data: null, error: { message: e.message } }; }
    },
    channel: () => { const c = { on: () => c, subscribe: () => c }; return c; },
    auth: {
      onAuthStateChange(f) { subs.push(f); setTimeout(() => f("INITIAL_SESSION", session), 0); return { data: { subscription: { unsubscribe() {} } } }; },
      async getSession() { return { data: { session } }; },
      async signInWithPassword({ email, password }) { const u = DB.users[email]; if (!u || u.pw !== password) return { error: { message: "Invalid login credentials" } }; session = { user: { id: u.id, email } }; localStorage.setItem("__mocksess", JSON.stringify(session)); emit("SIGNED_IN", session); return { data: { session }, error: null }; },
      async signUp({ email }) { if (DB.users[email]) return { data: {}, error: { message: "User already registered" } }; return { data: { session: null }, error: null }; },
      async resetPasswordForEmail() { return { error: null }; },
      async updateUser() { return { error: null }; },
      async signOut() { session = null; localStorage.removeItem("__mocksess"); emit("SIGNED_OUT", null); },
    },
  }) };
})();
