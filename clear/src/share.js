/* ============================================================
   ラブオール 生徒用ページ (share) — 公開ページだけで使う
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
    const top = `<div class="sh-top"><span>ラブオール</span><button class="link-btn" data-sh="leave">${S.data ? "コードを入れ直す" : "ログイン画面へ"}</button></div>`;
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
      SC = window.App && App.schoolColors ? App.schoolColors(e) : { cls: () => "", list: [] },
      rs = e.practice.rounds,
      multi = rs.some((r) => r.day !== (rs[0] && rs[0].day)),
      q = S.q.trim();
    /* 先生の対戦カードと同じ形(ランク・試合数・抜くボタンは出さない) */
    const team = (ids, s, win) =>
      `<div class="team ${s} ${ids.length === 2 ? "pair" : ""} ${win ? "win" : ""}" style="padding-left:6px">${(
        ids || []
      )
        .filter(Boolean)
        .map((id) => {
          const p = pm[id];
          return `<div class="member ${p ? SC.cls(p.school) : ""}"><span class="pname">${esc(p ? p.name : "?")}</span>${p && p.school ? `<span class="pschool">${esc(p.school)}</span>` : ""}</div>`;
        })
        .join("")}</div>`;
    const hit = (m) =>
      !q ||
      m.a.concat(m.b).some((id) => pm[id] && ((pm[id].name || "").includes(q) || (pm[id].school || "").includes(q)));
    const card = (r, m, mi) => {
      const o = Core.pOutcome(e, m),
        open = S.edit && S.edit.m === m.id && S.edit.r === r.id,
        many = e.games > 1;
      const gs = (m.g || []).slice(0, e.games);
      const gtxt = gs
        .map(([x, y], g) =>
          x != null || y != null
            ? `<span class="gl ${many ? "" : "one"}">${many ? `<small>第${g + 1}ゲーム</small>` : ""}<b>${x ?? ""}</b><i>-</i><b>${y ?? ""}</b></span>`
            : ""
        )
        .join("");
      const tot =
        o.started && many
          ? `<span class="gtotal"><span class="pst"><span class="${o.winner === "a" ? "w" : ""}">${o.ga}</span> − <span class="${o.winner === "b" ? "w" : ""}">${o.gb}</span></span></span>`
          : "";
      const inputs = open
        ? `<div class="pm-extra" style="grid-column:1/-1">${S.edit.g
            .map(
              (g, i) =>
                `<div class="game">${many ? `<span class="game-label">第${i + 1}</span>` : ""}<input class="score" inputmode="numeric" maxlength="2" autocomplete="off" data-g="${i}" data-s="0" value="${g[0] ?? ""}" aria-label="第${i + 1}ゲーム 左の点数"><span>-</span><input class="score" inputmode="numeric" maxlength="2" autocomplete="off" data-g="${i}" data-s="1" value="${g[1] ?? ""}" aria-label="第${i + 1}ゲーム 右の点数"></div>`
            )
            .join("")}
          ${S.edit.err ? `<div class="note err" style="white-space:normal">${esc(S.edit.err)}</div>` : ""}
          <div class="row"><button class="btn btn-primary btn-sm" data-sh="save">記録する</button><button class="btn btn-ghost btn-sm" data-sh="cancel">閉じる</button></div></div>`
        : "";
      return `<div class="pmatch ${o.winner ? "is-done" : ""}"><span class="pm-num">${mi + 1}${m.ct ? `<span class="court-lb">コート</span><span class="mt-ct">${esc(m.ct)}</span>` : ""}</span>${team(m.a, "a", o.winner === "a")}
      <button class="pm-mid" data-sh="edit" data-r="${esc(r.id)}" data-m="${esc(m.id)}" aria-label="点数を入れる" style="text-align:center;min-width:64px">${gtxt ? `<span class="glines num">${gtxt}</span>` : `<span class="faint" style="font-size:.72rem">点数を入れる</span>`}${tot}</button>
      ${team(m.b, "b", o.winner === "b")}${inputs}</div>`;
    };
    const rounds = rs
      .map((r, ri) => {
        const no = rs.slice(0, ri + 1).filter((x) => x.day === r.day).length;
        const done = r.matches.filter((m) => Core.pOutcome(e, m).winner).length;
        const ms = r.matches.map((m, mi) => (hit(m) ? card(r, m, mi) : "")).join("");
        return ms
          ? `<section class="card"><div class="card-head"><div><h2>${multi ? `${r.day}日目 ` : ""}${no}回転目</h2><p class="faint">${r.matches.length}試合 · ${done}/${r.matches.length} 終了</p></div></div><div class="pgrid">${ms}</div></section>`
          : "";
      })
      .join("");
    const all = rs.flatMap((r) => r.matches),
      fin = all.filter((m) => Core.pOutcome(e, m).winner).length;
    root.innerHTML = `<nav class="nav"><span class="lockup"><span>ラブオール</span></span><div class="nav-right"><button class="btn btn-ghost btn-sm" data-sh="leave">コードを入れ直す</button></div></nav>
      <main class="page"><section class="hero"><span class="kicker">練習試合</span>
      <div class="hero-name" style="white-space:normal">${esc(d.name || "練習試合")}</div>
      <div class="hero-sub">${d.date ? `<span>${esc(d.date)}</span>` : ""}<span>${e.points}点・${e.games === 3 ? "3ゲーム(2ゲーム先取)" : "1ゲーム"}</span></div>
      <div class="hero-stats"><div><span class="stat-value num">${rs.length}</span><span class="stat-label">回転</span></div><div><span class="stat-value num">${fin}/${all.length}</span><span class="stat-label">試合 終了/全体</span></div></div></section>
      ${msg}<section class="card stack"><div class="qbox"><input class="input" id="sh-q" type="search" placeholder="名前・学校で探す" value="${esc(S.q)}" autocomplete="off"><button class="btn btn-secondary btn-sm" data-sh="reload">新しくする</button></div>
      <p class="faint" style="margin:0">点数のところを押すと入れられます。</p></section>
      ${rounds || `<section class="card"><p class="faint" style="margin:0">${rs.length && q ? "見つかりませんでした" : "まだ対戦がありません。先生が組むまで待ってください。"}</p></section>`}
      ${S.edit && S.ask ? askHTML(e, pm) : ""}</main>`;
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
  /* ありえない点数を止める(サーバーの share_score と同じ決まり)。だめなら理由を返す */
  function check(e, g) {
    const cap = e.points === 21 ? 30 : e.points === 15 ? 21 : 15,
      need = e.games === 3 ? 2 : 1;
    let wa = 0,
      wb = 0,
      n = 0;
    for (let i = 0; i < g.length; i++) {
      const [x, y] = g[i],
        L = e.games > 1 ? `第${i + 1}ゲーム:` : "";
      if (x == null && y == null) {
        if (g.slice(i + 1).some((h) => h[0] != null || h[1] != null)) return `${L}間のゲームが空いています。`;
        break;
      }
      if (wa >= need || wb >= need) return `${L}もう勝負がついているので、このゲームはいりません。消してください。`;
      if (x == null || y == null) return `${L}左と右の両方に点数を入れてください。`;
      const hi = Math.max(x, y),
        lo = Math.min(x, y);
      const ok =
        hi !== lo &&
        ((hi === e.points && lo <= e.points - 2) ||
          (hi > e.points && hi < cap && hi - lo === 2) ||
          (hi === cap && (lo === cap - 1 || lo === cap - 2)));
      if (!ok) {
        if (hi > cap) return `${L}${cap}点より多くはなりません。`;
        if (hi < e.points) return `${L}${x}-${y} ではゲームが終わっていません(${e.points}点まで)。`;
        return `${L}${x}-${y} にはなりません(${e.points - 1}点どうしからは、2点差がつくか${cap}点で終わり)。`;
      }
      if (x > y) wa++;
      else wb++;
      n++;
    }
    if (!n) return "点数を入れてください。";
    if (wa < need && wb < need) return "勝負がつくまで(どちらかが2ゲーム取るまで)入れてください。";
    return "";
  }
  function askHTML(e, pm) {
    const x = S.edit,
      m = findMatch(x.r, x.m);
    if (!m) return "";
    const sum = x.g
      .map((g, i) => (g[0] != null ? `${e.games > 1 ? `第${i + 1}ゲーム ` : ""}<b>${g[0]} - ${g[1]}</b>` : ""))
      .filter(Boolean)
      .join("<br>");
    return `<div class="modal-bg"><div class="modal stack sh-confirm" role="alertdialog" aria-modal="true" aria-labelledby="sh-ask">
      <h3 id="sh-ask">この記録を更新します。<br>よろしいですか？</h3>
      <div class="sh-names"><span>${names(pm, m.a)}</span><span class="faint">vs</span><span>${names(pm, m.b)}</span></div>
      <div class="sh-sum">${sum}</div>
      <p class="faint" style="margin:0">前に入っていた点数は書きかわります。</p>
      <div class="sh-btns"><button class="btn btn-secondary" data-sh="no">いいえ</button><button class="btn btn-primary" data-sh="yes" ${S.busy ? "disabled" : ""}>${S.busy ? "記録しています…" : "はい"}</button></div></div></div>`;
  }
  function findMatch(rid, mid) {
    const r = S.data && (S.data.rounds || []).find((x) => x.id === rid);
    return r && r.matches.find((m) => m.id === mid);
  }

  function bind(root) {
    root.querySelectorAll("[data-sh]").forEach((b) => b.addEventListener("click", () => act(b.dataset.sh, b)));
    root.querySelectorAll(".pm-extra .score").forEach((inp) =>
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
      const f = app().querySelector(".pm-extra .score");
      if (f) f.focus();
      return;
    }
    if (k === "cancel") {
      S.edit = null;
      draw();
      return;
    }
    if (k === "save") {
      S.edit.err = check(ev(), S.edit.g);
      if (S.edit.err) {
        draw();
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
      document.title = "試合コードで参加 | ラブオール";
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
