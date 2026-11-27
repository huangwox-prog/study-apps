/* ============================================================
   CLEAR ログインとクラウド保存 (cloud) — 公開ページ(GitHub Pages)だけで使う
   - SUPABASE_URL と SUPABASE_ANON_KEY が空のあいだは何もしない(今までどおりこの端末に保存)
   - 入れると、ログインしないと使えなくなり、データは Supabase の events 表に保存される
   - claude.ai 版には入れない(build で外している)
   ============================================================ */
(() => {
"use strict";
/* ここに Supabase の「Project URL」と「anon public」キーを貼る。
   anon キーは公開してよいキー(表ごとの RLS で守る)。service_role キーは絶対に貼らない */
const SUPABASE_URL = "https://wcpksigsukcpljazeomp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_L9oVlsQcfcsvBp7u6igWlw_-dNfnobY";
/* true のあいだは、ログイン画面に「ログインせずに使う」を出す(今までの使い方。データはその端末だけ)。
   前から使っている人が締め出されないようにするための一時的な入口。有料だけにするときに false にする */
const ALLOW_GUEST = true;
const GUEST_KEY = "clear-guest";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const inClaude = !!(window.claude && typeof window.claude.use === "function");
const here = () => location.origin + location.pathname;

const CSS = `
.auth-wrap{min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px 16px}
.auth-card{width:100%;max-width:420px;display:flex;flex-direction:column;gap:14px}
.auth-card h2{margin:0;font-size:1.4rem;letter-spacing:-.02em}
.auth-card .btn{width:100%}
.auth-brand{display:flex;align-items:center;gap:8px;font-weight:800;letter-spacing:.06em}
.auth-links{display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center}
.auth-msg{font-size:.86rem;padding:8px 12px;border-radius:12px;background:var(--surface-soft);color:var(--text-secondary)}
.auth-msg.err{background:var(--error-soft);color:var(--error)}.auth-msg.ok{background:var(--success-soft);color:var(--success)}
.auth-guest{display:flex;flex-direction:column;gap:6px;padding-top:12px;border-top:1px solid var(--hairline);text-align:center}
.account-box{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-top:8px}
`;

/* Supabase のエラーを日本語に */
function jaError(err) {
  const m = String((err && (err.message || err.error_description)) || err || "");
  if (/Invalid login credentials/i.test(m)) return "メールアドレスかパスワードが違います";
  if (/Email not confirmed/i.test(m)) return "メールの確認がまだです。届いたメールのリンクを押してください";
  if (/already registered|already been registered|User already exists/i.test(m)) return "このメールアドレスはもう登録されています。ログインしてください";
  if (/Password should be at least/i.test(m)) return "パスワードは8文字以上にしてください";
  if (/weak|pwned/i.test(m)) return "このパスワードは弱すぎます。別のものにしてください";
  if (/rate limit|too many/i.test(m)) return "短い時間に何度も送られました。少し待ってからやり直してください";
  if (/invalid.*email|Unable to validate email/i.test(m)) return "メールアドレスの形が正しくありません";
  if (/Failed to fetch|NetworkError|network/i.test(m)) return "つながりませんでした。電波の状態を確かめてください";
  if (/same.*password|different from the old/i.test(m)) return "前と同じパスワードは使えません";
  return "うまくいきませんでした(" + m + ")";
}

/* Store が使う形(collection / doc / get / set / delete / onSnapshot)で Supabase の表を読み書きする */
function makeDb(client, uid) {
  const fetchRow = async (table, id) => {
    const { data, error } = await client.from(table).select("id,data").eq("user_id", uid).eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  };
  return {
    collection(table) {
      return {
        async get() {
          const { data, error } = await client.from(table).select("id,data").eq("user_id", uid);
          if (error) throw error;
          return { docs: (data || []).map((r) => ({ id: r.id, exists: true, data: () => r.data })) };
        },
        doc(id) {
          return {
            async get() { const r = await fetchRow(table, id); return { exists: !!r, data: () => (r ? r.data : undefined) }; },
            async set(obj) {
              const { error } = await client.from(table).upsert({ user_id: uid, id, data: obj, updated_at: new Date().toISOString() }, { onConflict: "user_id,id" });
              if (error) throw error;
            },
            async delete() {
              const { error } = await client.from(table).delete().eq("user_id", uid).eq("id", id);
              if (error) throw error;
            },
          };
        },
        /* ほかの端末で変えたら、こちらにも映す。大きいデータは通知に中身が載らないことがあるので、そのときは読み直す */
        onSnapshot(cb, onErr) {
          const send = async (type, row) => {
            if (!row || !row.id) return;
            let data = row.data;
            if (type !== "removed" && (data === undefined || data === null)) {
              try { const r = await fetchRow(table, row.id); if (!r) return; data = r.data; } catch (e) { return; }
            }
            cb({ docChanges: () => [{ type, doc: { id: row.id, data: () => data } }] });
          };
          client.channel("clear-" + table + "-" + uid)
            .on("postgres_changes", { event: "INSERT", schema: "public", table, filter: "user_id=eq." + uid }, (p) => send("added", p.new))
            .on("postgres_changes", { event: "UPDATE", schema: "public", table, filter: "user_id=eq." + uid }, (p) => send("modified", p.new))
            // 削除の通知は絞り込みが効かないので、自分の行かどうかをここで確かめる
            .on("postgres_changes", { event: "DELETE", schema: "public", table }, (p) => { if (p.old && p.old.user_id === uid) send("removed", p.old); })
            .subscribe((status) => { if (status === "CHANNEL_ERROR" && onErr) onErr(); });
        },
      };
    },
  };
}

const Cloud = (window.Cloud = {
  configured: !inClaude && !!(SUPABASE_URL && SUPABASE_ANON_KEY),
  allowGuest: ALLOW_GUEST,
  client: null, user: null, profile: null, guest: false,
  isGuestSaved() { try { return localStorage.getItem(GUEST_KEY) === "1"; } catch (e) { return false; } },
  /* ログインせずに使う人が、ホームからログインに切り替える */
  goLogin() { try { localStorage.removeItem(GUEST_KEY); } catch (e) {} location.reload(); },

  /* ログインが済むまで待って、Store 用の db を返す。使えないときは null(この端末に保存) */
  async start() {
    if (!this.configured) return null;
    if (!window.supabase || typeof window.supabase.createClient !== "function") return null; // 部品を読めなかった(電波なしなど)
    const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    const client = (this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }));
    let recovering = /type=recovery/.test(location.hash);
    return new Promise((resolve) => {
      let done = false;
      UI.guest = () => { if (done) return; done = true; this.guest = true; try { localStorage.setItem(GUEST_KEY, "1"); } catch (e) {} resolve(null); };
      const finish = (session) => {
        if (done || !session) return;
        done = true; this.user = session.user;
        if (location.hash && /access_token|type=/.test(location.hash)) history.replaceState(null, "", here() + location.search);
        resolve(makeDb(client, session.user.id));
      };
      client.auth.onAuthStateChange((event, session) => {
        // この中で Supabase の別の呼び出しを待つと止まることがあるので、次の順番に回す
        setTimeout(() => {
          if (event === "PASSWORD_RECOVERY") { recovering = true; UI.show("newpass"); return; }
          if (event === "SIGNED_OUT") { if (done) location.reload(); else UI.show("login"); return; }
          if (session && !recovering) finish(session);
        }, 0);
      });
      client.auth.getSession().then(({ data }) => {
        if (recovering) { UI.show("newpass"); return; }
        if (data && data.session) finish(data.session);
        else if (ALLOW_GUEST && this.isGuestSaved()) UI.guest(); // 前に「ログインせずに使う」を選んだ端末は、そのまま開く
        else UI.show("login");
      }).catch(() => UI.show("login"));
    });
  },

  async signOut() {
    if (!this.client) return;
    try { await this.client.auth.signOut(); } catch (e) {}
    location.reload();
  },

  /* 有料会員かどうか(Stripe をつないだあとで使う。今は読むだけ) */
  async loadProfile() {
    if (!this.client || !this.user) return null;
    const { data } = await this.client.from("profiles").select("is_subscribed,subscription_status,current_period_end").eq("id", this.user.id).maybeSingle();
    this.profile = data || null;
    return this.profile;
  },
});

/* ============ ログインの画面 ============ */
const UI = {
  mode: "login", msg: "", msgKind: "", busy: false, email: "", guest: null,
  show(mode, msg = "", kind = "") { this.mode = mode; this.msg = msg; this.msgKind = kind; this.busy = false; this.draw(); },
  draw() {
    const app = document.getElementById("app"); if (!app) return;
    const msg = this.msg ? `<div class="auth-msg ${this.msgKind}" role="alert">${esc(this.msg)}</div>` : "";
    const email = `<label class="field"><span>メールアドレス</span><input class="input" type="email" name="email" autocomplete="email" required value="${esc(this.email)}"></label>`;
    const pass = (ac, label = "パスワード") => `<label class="field"><span>${label}</span><input class="input" type="password" name="password" autocomplete="${ac}" minlength="8" required></label>`;
    const dis = this.busy ? "disabled" : "";
    const link = (to, t) => `<button type="button" class="link-btn" data-auth-go="${to}">${t}</button>`;
    let body = "";
    if (this.mode === "login") body = `<h2>ログイン</h2>${msg}${email}${pass("current-password")}<button class="btn btn-primary" type="submit" ${dis}>ログイン</button><div class="auth-links">${link("signup", "はじめての方(新規登録)")}${link("reset", "パスワードを忘れた")}</div>${ALLOW_GUEST ? `<div class="auth-guest"><button type="button" class="btn btn-ghost" data-auth-guest>ログインせずに使う</button><span class="faint">見本を試す・前に使っていたデータを開くときはこちら。あとからいつでもログインできます。</span></div>` : ""}`;
    else if (this.mode === "signup") body = `<h2>新規登録</h2>${msg}${email}${pass("new-password", "パスワード(8文字以上)")}<button class="btn btn-primary" type="submit" ${dis}>登録する</button><div class="auth-links">${link("login", "登録済みの方はログイン")}</div>`;
    else if (this.mode === "reset") body = `<h2>パスワードの再設定</h2>${msg}<p class="faint" style="margin:0">登録したメールアドレスに、再設定のリンクを送ります。</p>${email}<button class="btn btn-primary" type="submit" ${dis}>リンクを送る</button><div class="auth-links">${link("login", "ログインに戻る")}</div>`;
    else if (this.mode === "newpass") body = `<h2>新しいパスワード</h2>${msg}${pass("new-password", "新しいパスワード(8文字以上)")}<button class="btn btn-primary" type="submit" ${dis}>変更してはじめる</button>`;
    else if (this.mode === "sent") body = `<h2>メールを送りました</h2>${msg}<div class="auth-links">${link("login", "ログインへ")}</div>`;
    app.innerHTML = `<div class="auth-wrap"><form class="card auth-card" id="auth-form" novalidate>
      <div class="auth-brand"><span>スマッチ</span></div>${body}</form></div>`;
    const f = document.getElementById("auth-form");
    f.addEventListener("submit", (e) => { e.preventDefault(); this.submit(f); });
    f.querySelectorAll("[data-auth-go]").forEach((b) => b.addEventListener("click", () => { const em = f.elements.email; if (em) this.email = em.value.trim(); this.show(b.dataset.authGo); }));
    const g = f.querySelector("[data-auth-guest]"); if (g) g.addEventListener("click", () => this.guest && this.guest());
    const first = f.querySelector("input"); if (first && !first.value) first.focus(); else if (f.elements.password) f.elements.password.focus();
  },
  async submit(f) {
    if (this.busy) return;
    const c = Cloud.client, em = f.elements.email, pw = f.elements.password;
    if (em) this.email = em.value.trim();
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) { this.show(this.mode, "メールアドレスを入れてください", "err"); return; }
    if (pw && pw.value.length < 8) { this.show(this.mode, "パスワードは8文字以上にしてください", "err"); return; }
    this.busy = true; f.querySelector("button[type=submit]").disabled = true;
    try {
      if (this.mode === "login") {
        const { error } = await c.auth.signInWithPassword({ email: this.email, password: pw.value });
        if (error) throw error; // 成功したら onAuthStateChange が続きを始める
      } else if (this.mode === "signup") {
        const { data, error } = await c.auth.signUp({ email: this.email, password: pw.value, options: { emailRedirectTo: here() } });
        if (error) throw error;
        // メールの確認がいる設定なら、session は空で返る
        if (!data.session) this.show("sent", `${this.email} に確認のメールを送りました。メールのリンクを押すと登録が終わります。届かないときは迷惑メールのフォルダも見てください。`, "ok");
      } else if (this.mode === "reset") {
        const { error } = await c.auth.resetPasswordForEmail(this.email, { redirectTo: here() });
        if (error) throw error;
        this.show("sent", `${this.email} に再設定のリンクを送りました。メールのリンクを押して、新しいパスワードを決めてください。`, "ok");
      } else if (this.mode === "newpass") {
        const { error } = await c.auth.updateUser({ password: pw.value });
        if (error) throw error;
        location.replace(here()); // 開き直して、そのままログインした状態ではじめる
      }
    } catch (err) { this.show(this.mode, jaError(err), "err"); }
  },
};
})();
