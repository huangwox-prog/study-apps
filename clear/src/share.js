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
.sh-names{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;text-align:center;font-weight:650;font-size:1.35rem;line-height:1.35}
.sh-confirm{border:2px solid var(--error);}
.sh-confirm h3{color:var(--error);margin:0}
.sh-sum{padding:10px 12px;border-radius:12px;background:var(--surface-soft);font-variant-numeric:tabular-nums;font-size:1.15rem}
.sh-flash{animation:shflash 3s ease-out 1}@keyframes shflash{0%,40%{box-shadow:0 0 0 3px var(--accent)}100%{box-shadow:0 0 0 0 transparent}}
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
    drafts: {},
    conflict: null,
    sendErr: "",
    flash: null,
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

  /* サーバーを呼ぶ。電波が切れて例外になっても、エラーとして返す(「記録しています…」のまま止まらないように) */
  async function call(fn, args) {
    try {
      const r = await window.Cloud.client.rpc(fn, args);
      return r || { data: null, error: { message: "Failed to fetch" } };
    } catch (e) {
      return { data: null, error: { message: "Failed to fetch" } };
    }
  }
  const gTxt = (g) =>
    (g || [])
      .filter((x) => x && (x[0] != null || x[1] != null))
      .map((x) => `${x[0] ?? ""}-${x[1] ?? ""}`)
      .join("、") || "なし";
  const sameG = (a, b) => JSON.stringify(a || []) === JSON.stringify(b || []);

  async function load(code, quiet) {
    const c = window.Cloud && window.Cloud.client;
    if (!c) return;
    if (!quiet) {
      S.busy = true;
      draw();
    }
    const before = S.data;
    const { data, error } = await call("share_get", { p_code: code });
    if (!quiet) S.busy = false;
    if (error) {
      S.err = jaErr(error);
      if (!quiet) S.data = null;
    } else if (!data) {
      S.data = null;
      S.err = quiet
        ? "このコードは使えなくなりました(先生が止めたか、新しいコードにしました)。"
        : "コードがちがうか、もう使えないコードです。先生に確かめてください。";
    } else {
      /* 自動更新で点数が変わった試合は、少しのあいだ光らせる */
      if (quiet && before) {
        const old = {};
        (before.rounds || []).forEach((r) => r.matches.forEach((m) => (old[m.id] = m)));
        S.flash = new Set();
        data.rounds.forEach((r) =>
          r.matches.forEach((m) => {
            const o = old[m.id];
            if (o && (!sameG(o.g, m.g) || (o.ct || "") !== (m.ct || ""))) S.flash.add(m.id);
          })
        );
      } else S.flash = null;
      S.data = data;
      S.code = code;
      S.err = "";
      try {
        sessionStorage.setItem("sumatch-code", code);
        /* 開き直しても同じ試合に入れるよう、URL にコードを付ける */
        if (new URLSearchParams(location.search).get("code") !== code)
          history.replaceState(null, "", location.pathname + "?code=" + code);
      } catch (e) {}
    }
    /* 自動更新では、何かを打っている最中(検索・コート・点数)は画面を作り直さない(打った字が消えないように)。次の更新で映す */
    const ae = document.activeElement,
      typing = !!(ae && /^(INPUT|TEXTAREA)$/.test(ae.tagName) && app().contains(ae));
    if (!(quiet && (S.edit || S.ask || typing))) draw();
    else if (S.edit) noteChanged();
  }
  /* 入力欄を開いているあいだに、ほかの人がその試合を記録したら、欄の上に知らせる(打った数字はそのまま) */
  function noteChanged() {
    const m = S.edit && findMatch(S.edit.r, S.edit.m),
      el = document.getElementById("sh-note");
    if (!m || !el) return;
    const changed = !sameG(m.g, S.edit.base);
    el.hidden = !changed;
    el.textContent = changed
      ? `ほかの人がこの試合を記録しました(いま:${gTxt(m.g)})。このまま記録すると上書きします。`
      : "";
  }

  /* ---------- 画面 ---------- */
  /* 作り直しても、いま入力している欄・カーソルの位置・スクロールを保つ */
  function draw() {
    const ae = document.activeElement,
      fid = ae && ae.id && app() && app().contains(ae) ? ae.id : null;
    let selS = null,
      selE = null;
    try {
      if (fid && typeof ae.selectionStart === "number") {
        selS = ae.selectionStart;
        selE = ae.selectionEnd;
      }
    } catch (x) {}
    const y = window.scrollY;
    drawNow();
    window.scrollTo(0, y);
    const n = fid && document.getElementById(fid);
    if (n && n.tagName !== "BUTTON") {
      n.focus({ preventScroll: true });
      try {
        if (selS != null) n.setSelectionRange(selS, selE);
      } catch (x) {}
    }
  }
  function drawNow() {
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
        inp.value = inp.value.normalize("NFKC").replace(/\D/g, "").slice(0, CODE_LEN);
        if (inp.value.length === CODE_LEN && !S.busy) f.requestSubmit ? f.requestSubmit() : f.submit();
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
                `<div class="game">${many ? `<span class="game-label">第${i + 1}</span>` : ""}<input class="score" id="se-${i}-0" inputmode="numeric" maxlength="2" autocomplete="off" data-g="${i}" data-s="0" value="${g[0] ?? ""}" aria-label="第${i + 1}ゲーム 左の点数"><span>-</span><input class="score" id="se-${i}-1" inputmode="numeric" maxlength="2" autocomplete="off" data-g="${i}" data-s="1" value="${g[1] ?? ""}" aria-label="第${i + 1}ゲーム 右の点数"></div>`
            )
            .join("")}
          <div class="note warn" id="sh-note" style="white-space:normal" ${!sameG(m.g, S.edit.base) ? "" : "hidden"}>${!sameG(m.g, S.edit.base) ? esc(`ほかの人がこの試合を記録しました(いま:${gTxt(m.g)})。このまま記録すると上書きします。`) : ""}</div>
          ${S.edit.err ? `<div class="note err" style="white-space:normal">${esc(S.edit.err)}</div>` : ""}
          <div class="row"><button class="btn btn-primary btn-sm" data-sh="save">記録する</button><button class="btn btn-ghost btn-sm" data-sh="cancel">閉じる</button></div></div>`
        : "";
      return `<div class="pmatch ${o.winner ? "is-done" : o.started ? "is-live" : ""} ${S.flash && S.flash.has(m.id) ? "sh-flash" : ""}"><span class="pm-num">${mi + 1}<label class="court-lb" for="sc-${esc(m.id)}">コート</label><input class="court-in sh-court" id="sc-${esc(m.id)}" data-r="${esc(r.id)}" data-m="${esc(m.id)}" value="${esc(m.ct || "")}" maxlength="2" autocomplete="off" autocapitalize="characters" aria-label="${mi + 1}番の試合のコート番号"></span>${team(m.a, "a", o.winner === "a")}
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
    /* 日本語入力の変換中は作り直さない(変換が切れるので)。確定したら絞り込む */
    const applyQ = () => {
      S.q = qi.value;
      draw();
    };
    qi.addEventListener("input", (ev) => {
      if (!ev.isComposing) applyQ();
    });
    qi.addEventListener("compositionend", () => setTimeout(applyQ, 0));
    bind(root);
  }

  function names(pm, ids) {
    return (ids || [])
      .filter(Boolean)
      .map((id) => esc(pm[id] ? pm[id].name : "?"))
      .join("・");
  }
  /* 本当にありえない点数だけ止める(サーバーの share_score と同じ決まり)。途中の点数・片方だけ・勝負がつく前でも入れてよい */
  function check(e, g) {
    const cap = e.points === 21 ? 30 : e.points === 15 ? 21 : 15,
      rule = `${e.points}点のゲームなので`,
      need = e.games === 3 ? 2 : 1;
    let wa = 0,
      wb = 0,
      gap = false;
    for (let i = 0; i < g.length; i++) {
      const [x, y] = g[i],
        L = e.games > 1 ? `第${i + 1}ゲーム:` : "";
      if (x == null && y == null) {
        gap = true;
        continue;
      }
      if (gap) return `${L}その前のゲームが空いています。前のゲームから入れてください。`;
      if (wa >= need || wb >= need)
        return `${L}もう${need}ゲーム先に取って勝負がついているので、このゲームはありません。点数を消してください。`;
      if ((x != null && x > cap) || (y != null && y > cap)) return `${L}${rule}、${cap}点より多くはなりません。`;
      if (x == null || y == null) continue;
      const hi = Math.max(x, y),
        lo = Math.min(x, y);
      if (hi === lo && hi >= cap) return `${L}${rule}、${x}-${y} にはなりません。`;
      if (hi > e.points && hi - lo > 2)
        return `${L}${rule}、${x}-${y} にはなりません(${e.points}点を超えるのは、${e.points - 1}点どうしから2点差がつくまで)。`;
      if (hi !== lo && (hi >= cap || (hi >= e.points && hi - lo >= 2))) {
        if (x > y) wa++;
        else wb++;
      }
    }
    return "";
  }
  function askHTML(e, pm) {
    const x = S.edit,
      m = findMatch(x.r, x.m);
    if (!m) return "";
    const sum = x.g
      .map((g, i) =>
        g[0] != null || g[1] != null
          ? `${e.games > 1 ? `第${i + 1}ゲーム ` : ""}<b>${g[0] ?? ""} - ${g[1] ?? ""}</b>`
          : ""
      )
      .filter(Boolean)
      .join("<br>");
    const btn = (k, t) =>
      `<button class="btn btn-primary" data-sh="${k}" ${S.busy ? "disabled" : ""}>${S.busy ? "記録しています…" : t}</button>`;
    const err = S.sendErr ? `<div class="auth-msg err" role="alert">${esc(S.sendErr)}</div>` : "";
    const head = `<div class="sh-names"><span>${names(pm, m.a)}</span><span class="faint">vs</span><span>${names(pm, m.b)}</span></div>`;
    if (S.conflict)
      return `<div class="modal-bg"><div class="modal stack sh-confirm" role="alertdialog" aria-modal="true" aria-labelledby="sh-ask">
      <h3 id="sh-ask">ほかの人が先に、この試合を記録しました</h3>${head}
      <div class="sh-sum"><span class="faint">いまの点数</span><br><b>${esc(gTxt(S.conflict))}</b></div>
      <div class="sh-sum"><span class="faint">あなたが入れた点数</span><br>${sum || "なし"}</div>
      <p class="faint" style="margin:0">あなたの点数で上書きしますか？</p>${err}
      <div class="sh-btns"><button class="btn btn-secondary" data-sh="cancel">やめる(いまのまま)</button>${btn("force", "上書きする")}</div></div></div>`;
    const had = (x.base || []).some((g) => g && (g[0] != null || g[1] != null));
    return `<div class="modal-bg"><div class="modal stack sh-confirm" role="alertdialog" aria-modal="true" aria-labelledby="sh-ask">
      <h3 id="sh-ask">この記録を更新します。<br>よろしいですか？</h3>${head}
      ${had ? `<div class="sh-sum"><span class="faint">前の点数</span><br>${esc(gTxt(x.base))}</div>` : ""}
      <div class="sh-sum">${had ? `<span class="faint">新しい点数</span><br>` : ""}${sum || "点数を消します"}</div>
      ${had ? `<p class="faint" style="margin:0">前の点数は書きかわります。</p>` : ""}${err}
      <div class="sh-btns"><button class="btn btn-secondary" data-sh="no">いいえ</button>${btn("yes", "はい")}</div></div></div>`;
  }
  function findMatch(rid, mid) {
    const r = S.data && (S.data.rounds || []).find((x) => x.id === rid);
    return r && r.matches.find((m) => m.id === mid);
  }

  function bind(root) {
    root.querySelectorAll("[data-sh]").forEach((b) => b.addEventListener("click", () => act(b.dataset.sh, b)));
    /* コート番号:全角は半角に、英字は大文字に。2文字まで。決まったら(欄を離れたら)すぐ記録する */
    root.querySelectorAll(".sh-court").forEach((inp) => {
      const norm = () =>
        inp.value
          .normalize("NFKC")
          .toUpperCase()
          .replace(/[^0-9A-Z]/g, "")
          .slice(0, 2);
      inp.addEventListener("input", (ev) => {
        if (!ev.isComposing) inp.value = norm();
      });
      inp.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") inp.blur();
      });
      inp.addEventListener("change", () => saveCourt(inp, norm()));
    });
    /* 点数の欄:全角でも入る。2けた入れたら次の欄へ(先生の画面と同じ) */
    const boxes = [...root.querySelectorAll(".pm-extra .score")],
      pts = S.data ? ev().points : 21,
      cap = pts === 21 ? 30 : pts === 15 ? 21 : 15;
    const next = (i) => {
      const n = boxes[i + 1];
      if (!n) return;
      n.focus();
      n.select();
    };
    boxes.forEach((inp, i) => {
      /* 1けたでも、2けたにできない数字(15点なら3〜9・0)なら、すぐ次の欄へ。2けたになったら次の欄へ */
      const done = (v) => v.length === 2 || (v.length === 1 && (v === "0" || Number(v) * 10 > cap));
      const take = (composing) => {
        const v = inp.value.normalize("NFKC").replace(/\D/g, "").slice(0, 2);
        if (composing) {
          /* 日本語入力:2けたで確定させ、確定したら次の欄へ */
          if (v.length >= 2) {
            inp._adv = true;
            inp.blur();
          }
          return;
        }
        if (inp.value !== v) inp.value = v;
        S.edit.g[+inp.dataset.g][+inp.dataset.s] = v === "" ? null : Number(v);
        if ((document.activeElement === inp || inp._adv) && done(v)) {
          inp._adv = false;
          next(i);
        }
        inp._adv = false;
      };
      inp.addEventListener("input", (ev) => take(ev.isComposing));
      inp.addEventListener("compositionend", () => {
        inp._adv = inp._adv || inp.value.normalize("NFKC").replace(/\D/g, "").length >= 1;
        setTimeout(() => take(false), 0);
      });
      inp.addEventListener("blur", () => {
        if (!inp._adv) take(false);
      });
      /* 押したら中身を選ぶ(直すとき、打った数字で置きかわる) */
      inp.addEventListener("focus", () => {
        inp._fresh = true;
        inp.select();
      });
      /* 押したすぐあと、指(マウス)を離したときに選びが外れないようにする */
      inp.addEventListener("mouseup", (ev) => {
        if (inp._fresh) {
          ev.preventDefault();
          inp.select();
        }
        inp._fresh = false;
      });
      inp.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          if (boxes[i + 1]) next(i);
          else act("save");
        }
      });
    });
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
          history.replaceState(null, "", location.pathname + "#join");
        } catch (e) {}
        draw();
      } else location.href = location.pathname;
      return;
    }
    if (k === "reload") return load(S.code);
    if (k === "edit") {
      const m = findMatch(b.dataset.r, b.dataset.m);
      if (!m) return;
      if (S.edit && S.edit.r === b.dataset.r && S.edit.m === b.dataset.m) {
        /* もう開いている試合:入れかけの数字は消さない */
        const box = app().querySelector(".pm-extra .score");
        if (box) box.focus();
        return;
      }
      const n = ev().games;
      /* 別の試合を開くとき、打ちかけの数字はとっておく(戻ってきたら続きから) */
      if (S.edit) S.drafts[S.edit.m] = S.edit;
      S.edit = S.drafts[b.dataset.m] || {
        r: b.dataset.r,
        m: b.dataset.m,
        base: JSON.parse(JSON.stringify(m.g || [])),
        g: Array.from({ length: n }, (_, i) => {
          const g = (m.g || [])[i] || [null, null];
          return [g[0] ?? null, g[1] ?? null];
        }),
      };
      delete S.drafts[b.dataset.m];
      S.edit.err = "";
      S.ask = false;
      draw();
      const f = app().querySelector(".pm-extra .score");
      if (f) f.focus();
      return;
    }
    if (k === "cancel") {
      if (S.edit && !S.conflict) {
        const m = findMatch(S.edit.r, S.edit.m),
          cur = (m && m.g) || [],
          dirty = S.edit.g.some(
            (g, i) => (g[0] ?? null) !== ((cur[i] || [])[0] ?? null) || (g[1] ?? null) !== ((cur[i] || [])[1] ?? null)
          );
        if (dirty && !confirm("記録していない点数があります。閉じると消えます。閉じますか？")) return;
      }
      S.edit = null;
      S.conflict = null;
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
      S.conflict = null;
      draw();
      return;
    }
    if (k === "yes" || k === "force") {
      if (S.busy) return;
      S.busy = true;
      S.sendErr = "";
      draw();
      let g = S.edit.g.slice();
      while (g.length > 1 && g[g.length - 1][0] == null && g[g.length - 1][1] == null) g.pop();
      const { data, error } = await call("share_score", {
        p_code: S.code,
        p_round: S.edit.r,
        p_mid: S.edit.m,
        p_g: g,
        /* 開いたときの点数。ほかの人が先に記録していたら、サーバーが止めて知らせる。「上書きする」を選んだときは、いまの点数を渡す */
        p_base: k === "force" && S.conflict ? S.conflict : S.edit.base,
      });
      S.busy = false;
      if (error && /conflict/.test(error.message || "")) {
        await load(S.code, true);
        const m = findMatch(S.edit.r, S.edit.m);
        S.conflict = JSON.parse(JSON.stringify((m && m.g) || []));
        draw();
        return;
      }
      if (error && /Failed to fetch|NetworkError|network/i.test(error.message || "")) {
        /* 電波:確認画面のまま、もう一度押せるようにする(打った数字はそのまま) */
        S.sendErr = "送れませんでした。電波を確かめて、もう一度「はい」を押してください。";
        draw();
        return;
      }
      S.ask = false;
      S.conflict = null;
      if (error || !data) {
        const msg = error ? jaErr(error) : "このコードは使えなくなりました(先生が止めたか、新しいコードにしました)。";
        if (error && /bad score/.test(error.message || "")) {
          S.edit.err = msg;
          draw();
          return;
        }
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
      S.flash = null;
      draw();
      toast("記録しました");
    }
  }

  async function saveCourt(inp, v) {
    const m = findMatch(inp.dataset.r, inp.dataset.m);
    inp.value = v;
    if (!m || (m.ct || "") === v) return;
    const { data, error } = await call("share_court", {
      p_code: S.code,
      p_round: inp.dataset.r,
      p_mid: inp.dataset.m,
      p_ct: v,
    });
    if (error || !data) {
      toast(error ? jaErr(error) : "このコードは使えなくなりました(先生が止めたか、新しいコードにしました)。");
      return load(S.code, true);
    }
    S.data = data;
    toast(v ? `コート ${v} にしました` : "コート番号を消しました");
    if (!S.edit) draw();
  }

  function stopPoll() {
    clearInterval(S.timer);
    S.timer = null;
  }
  function startPoll() {
    stopPoll();
    S.timer = setInterval(() => {
      if (S.data && !S.busy && !S.ask && document.visibilityState === "visible") load(S.code, true);
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
