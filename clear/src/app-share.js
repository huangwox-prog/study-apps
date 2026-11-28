/* ============================================================
   スマッチ 生徒用コード (app-share) — 先生が練習試合の8桁コードを出す・止める・変える
   - ログインしているとき(公開ページ)だけ出す。claude.ai 版と「ログインせずに使う」では出さない
   - 生徒の画面は src/share.js。サーバーの決まりは supabase/share.sql
   ============================================================ */
(() => {
  "use strict";
  const { A, esc } = App;
  const cloud = () => (window.Cloud && window.Cloud.client && window.Cloud.user ? window.Cloud : null);
  const S = { open: false, loading: false, code: null, enabled: true, err: "" };
  const spaced = (c) => (c ? c.slice(0, 4) + " " + c.slice(4) : "");
  const joinUrl = (c) => location.origin + location.pathname + "?code=" + c;

  App.shareBtn = (e) =>
    cloud() && e.mode === "practice"
      ? `<button class="btn btn-secondary btn-sm" data-action="share-open">選手用コード</button>`
      : "";

  App.shareHTML = (e) => {
    if (!S.open || !cloud() || e.mode !== "practice") return "";
    let body;
    if (S.loading) body = `<p class="faint" style="margin:0">読み込み中…</p>`;
    else if (!S.code)
      body = `<p style="margin:0">コードを作ると、選手が自分のスマホで対戦を見て、点数を入れられるようになります。</p>
      <button class="btn btn-primary" data-action="share-new">コードを作る</button>`;
    else
      body = `<div class="share-code num ${S.enabled ? "" : "off"}">${spaced(S.code)}</div>
      ${S.enabled ? "" : `<div class="confirm"><b>止めています。</b>このコードでは今は入れません。</div>`}
      <div class="share-url faint">${esc(joinUrl(S.code))}</div>
      <div class="row"><button class="btn btn-secondary btn-sm" data-action="share-copy" data-k="code">コードをコピー</button><button class="btn btn-secondary btn-sm" data-action="share-copy" data-k="url">URLをコピー</button></div>
      <div class="row"><button class="btn btn-ghost btn-sm" data-action="share-toggle">${S.enabled ? "止める" : "また使えるようにする"}</button><button class="btn btn-ghost btn-sm" data-action="share-new">新しいコードにする</button></div>`;
    return `<div class="modal-bg" data-action="share-close-bg"><div class="modal stack"><div class="card-head" style="margin:0"><div><h2>選手用コード</h2></div><button class="btn btn-ghost btn-sm" data-action="share-close">閉じる</button></div>
    ${S.err ? `<div class="confirm perr">${esc(S.err)}</div>` : ""}${body}
    <p class="faint" style="margin:0;font-size:.8rem">コードを知っている人は、選手の名前・学校と点数を見て、点数を入れられます。ランクやメモは見えません。組み合わせは変えられません。</p></div></div>`;
  };

  async function fetchShare() {
    const c = cloud(),
      e = App.ev();
    if (!c || !e) return;
    S.loading = true;
    S.err = "";
    App.render();
    const { data, error } = await c.client.from("shares").select("code,enabled").eq("event_id", e.id).maybeSingle();
    S.loading = false;
    if (error) S.err = "読み込めませんでした。電波の状態を確かめてください。";
    S.code = data ? data.code : null;
    S.enabled = data ? data.enabled : true;
    App.render();
  }

  Object.assign(A, {
    "share-open": () => {
      S.open = true;
      fetchShare();
    },
    "share-close": () => {
      S.open = false;
      App.render();
    },
    "share-close-bg": (b, evt) => {
      if (evt && evt.target !== b) return;
      S.open = false;
      App.render();
    },
    "share-new": async () => {
      const c = cloud(),
        e = App.ev();
      if (!c || !e) return;
      if (S.code && !App.askOk("新しいコードにすると、今のコードは使えなくなります。よろしいですか？")) return;
      S.loading = true;
      S.err = "";
      App.render();
      const St = App.Store; // まだ保存していない変更があれば、先に保存する
      if (St && St.pending && St.pending.has(e.id)) {
        clearTimeout(St.timers.get(e.id));
        await St.flush(e.id);
      }
      const { data, error } = await c.client.rpc("share_create", { p_event: e.id });
      S.loading = false;
      if (error) {
        S.err = /event not found/.test(error.message || "")
          ? "まだ保存が終わっていません。少し待ってから、もう一度押してください。"
          : "コードを作れませんでした。電波の状態を確かめてください。";
      } else {
        S.code = data;
        S.enabled = true;
      }
      App.render();
    },
    "share-toggle": async () => {
      const c = cloud();
      if (!c || !S.code) return;
      const next = !S.enabled;
      const { error } = await c.client.from("shares").update({ enabled: next }).eq("code", S.code);
      if (error) {
        S.err = "変えられませんでした。電波の状態を確かめてください。";
      } else {
        S.enabled = next;
        S.err = "";
        App.toast(next ? "また使えるようにしました" : "止めました");
      }
      App.render();
    },
    "share-copy": async (b) => {
      const t = b.dataset.k === "url" ? joinUrl(S.code) : S.code;
      try {
        await navigator.clipboard.writeText(t);
        App.toast("コピーしました");
      } catch (x) {
        App.toast("コピーできませんでした。長押しで選んでください");
      }
    },
  });
})();
