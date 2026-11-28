// テスト用:mock-server.cjs につなぐ偽の Supabase(何台のブラウザからでも同じデータ)
(() => {
  const SKEY = "__rsess";
  let session = JSON.parse(localStorage.getItem(SKEY) || "null");
  const subs = [];
  const emit = (ev, s) => subs.forEach((f) => f(ev, s));
  const hdr = () => ({ "content-type": "application/json", "x-test-user": session ? session.user.id : "" });
  const post = (url, body) => fetch(url, { method: "POST", headers: hdr(), body: JSON.stringify(body) }).then((r) => r.json());
  const q = (table) => {
    const st = { table, filters: [], op: "select" };
    const run = () => post("/api/q", st).then((r) => ({ data: r.data, error: r.error }));
    const b = {
      select() { return b; },
      eq(k, v) { if (k !== "user_id") st.filters.push([k, v]); return b; },
      maybeSingle() { st.single = true; return run(); },
      delete() { st.op = "delete"; return b; },
      update(patch) { st.op = "update"; st.patch = patch; return b; },
      upsert(row) { st.op = "upsert"; st.row = row; return run(); },
      then(res, rej) { return run().then(res, rej); },
    };
    return b;
  };
  window.supabase = {
    createClient: () => ({
      from: q,
      rpc: (fn, args) => post("/api/rpc", { fn, args }).then((r) => ({ data: r.data, error: r.error })),
      // リアルタイムのかわり:1秒ごとに変わった行を聞きに行き、UPDATE として知らせる(本物と同じく、自分の保存も届く)
      channel: () => {
        const hs = [];
        const c = {
          on: (_t, filt, h) => { if (filt.event === "UPDATE" && filt.table === "events") hs.push(h); return c; },
          subscribe: (cb) => {
            let since = Date.now();
            setInterval(async () => {
              if (!session) return;
              try {
                const r = await fetch("/api/changes?since=" + since, { headers: hdr() }).then((x) => x.json());
                since = r.now;
                r.rows.forEach((row) => hs.forEach((h) => h({ new: row })));
              } catch (e) {}
            }, 1000);
            if (cb) cb("SUBSCRIBED");
            return c;
          },
        };
        return c;
      },
      auth: {
        onAuthStateChange(f) { subs.push(f); setTimeout(() => f("INITIAL_SESSION", session), 0); return { data: { subscription: { unsubscribe() {} } } }; },
        async getSession() { return { data: { session } }; },
        async signInWithPassword({ email, password }) {
          const r = await post("/api/login", { email, password });
          if (r.error) return { error: { message: r.error } };
          session = { user: r.user };
          localStorage.setItem(SKEY, JSON.stringify(session));
          emit("SIGNED_IN", session);
          return { data: { session }, error: null };
        },
        async signUp() { return { data: { session: null }, error: null }; },
        async resetPasswordForEmail() { return { error: null }; },
        async updateUser() { return { error: null }; },
        async signOut() { session = null; localStorage.removeItem(SKEY); emit("SIGNED_OUT", null); },
      },
    }),
  };
})();
