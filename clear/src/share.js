/* ============================================================
   スマッチ 生徒用ページ (share) — 公開ページだけで使う
   - 先生が出した8桁のコードを入れると、その練習試合の対戦と点数が見られて、点数だけ入れられる
   - ログインはいらない。サーバーの関数(share_get / share_score)だけを通るので、
     名前・学校・点数より多いもの(ランク・メモなど)はそもそも届かない
   ============================================================ */
(() => {
  "use strict";
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );
  const CODE_LEN = 8;
  const POLL_MS = 20000;
  const CSS = `
.sh-wrap{max-width:760px;margin:0 auto;padding:20px 14px 60px;display:flex;flex-direction:column;gap:14px}
.sh-top{display:flex;align-items:center;justify-content:space-between;gap:10px;font-weight:800;letter-spacing:.06em}
.sh-code{font-size:1.6rem;letter-spacing:.3em;text-align:center;font-variant-numeric:tabular-nums}
.sh-head h1{margin:0;font-size:1.3rem}
.sh-round h2{margin:0 0 8px;font-size:1.05rem}
.sh-m{display:grid;grid-template-columns:auto 1fr auto 1fr;gap:8px;align-items:center;padding:10px 0;border-top:1px solid var(--hairline)}
.sh-m:first-of-type{border-top:0}
.sh-no{font-size:.78rem;color:var(--text-tertiary);text-align:center;min-width:2.4em;line-height:1.2}
.sh-side{display:flex;flex-direction:column;gap:2px;min-width:0}
.sh-side.b{text-align:right}
.sh-side b{font-weight:650;overflow-wrap:anywhere}
.sh-side small{color:var(--text-tertiary);font-size:.74rem}
.sh-side.win b{color:var(--success)}
.sh-score{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:84px;padding:6px 8px;border-radius:12px;border:1px solid var(--border);background:var(--surface-soft);color:var(--text);font:inherit;cursor:pointer}
.sh-score .num{font-variant-numeric:tabular-nums;font-weight:700}
.sh-score .faint{font-size:.74rem}
.sh-games{display:flex;flex-direction:column;gap:10px}
.sh-game{display:flex;align-items:center;justify-content:center;gap:8px}
.sh-game .input{width:4.2em;text-align:center;font-size:1.3rem;font-variant-numeric:tabular-nums}
.sh-names{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;text-align:center;font-weight:650}
.sh-confirm{border:2px solid var(--error);}
.sh-confirm h3{color:var(--error);margin:0}
.sh-sum{padding:10px 12px;border-radius:12px;background:var(--surface-soft);font-variant-numeric:tabular-nums}
.sh-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px}
`;

  const S = {
    code: "",
    data: null,
    err: "",
    busy: false,
    q: "",
    edit: null, // { r, m, g:[[x,y],...] }
    ask: false, // 「よろしいですか？」を出している
    timer: null,
  };
  const app = () => document.getElementById("app");
  function toast(t) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = t;
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove("show"), 2600);
  }
  const ev = () => {
    const d = S.data;
    return {
      games: d.games === 3 ? 3 : 1,
      points: Number(d.points) || 21,
      players: d.players || [],
      practice: { rounds: d.rounds || [] },
    };
  };
  function jaErr(err) {
    const m = String((err && err.message) || err || "");
    if (/too many tries/.test(m))
      return "まちがいが続いたので、少しのあいだ入れません。10分ほど待ってからやり直してください。";
    if (/Failed to fetch|NetworkError|network/i.test(m)) return "つながりませんでした。電波の状態を確かめてください。";
    if (/match not found|round not found/.test(m)) return "この試合は先生が組み直しました。画面を新しくします。";
    if (/bad score/.test(m)) return "点数の形が正しくありません。";
    return "うまくいきませんでした。もう一度ためしてください。";
  }

  async function load(code, quiet) {
    const c = window.Cloud && window.Cloud.client;
    if (!c) return;
    if (!quiet) {
      S.busy = true;
      draw();
    }
    const { data, error } = await c.rpc("share_get", { p_code: code });
    S.busy = false;
    if (error) {
      S.err = jaErr(error);
      if (!quiet) S.data = null;
    } else if (!data) {
      S.data = null;
      S.err = quiet
        ? "このコードは使えなくなりました(先生が止めたか、新しいコードにしました)。"
        : "コードがちがうか、もう使えないコードです。先生に確かめてください。";
    } else {
      S.data = data;
      S.code = code;
      S.err = "";
      try {
        sessionStorage.setItem("sumatch-code", code);
      } catch (e) {}
    }
    if (!(quiet && (S.edit || S.ask))) draw();
  }

  /* ---------- 画面 ---------- */
  function draw() {
    const root = app();
    if (!root) return;
    const msg = S.err ? `<div class="auth-msg err" role="alert">${esc(S.err)}</div>` : "";
    const top = `<div class="sh-top"><span>スマッチ</span><button class="link-btn" data-sh="leave">${S.data ? "コードを入れ直す" : "ログイン画面へ"}</button></div>`;
    if (!S.data) {
      root.innerHTML = `<div class="sh-wrap">${top}<form class="card stack" id="sh-form" novalidate>
        <h2 style="margin:0">試合コードで参加</h2>${msg}
        <p class="faint" style="margin:0">先生から聞いた${CODE_LEN}桁の数字を入れてください。</p>
        <input class="input sh-code" name="code" inputmode="numeric" autocomplete="off" maxlength="${CODE_LEN}" pattern="[0-9]*" value="${esc(S.code)}" aria-label="試合コード">
        <button class="btn btn-primary" type="submit" ${S.busy ? "disabled" : ""}>${S.busy ? "確かめています…" : "参加する"}</button></form></div>`;
      const f = document.getElementById("sh-form");
      const inp = f.elements.code;
      inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/\D/g, "").slice(0, CODE_LEN);
      });
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const v = inp.value.replace(/\D/g, "");
        S.code = v;
        if (v.length !== CODE_LEN) {
          S.err = `${CODE_LEN}桁の数字を入れてください。`;
          draw();
          return;
        }
        load(v);
      });
      bind(root);
      if (!S.busy) inp.focus();
      return;
    }
    const e = ev(),
      d = S.data,
      pm = Object.fromEntries(e.players.map((p) => [p.id, p])),
      rs = e.practice.rounds,
      multi = rs.some((r) => r.day !== (rs[0] && rs[0].day)),
      q = S.q.trim();
    const side = (ids, cls) =>
      `<div class="sh-side ${cls}">${(ids || [])
        .filter(Boolean)
        .map(
          (id) =>
            `<b>${esc(pm[id] ? pm[id].name : "?")}</b>${pm[id] && pm[id].school ? `<small>${esc(pm[id].school)}</small>` : ""}`
        )
        .join("")}</div>`;
    const hit = (m) =>
      !q ||
      m.a.concat(m.b).some((id) => pm[id] && ((pm[id].name || "").includes(q) || (pm[id].school || "").includes(q)));
    const rounds = rs
      .map((r, ri) => {
        const no = rs.slice(0, ri + 1).filter((x) => x.day === r.day).length;
        const ms = r.matches
          .map((m, mi) => {
            if (!hit(m)) return "";
            const o = Core.pOutcome(e, m);
            const gs = (m.g || []).slice(0, e.games).filter((g) => g && (g[0] != null || g[1] != null));
            const txt = gs.length
              ? gs.map((g) => `<span class="num">${g[0] ?? ""} - ${g[1] ?? ""}</span>`).join("")
              : o.winner
                ? `<span class="faint">${o.winner === "a" ? "左" : "右"}の勝ち</span><span class="faint">点数を入れる</span>`
                : `<span class="faint">点数を入れる</span>`;
            return `<div class="sh-m"><div class="sh-no">${m.ct ? `コート<br><b>${esc(m.ct)}</b>` : mi + 1}</div>${side(m.a, o.winner === "a" ? "a win" : "a")}
            <button class="sh-score" data-sh="edit" data-r="${esc(r.id)}" data-m="${esc(m.id)}" aria-label="点数を入れる">${txt}</button>${side(m.b, o.winner === "b" ? "b win" : "b")}</div>`;
          })
          .join("");
        return ms
          ? `<section class="card sh-round"><h2>${multi ? `${r.day}日目 ` : ""}${no}回転目</h2>${ms}</section>`
          : "";
      })
      .join("");
    root.innerHTML = `<div class="sh-wrap">${top}
      <section class="card stack sh-head"><h1>${esc(d.name || "練習試合")}</h1>${d.date ? `<span class="faint">${esc(d.date)}</span>` : ""}
      <p class="faint" style="margin:0">${e.points}点・${e.games === 3 ? "3ゲーム(2ゲーム先取)" : "1ゲーム"}。点数のところを押すと入れられます。</p>${msg}
      <div class="row"><input class="input" id="sh-q" type="search" placeholder="名前・学校で探す" value="${esc(S.q)}" autocomplete="off" style="flex:1"><button class="btn btn-secondary btn-sm" data-sh="reload">新しくする</button></div></section>
      ${rounds || `<section class="card"><p class="faint" style="margin:0">${rs.length && q ? "見つかりませんでした" : "まだ対戦がありません。先生が組むまで待ってください。"}</p></section>`}
      ${S.edit ? editHTML(e, pm) : ""}</div>`;
    const qi = document.getElementById("sh-q");
    qi.addEventListener("input", () => {
      S.q = qi.value;
      const pos = qi.selectionStart;
      draw();
      const n = document.getElementById("sh-q");
      n.focus();
      try {
        n.setSelectionRange(pos, pos);
      } catch (x) {}
    });
    bind(root);
  }

  function names(pm, ids) {
    return (ids || [])
      .filter(Boolean)
      .map((id) => esc(pm[id] ? pm[id].name : "?"))
      .join("・");
  }
  function editHTML(e, pm) {
    const x = S.edit,
      m = findMatch(x.r, x.m);
    if (!m) return "";
    const head = `<div class="sh-names"><span>${names(pm, m.a)}</span><span class="faint">vs</span><span>${names(pm, m.b)}</span></div>`;
    if (S.ask) {
      const sum = x.g
        .map((g, i) =>
          g[0] != null || g[1] != null
            ? `${e.games > 1 ? `第${i + 1}ゲーム ` : ""}<b>${g[0] ?? "-"} - ${g[1] ?? "-"}</b>`
            : ""
        )
        .filter(Boolean)
        .join("<br>");
      return `<div class="modal-bg"><div class="modal stack sh-confirm" role="alertdialog" aria-modal="true" aria-labelledby="sh-ask">
        <h3 id="sh-ask">この記録を更新します。<br>よろしいですか？</h3>${head}
        <div class="sh-sum">${sum || "点数を消します"}</div>
        <p class="faint" style="margin:0">前に入っていた点数は書きかわります。</p>
        <div class="sh-btns"><button class="btn btn-secondary" data-sh="no">いいえ</button><button class="btn btn-primary" data-sh="yes" ${S.busy ? "disabled" : ""}>${S.busy ? "記録しています…" : "はい"}</button></div></div></div>`;
    }
    const rows = x.g
      .map(
        (
          g,
          i
        ) => `<div class="sh-game">${e.games > 1 ? `<span class="faint" style="width:5.5em">第${i + 1}ゲーム</span>` : ""}
        <input class="input" inputmode="numeric" maxlength="2" autocomplete="off" data-g="${i}" data-s="0" value="${g[0] ?? ""}" aria-label="第${i + 1}ゲーム 左の点数">
        <span>-</span><input class="input" inputmode="numeric" maxlength="2" autocomplete="off" data-g="${i}" data-s="1" value="${g[1] ?? ""}" aria-label="第${i + 1}ゲーム 右の点数"></div>`
      )
      .join("");
    const warn = x.g.some((g) => Core.gameWarn(e, g[0], g[1]));
    return `<div class="modal-bg"><div class="modal stack" role="dialog" aria-modal="true"><h3 style="margin:0">点数を入れる</h3>${head}
      <div class="sh-games">${rows}</div>${warn ? `<div class="auth-msg">ありえない点数になっていないか、確かめてください。</div>` : ""}
      <div class="sh-btns"><button class="btn btn-secondary" data-sh="cancel">やめる</button><button class="btn btn-primary" data-sh="save">記録する</button></div></div></div>`;
  }
  function findMatch(rid, mid) {
    const r = S.data && (S.data.rounds || []).find((x) => x.id === rid);
    return r && r.matches.find((m) => m.id === mid);
  }

  function bind(root) {
    root.querySelectorAll("[data-sh]").forEach((b) => b.addEventListener("click", () => act(b.dataset.sh, b)));
    root.querySelectorAll(".sh-game input").forEach((inp) =>
      inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/\D/g, "").slice(0, 2);
        const v = inp.value === "" ? null : Number(inp.value);
        S.edit.g[+inp.dataset.g][+inp.dataset.s] = v;
      })
    );
  }
  async function act(k, b) {
    if (k === "leave") {
      stopPoll();
      if (S.data) {
        S.data = null;
        S.code = "";
        S.err = "";
        try {
          sessionStorage.removeItem("sumatch-code");
        } catch (e) {}
        draw();
      } else location.href = location.pathname;
      return;
    }
    if (k === "reload") return load(S.code);
    if (k === "edit") {
      const m = findMatch(b.dataset.r, b.dataset.m);
      if (!m) return;
      const n = ev().games;
      S.edit = {
        r: b.dataset.r,
        m: b.dataset.m,
        g: Array.from({ length: n }, (_, i) => {
          const g = (m.g || [])[i] || [null, null];
          return [g[0] ?? null, g[1] ?? null];
        }),
      };
      S.ask = false;
      draw();
      const f = app().querySelector(".sh-game input");
      if (f) f.focus();
      return;
    }
    if (k === "cancel") {
      S.edit = null;
      draw();
      return;
    }
    if (k === "save") {
      const bad = S.edit.g.some((g) => (g[0] == null) !== (g[1] == null));
      if (bad) {
        toast("左と右の両方に点数を入れてください");
        return;
      }
      S.ask = true;
      draw();
      return;
    }
    if (k === "no") {
      S.ask = false;
      draw();
      return;
    }
    if (k === "yes") {
      if (S.busy) return;
      S.busy = true;
      draw();
      let g = S.edit.g.slice();
      while (g.length > 1 && g[g.length - 1][0] == null && g[g.length - 1][1] == null) g.pop();
      const { data, error } = await window.Cloud.client.rpc("share_score", {
        p_code: S.code,
        p_round: S.edit.r,
        p_mid: S.edit.m,
        p_g: g,
      });
      S.busy = false;
      S.ask = false;
      if (error || !data) {
        const msg = error ? jaErr(error) : "このコードは使えなくなりました(先生が止めたか、新しいコードにしました)。";
        S.edit = null;
        toast(msg);
        if (error && /not found/.test(error.message || "")) return load(S.code, true);
        if (!error) {
          S.data = null;
          S.err = msg;
        }
        draw();
        return;
      }
      S.data = data;
      S.edit = null;
      draw();
      toast("記録しました");
    }
  }

  function stopPoll() {
    clearInterval(S.timer);
    S.timer = null;
  }
  function startPoll() {
    stopPoll();
    S.timer = setInterval(() => {
      if (S.data && !S.edit && !S.busy && document.visibilityState === "visible") load(S.code, true);
    }, POLL_MS);
  }

  window.Share = {
    /* 生徒用ページを開く(code があれば、すぐ確かめる) */
    open(code) {
      if (!document.getElementById("sh-css")) {
        const st = document.createElement("style");
        st.id = "sh-css";
        st.textContent = CSS;
        document.head.appendChild(st);
      }
      document.title = "試合コードで参加 | スマッチ";
      let saved = "";
      try {
        saved = sessionStorage.getItem("sumatch-code") || "";
      } catch (e) {}
      const c = String(code || saved || "").replace(/\D/g, "");
      startPoll();
      if (c.length === CODE_LEN) load(c);
      else {
        S.code = c;
        draw();
      }
    },
    /* URL が ?code=12345678 か #join のとき、生徒用ページで開く */
    wanted() {
      const p = new URLSearchParams(location.search);
      if (p.has("code")) return p.get("code") || "";
      return location.hash === "#join" ? "" : null;
    },
  };
})();
