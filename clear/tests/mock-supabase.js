// テスト用の偽 Supabase(メモリと localStorage だけで動く)
(() => {
  const DB0 = JSON.parse(localStorage.getItem("__mockdb") || '{"events":[],"backups":[],"roster":[],"users":{"t@example.com":{"id":"u-1","pw":"password1"}}}');
  const DB = Object.assign({ roster: [] }, DB0);
  const persist = () => localStorage.setItem("__mockdb", JSON.stringify(DB));
  window.__mockdb = DB;
  let session = JSON.parse(localStorage.getItem("__mocksess") || "null");
  const subs = [];
  const emit = (ev, s) => subs.forEach((f) => f(ev, s));
  const q = (table) => {
    const st = { table, filters: [], op: "select" };
    const run = async () => {
      let rows = DB[table].filter((r) => st.filters.every(([k, v]) => r[k] === v));
      if (st.op === "delete") { DB[table] = DB[table].filter((r) => !rows.includes(r)); persist(); return { data: null, error: null }; }
      if (st.single) return { data: rows[0] ? { id: rows[0].id, data: rows[0].data } : null, error: null };
      return { data: rows.map((r) => ({ id: r.id, data: r.data })), error: null };
    };
    const b = {
      select() { return b; }, eq(k, v) { st.filters.push([k, v]); return b; },
      maybeSingle() { st.single = true; return run(); },
      delete() { st.op = "delete"; return b; },
      async upsert(row) { const i = DB[table].findIndex((r) => r.user_id === row.user_id && r.id === row.id); if (i >= 0) DB[table][i] = row; else DB[table].push(row); persist(); return { error: null }; },
      then(res, rej) { return run().then(res, rej); },
    };
    return b;
  };
  window.supabase = { createClient: () => ({
    from: q,
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
