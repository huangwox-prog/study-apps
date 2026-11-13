/* ============================================================
   CLEAR 画面 (app) — A: 土台・保存・はじめの画面・選手とペア・取り込み・Excel
   ============================================================ */
(() => {
"use strict";
const { RANK_MAX, clamp, clone, uid, to5, today, keyOf, playerMap, entries, entryMap, isDbl, letter } = Core;
const LS_KEY = "arca-league-v1"; // 旧名のまま(変えると今までのデータが読めなくなる)
const THEME_KEY = "arca-league-theme";
const BACKUP_KEY = "arca-league-v1-backup";
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const lvTxt = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
const ARC = (s = 22) => `<svg class="arc-mark" width="${s}" height="${s}" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 28v-9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity="0.45"/><path d="M3 28C6 9 23 4 28.5 20" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M26 22.5l3.2-3.8 2 4.8z" fill="currentColor"/><circle cx="28.4" cy="23.6" r="2.1" fill="currentColor"/></svg>`;
const TRASH = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* 他のファイルと共有する入れ物 */
/* claude.ai の中では confirm() が使えない(いつも false)ので、その場合は確認なしで進める */
const askOk = (m) => (window.claude && typeof window.claude.use === "function" ? true : confirm(m));
const App = (window.App = { askOk, A: {}, Ch: {}, F: {}, ui: null, ev: null, render: null, commit: null, toast: null, esc, lvTxt, $, views: {} });
let events = {}, currentId = null, toastTimer;
const ui = (App.ui = { view: "home", tab: "players", createMode: null, createType: "singles", confirm: null, confirmDel: null, sel: [], newLevel: 3, plSort: "level", addMode: "one", imp: null, copyText: null, exportOpen: false, showSettings: false, q: "" });
const ev = (App.ev = () => events[currentId]);
App.events = () => events;
App.setCurrent = (id) => { currentId = id; };

function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2800); }
App.toast = toast;

/* ============ 保存 ============
   まず、古い形のデータの控えを残してから新しい形(v2)に移す。控えは消さない */
const Store = {
  db: null, timers: new Map(), pending: new Map(), writing: new Set(),
  async init() { if (window.claude && typeof window.claude.use === "function") { try { this.db = await window.claude.use("db"); } catch (e) { this.db = null; } } },
  lsRaw() { try { return localStorage.getItem(LS_KEY) || ""; } catch (e) { return ""; } },
  lsRead() { try { return JSON.parse(this.lsRaw() || "{}") || {}; } catch (e) { return {}; } },
  lsWrite() { try { localStorage.setItem(LS_KEY, JSON.stringify(events)); } catch (e) {} },
  backupLocal(raw) {
    // 新しい形に移す前の元データを、そのまま別のキーに残す(すでにあれば上書きしない)
    try { if (raw && !localStorage.getItem(BACKUP_KEY)) localStorage.setItem(BACKUP_KEY, raw); } catch (e) {}
  },
  async loadAll() {
    if (this.db) {
      try {
        const snap = await this.db.collection("events").get();
        const out = {};
        for (const d of snap.docs) {
          if (!d.exists) continue;
          const raw = d.data();
          if (raw.v !== Core.SCHEMA) { try { const b = await this.db.collection("backups").doc(d.id).get(); if (!b.exists) await this.db.collection("backups").doc(d.id).set(raw); } catch (e) {} }
          out[d.id] = Object.assign(Core.migrate(raw), { id: d.id });
        }
        return out;
      } catch (e) { this.db = null; toast("オンライン保存に接続できませんでした。この端末に保存します"); }
    }
    const rawText = this.lsRaw(), raw = this.lsRead();
    if (Object.values(raw).some((x) => x && x.v !== Core.SCHEMA)) this.backupLocal(rawText);
    const out = {};
    Object.keys(raw).forEach((k) => { out[k] = Object.assign(Core.migrate(raw[k]), { id: k }); });
    return out;
  },
  save(e) {
    e.updatedAt = Date.now();
    this.lsWrite();
    if (!this.db) { setSave("local"); return; }
    const stamp = e.updatedAt;
    this.pending.set(e.id, stamp); setSave("saving");
    clearTimeout(this.timers.get(e.id));
    this.timers.set(e.id, setTimeout(() => this.flush(e.id), 700));
  },
  async flush(id) {
    if (this.writing.has(id)) { this.timers.set(id, setTimeout(() => this.flush(id), 400)); return; }
    const e = events[id];
    if (!e) { this.pending.delete(id); return; }
    const stamp = this.pending.get(id);
    this.writing.add(id);
    try { await this.db.collection("events").doc(id).set(clone(e)); if (this.pending.get(id) === stamp) this.pending.delete(id); setSave(this.pending.size ? "saving" : "saved"); }
    catch (err) { this.pending.delete(id); setSave("error"); toast("保存できませんでした。この端末には残っています"); }
    finally { this.writing.delete(id); }
  },
  async remove(id) { this.lsWrite(); if (!this.db) return; try { await this.db.collection("events").doc(id).delete(); } catch (e) { toast("削除を保存できませんでした"); } },
  subscribe() {
    if (!this.db) return;
    this.db.collection("events").onSnapshot((snap) => {
      let changed = false;
      snap.docChanges().forEach((ch) => {
        const id = ch.doc.id;
        if (this.pending.has(id) || this.writing.has(id)) return;
        if (ch.type === "removed") { if (events[id]) { delete events[id]; changed = true; } return; }
        const d = Object.assign(Core.migrate(ch.doc.data()), { id });
        if (!events[id] || (d.updatedAt || 0) > (events[id].updatedAt || 0)) { events[id] = d; changed = true; }
      });
      if (changed) { if (!events[currentId]) { currentId = null; ui.view = "home"; } render(); }
    }, () => {});
  },
};
App.Store = Store;
let saveState = "saved";
function setSave(s) { saveState = s; const el = $("#save-state"); if (el) el.outerHTML = saveHTML(); }
function saveHTML() { const m = { saved: ["", "保存済み"], saving: ["is-saving", "保存中…"], local: ["is-local", "この端末に保存"], error: ["is-error", "保存に失敗"] }; const [c, l] = m[saveState] || m.saved; return `<span id="save-state" class="save-state ${c}">${l}</span>`; }
const commit = (App.commit = () => { const e = ev(); if (e) Store.save(e); });
const sortedEvents = () => Object.values(events).sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.updatedAt || 0) - (a.updatedAt || 0));

/* ============ 呼び名 ============ */
const MODES = { practice: ["練習試合", "ランクの近い人どうしを、回転ごとに自動で組みます"], league: ["リーグ戦", "リーグに分けて、リーグの中で全員と1回ずつ"], tournament: ["トーナメント", "負けたら終わりの勝ち抜き戦"] };
const modeName = (e) => MODES[e.mode][0];
function pname(e, id) { const m = Core.entryMap(e)[id]; return m ? m.name || "(名前なし)" : ""; }
const pn = (e, id) => { const p = playerMap(e)[id]; return p ? p.name || "(名前なし)" : "—"; };
function unitWord(e) { return isDbl(e) ? "ペア" : "選手"; }
function countText(e, n) { return isDbl(e) ? `${n}組` : `${n}人`; }
function schoolColors(e) {
  const list = [...new Set(e.players.map((p) => (p.school || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));
  const pal = [0, 3, 2, 1, 4, 5, 6, 7], m = {};
  list.forEach((s, i) => (m[s] = `lg-${pal[i % 8]}`));
  return { cls: (s) => m[String(s || "").trim()] || "", list };
}
Object.assign(App, { pname, pn, modeName, unitWord, countText, schoolColors });
const levelBar = (lv) => `<span class="lv"><span class="lv-bar">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= Math.round(lv) ? "on" : ""}"></i>`).join("")}</span>${lvTxt(lv)}</span>`;
const levelPicker = (attrs, cur) => `<span class="lvpick" role="group" aria-label="ランク">${[1, 2, 3, 4, 5].map((i) => `<button type="button" class="lv-b ${i === cur ? "cur" : ""}" ${attrs} data-lv="${i}" aria-pressed="${i === cur}">${i}</button>`).join("")}</span>`;
Object.assign(App, { levelBar, levelPicker });

/* ============ 描画の入口 ============ */
const root = () => $("#app");
function render() {
  const app = root();
  if (!ready) { app.innerHTML = `<div class="loading">読み込み中…</div>`; return; }
  const e = ui.view === "event" ? ev() : null;
  const keepY = scrollY;
  const ae = document.activeElement, focus = ae && ae.id;
  // 描き直すと入力欄のカーソルが先頭に戻ってしまう(「21」が「12」になる)ので、位置を覚えておいて戻す
  let selS = null, selE = null;
  try { if (ae && typeof ae.selectionStart === "number") { selS = ae.selectionStart; selE = ae.selectionEnd; } } catch (x) {}
  app.innerHTML = `<nav class="nav">${navHTML(e)}</nav><main class="page ${e && e.mode === "practice" && ui.tab === "rounds" ? "wide" : ""}">${e ? eventHTML(e) : homeHTML()}</main>`;
  if (focus) { const n = document.getElementById(focus); if (n && n.tagName !== "BUTTON") { n.focus({ preventScroll: true }); if (selS != null) { try { n.setSelectionRange(selS, selE); } catch (x) {} } } }
  scrollTo(0, keepY);
}
App.render = render;
let ready = false;
function navHTML(e) {
  const sel = Object.keys(events).length > 1 && e ? `<select class="select" id="ev-switch" data-change="switch-event" aria-label="作ったものを切り替える">${sortedEvents().map((x) => `<option value="${x.id}" ${x.id === currentId ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select>` : "";
  return `<button class="lockup" data-action="home" aria-label="はじめの画面へ">${ARC()}<span>CLEAR</span></button>${sel}
    <div class="nav-right">${saveHTML()}<button class="theme-btn" data-action="theme" aria-label="ライト/ダークの切り替え">${isDark() ? "☀ ライトにする" : "☾ ダークにする"}</button></div>`;
}
function isDark() { const t = document.documentElement.dataset.theme; return t ? t === "dark" : matchMedia("(prefers-color-scheme:dark)").matches; }
function setTheme(t) { document.documentElement.dataset.theme = t; try { localStorage.setItem(THEME_KEY, t); } catch (e) {} }

/* ============ はじめの画面 ============ */
function homeHTML() {
  const list = sortedEvents();
  if (ui.createMode) return createHTML(ui.createMode);
  return `<div class="home-head"><h2 class="home-title">何を作りますか？</h2><p class="muted">下から1つ選んでください。</p></div>
    <div class="make-grid">${Object.entries(MODES).map(([k, [n, d]]) => `<button class="make-card" data-action="pick-mode" data-mode="${k}"><b>${n}</b><span class="faint">${d}</span></button>`).join("")}</div>
    <p class="faint" style="margin:0">見てみたいとき: <button class="link-btn" data-action="sample" data-type="practice">見本の練習試合</button> · <button class="link-btn" data-action="sample" data-type="league">見本のリーグ戦</button></p>
    ${list.length ? `<section class="stack"><h3>続きから</h3><div class="event-grid">${list.map(eventCardHTML).join("")}</div></section>` : ""}`;
}
function eventCardHTML(x) {
  if (ui.confirmDel === x.id) return `<div class="card event-card is-confirm"><b>「${esc(x.name)}」を削除しますか？</b><span class="faint">元に戻せません。</span><div class="row"><button class="btn btn-del btn-sm" data-action="del-home-yes" data-id="${x.id}">削除する</button><button class="btn btn-ghost btn-sm" data-action="del-home-no">やめる</button></div></div>`;
  const t = Core.totals(x);
  return `<div class="card event-card"><button class="event-open" data-action="open-event" data-id="${x.id}"><span class="chip chip-live">${modeName(x)}${x.type === "doubles" ? "・ダブルス" : ""}</span><b class="event-name">${esc(x.name)}</b><span class="faint">${esc(x.date || "")} · ${x.players.length}人 · 試合 ${t.finished}/${t.total}</span></button><button class="event-del" data-action="del-home" data-id="${x.id}">${TRASH} 削除</button></div>`;
}
function createHTML(mode) {
  const dbl = mode !== "practice";
  return `<button class="back-btn" data-action="cancel-create"><span>‹</span>戻る</button>
    <form class="card stack" data-form="create"><h2>${MODES[mode][0]}を作る</h2>
      <label class="field"><span>名前</span><input class="input" name="name" maxlength="60" placeholder="例:春の部内戦" required></label>
      ${dbl ? `<div class="field"><span>種目</span><div class="choice-grid two">
        <label class="choice"><input type="radio" name="type" value="singles" checked><b>シングルス</b><span class="faint">1人ずつ</span></label>
        <label class="choice"><input type="radio" name="type" value="doubles"><b>ダブルス</b><span class="faint">2人を選んでペアにする</span></label></div></div>` : `<p class="faint" style="margin:0">練習試合は、回転ごとにシングルスかダブルスを選べます。</p>`}
      <div class="row"><button class="btn btn-aurora" type="submit">作る</button></div></form>`;
}

/* ============ 作ったものの画面 ============ */
function tabsFor(e) {
  if (e.mode === "practice") return [["players", "選手"], ["rounds", "対戦(回転ごと)"], ["pstats", "成績"]];
  if (e.mode === "tournament") return [["players", isDbl(e) ? "ペア" : "選手"], ["bracket", "トーナメント"]];
  return [["players", isDbl(e) ? "ペア" : "選手"], ["leagues", "リーグ分け"], ["matches", "試合と結果"], ["overview", "順位一覧"]];
}
function eventHTML(e) {
  const tabs = tabsFor(e);
  if (!tabs.some((t) => t[0] === ui.tab)) ui.tab = tabs[0][0];
  const body = (App.views[ui.tab] || (() => ""))(e);
  return `${heroHTML(e)}<div class="tabs" role="tablist">${tabs.map(([k, n], i) => `<button class="tab ${ui.tab === k ? "is-active" : ""}" role="tab" data-action="tab" data-tab="${k}">${i + 1} ${n}</button>`).join("")}</div>
    ${ui.exportOpen ? exportHTML(e) : ""}${ui.copyText ? copyBoxHTML() : ""}${body}`;
}
function heroHTML(e) {
  const t = Core.totals(e);
  const n = isDbl(e) ? e.pairs.length : e.players.length;
  const stats = e.mode === "practice"
    ? [[e.players.length, "選手"], [new Set(e.players.map((p) => (p.school || "").trim()).filter(Boolean)).size, "学校"], [e.practice.rounds.length, "回転"], [`${t.finished}/${t.total}`, "試合 終了/全体"]]
    : [[n, unitWord(e)], [new Set(e.players.map((p) => (p.school || "").trim()).filter(Boolean)).size, "学校"], [e.mode === "league" ? e.leagues.length : e.bracket ? Core.bracketMatches(Core.bracketState(e)).length : 0, e.mode === "league" ? "リーグ" : "試合"], [`${t.finished}/${t.total}`, "試合 終了/全体"]];
  const fmt = `${e.points}点・${e.games === 3 ? "3ゲーム(2ゲーム先取)" : "1ゲーム"}`;
  return `<section class="hero"><span class="kicker">${modeName(e)}${isDbl(e) ? "・ダブルス" : e.mode === "practice" ? "" : "・シングルス"}</span>
    <textarea class="hero-name" id="ev-name" rows="1" data-change="ev-name" aria-label="名前">${esc(e.name)}</textarea>
    <div class="hero-sub"><label>日付 <input class="input" type="date" value="${esc(e.date)}" data-change="ev-date"></label><span>${fmt} · 1人1日${e.maxPerDay}試合まで</span><button class="btn btn-ghost btn-sm" data-action="toggle-settings">設定を変える</button></div>
    <div class="hero-stats">${stats.map(([v, l]) => `<div><span class="stat-value num">${v}</span><span class="stat-label">${l}</span></div>`).join("")}</div>
    <div class="hero-actions"><button class="btn btn-excel btn-sm" data-action="toggle-export">Excelに貼り付け</button></div>
    ${ui.showSettings ? settingsHTML(e) : ""}</section>`;
}
function settingsHTML(e) {
  return `<div class="hero-settings">
    <label>ゲーム <select class="select" data-change="ev-games"><option value="1" ${e.games === 1 ? "selected" : ""}>1ゲーム</option><option value="3" ${e.games === 3 ? "selected" : ""}>3ゲーム(2ゲーム先取)</option></select></label>
    <label>点数 <select class="select" data-change="ev-points">${[21, 15, 11].map((p) => `<option ${e.points === p ? "selected" : ""}>${p}</option>`).join("")}</select></label>
    <label>1人1日の上限 <select class="select" data-change="ev-maxday">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((p) => `<option ${e.maxPerDay === p ? "selected" : ""}>${p}</option>`).join("")}</select></label>
    ${ui.confirm === "del-event" ? `<span class="confirm" style="background:var(--error-soft);color:var(--ink-text)"><b>削除します。元に戻せません。</b><button class="btn btn-del btn-sm" data-action="del-event">削除する</button><button class="btn btn-ghost btn-sm" data-action="cancel">やめる</button></span>` : `<button class="btn btn-ghost btn-sm btn-danger" data-action="ask-del-event">${TRASH} このデータを削除</button>`}</div>`;
}

/* ============ 選手・ペア ============ */
const pairCapable = (e) => isDbl(e) || e.mode === "practice";
const canonSchool = (s) => String(s || "").trim();
function playersHTML(e) {
  const dbl = pairCapable(e), SC = schoolColors(e);
  const pmap = playerMap(e), cnt = Core.pCum(e), last = cnt.length ? cnt[cnt.length - 1] : {};
  let list = e.players.slice();
  list.sort(ui.plSort === "school" ? (a, b) => a.school.localeCompare(b.school, "ja") || b.level - a.level : (a, b) => b.level - a.level || a.school.localeCompare(b.school, "ja"));
  const dupNames = {}; e.players.forEach((p) => { const k = `${p.name}|${p.school}`; dupNames[k] = (dupNames[k] || 0) + 1; });
  const rows = list.map((p) => {
    const partner = Core.partnerOf(e, p.id);
    return `<tr>${dbl ? `<td><input type="checkbox" class="chk" data-action="sel" data-id="${p.id}" ${ui.sel.includes(p.id) ? "checked" : ""} aria-label="${esc(p.name)} を選ぶ"></td>` : ""}
      <td class="c-name ${SC.cls(p.school)}"><input class="cell-input" value="${esc(p.name)}" data-change="p-name" data-id="${p.id}" aria-label="名前">${dupNames[`${p.name}|${p.school}`] > 1 ? `<span class="chip chip-warn">重複</span>` : ""}</td>
      <td><input class="cell-input" list="schools" value="${esc(p.school)}" data-change="p-school" data-id="${p.id}" aria-label="学校"></td>
      <td>${levelPicker(`data-action="set-level" data-id="${p.id}"`, p.level)}</td>
      ${dbl ? `<td>${partner ? `<span class="pairtag">${esc(pn(e, partner))}</span>` : `<span class="faint">—</span>`}</td>` : ""}
      ${e.mode === "practice" ? `<td><button class="link-btn" data-action="pplayer" data-id="${p.id}">${last[p.id] || 0}試合 ›</button></td>` : ""}
      <td><button class="icon-btn" data-action="del-player" data-id="${p.id}" aria-label="${esc(p.name)} を削除">${TRASH}</button></td></tr>`;
  }).join("");
  const selNames = ui.sel.map((id) => esc(pn(e, id)));
  return `<section class="card"><div class="card-head"><div><h2>${isDbl(e) ? "ペアを作る" : "選手を入れる"}</h2><p class="faint">ランクは 1〜5(5 がいちばん強い)。${dbl ? "ペアは、一覧から2人を選んで作ります。" : ""}</p></div>
      <div class="seg" role="group"><button class="${ui.addMode === "one" ? "on" : ""}" data-action="add-mode" data-k="one">1人ずつ</button><button class="${ui.addMode === "paste" ? "on" : ""}" data-action="add-mode" data-k="paste">名簿を貼り付け</button></div></div>
    ${ui.addMode === "one" ? `<form class="add-form" data-form="add-player"><label class="field"><span>名前</span><input class="input" name="name" id="new-name" maxlength="30" autocomplete="off" required></label>
      <label class="field"><span>学校</span><input class="input" name="school" list="schools" maxlength="30" autocomplete="off"></label>
      <div class="field"><span>ランク</span>${levelPicker(`data-action="new-level"`, ui.newLevel)}</div><button class="btn btn-primary" type="submit">追加</button></form>` : pasteHTML(e)}
    <datalist id="schools">${SC.list.map((s) => `<option value="${esc(s)}">`).join("")}</datalist></section>
  <section class="card"><div class="card-head"><div><h2>登録 ${e.players.length}人</h2><p class="faint">名前・学校・ランクはここで直せます。同じ名前・同じ学校が2人いると「重複」と出ます。</p></div>
      <div class="seg"><button class="${ui.plSort === "level" ? "on" : ""}" data-action="plsort" data-k="level">ランク順</button><button class="${ui.plSort === "school" ? "on" : ""}" data-action="plsort" data-k="school">学校順</button></div></div>
    ${dbl && e.players.length > 1 ? (() => { const unp = Core.unpairedPlayers(e).length; if (e.pairs.length && !unp) return ""; return `<div class="confirm" style="background:var(--accent-soft);margin-bottom:12px;flex-direction:column;align-items:flex-start"><b style="color:var(--accent)">ペアの作り方${unp && e.pairs.length ? `(まだペアになっていない人が ${unp}人います)` : ""}</b><span>① 下の一覧で、組ませたい2人の左の □ にチェックを入れる。<br>② 画面の下に出る「この2人をペアにする」を押す。</span><span class="faint">間違えたときは、下の「ペア」の欄で「解除」できます。${e.mode === "practice" ? "同じ学校どうしを一度に作るなら「同じ学校で自動作成」。" : ""}</span>${e.mode === "practice" ? `<button class="btn btn-secondary btn-sm" data-action="auto-pairs">同じ学校で自動作成</button>` : ""}</div>`; })() : ""}
    ${e.players.length ? `<div class="table-wrap"><table class="ptable"><thead><tr>${dbl ? "<th>ペアに<br>する</th>" : ""}<th>名前</th><th>学校</th><th>ランク</th>${dbl ? "<th>ペア</th>" : ""}${e.mode === "practice" ? "<th>試合</th>" : ""}<th></th></tr></thead><tbody>${rows}</tbody></table></div>` : `<p class="muted" style="margin:0">まだ選手がいません。上の欄から入れてください。</p>`}
    ${SC.list.length > 1 ? `<div class="school-legend" style="margin-top:14px">${SC.list.map((s) => `<span class="chip ${SC.cls(s)}">${esc(s)} ${e.players.filter((p) => canonSchool(p.school) === s).length}人</span>`).join("")}</div>` : ""}</section>
  ${dbl ? pairsCardHTML(e) : ""}${dbl && ui.sel.length ? pairBarHTML(e, selNames) : ""}`;
}
function pairBarHTML(e, names) {
  if (ui.confirm && ui.confirm.startsWith("cross:")) {
    const [a, b] = ui.sel, A = playerMap(e)[a], B = playerMap(e)[b];
    return `<div class="pairbar"><span><b>学校がちがうペアです。</b> ${esc(pn(e, a))}(${esc(A.school || "学校なし")}) と ${esc(pn(e, b))}(${esc(B.school || "学校なし")}) で、よいですか？</span><span class="row"><button class="btn btn-primary btn-sm" data-action="pair-go">この組でよい</button><button class="btn btn-ghost btn-sm" data-action="cancel">やめる</button></span></div>`;
  }
  return `<div class="pairbar"><span>${ui.sel.length === 1 ? `${names[0]} と組む人をもう1人選んでください` : `${names[0]} と ${names[1]}`}</span><span class="row"><button class="btn btn-primary btn-sm" data-action="pair-go" ${ui.sel.length === 2 ? "" : "disabled"}>この2人をペアにする</button><button class="btn btn-ghost btn-sm" data-action="sel-clear">選び直す</button></span></div>`;
}
function pairsCardHTML(e) {
  const unp = Core.unpairedPlayers(e);
  const rows = e.pairs.map((pr) => {
    const A = playerMap(e)[pr.a], B = playerMap(e)[pr.b], lv = Core.pairLevel(e, pr), cross = Core.isCrossSchool(e, pr);
    return `<div class="pair-row"><div class="pname">${esc(A.name)}・${esc(B.name)}<span class="pschool">${esc(Core.schoolsOf(A, B))}${cross ? " (学校がちがう)" : ""}${pr.level != null ? " · ランクを手で変更中" : " · ランクは2人の平均"}</span></div>
      <span class="pair-lv"><button data-action="pair-lv" data-id="${pr.id}" data-d="-0.5" aria-label="ランクを下げる">−</button><output>${lvTxt(lv)}</output><button data-action="pair-lv" data-id="${pr.id}" data-d="0.5" aria-label="ランクを上げる">＋</button></span>
      <button class="btn btn-ghost btn-sm" data-action="pair-del" data-id="${pr.id}">解除</button></div>`;
  }).join("");
  return `<section class="card"><div class="card-head"><div><h2>ペア ${e.pairs.length}組</h2><p class="faint">${isDbl(e) ? "リーグ戦・トーナメントには、ペアが出ます。" : "毎回組み替えでも、ここに作ったペアは崩しません。固定のときは、このペアで組みます。"}</p></div>
      ${e.mode === "practice" ? `<button class="btn btn-secondary btn-sm" data-action="auto-pairs">同じ学校で自動作成</button>` : ""}</div>
    ${rows || `<p class="muted" style="margin:0">まだペアがありません。上の一覧で2人にチェックを入れてください。</p>`}
    ${isDbl(e) && unp.length ? `<p class="faint" style="margin:12px 0 0"><span class="chip chip-warn">ペアなし ${unp.length}人</span> ${unp.map((p) => esc(p.name)).join("、")}</p>` : ""}</section>`;
}

/* ---- 名簿の貼り付け(1行に1ペア / 1行に1人 のどちらでも) ---- */
const PAIR_SEP = /[・\/／&＆]/;
const toHalf = (s) => String(s || "").replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xfee0)).trim();
const IMP_ROLES = [["name", "名前"], ["name2", "2人目(1行1ペアのとき)"], ["school", "学校"], ["level", "ランク(1〜5)"], ["rank", "部内順位(1が強い)"], ["skip", "使わない"]];
const IMP_KW = [[/2人目|パートナー|相方/, "name2"], [/名前|氏名|選手|プレーヤー|プレイヤー|ペア|1人目|^name$/i, "name"], [/学校|所属|チーム|校名|団体|クラブ/, "school"], [/ランク|レベル|強さ|^level$/i, "level"], [/順位|ランキング|序列/, "rank"], [/^no\.?$|番号|学年|^年$|^組$|ふりがな|フリガナ|よみ|かな|性別|備考|学籍|^#$/i, "skip"]];
const SCHOOL_RE = /(高校|高等学校|高|中学校|中学|中|学園|学院|大学|小学校|小)$/;
function parseTable(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n"), tab = lines.some((l) => l.includes("\t"));
  return lines.map((l) => l.split(tab ? "\t" : ",").map((c) => c.trim().replace(/^"(.*)"$/, "$1"))).filter((r) => r.some((c) => c !== ""));
}
const roleOfHeader = (h) => { for (const [re, r] of IMP_KW) if (re.test(h)) return r; return null; };
function guessRoles(rows, header) {
  const width = Math.max(...rows.map((r) => r.length)), body = header ? rows.slice(1) : rows, roles = new Array(width).fill(null), taken = (r) => roles.includes(r);
  if (header) rows[0].forEach((h, j) => { let r = roleOfHeader(h); if (r === "name" && taken("name")) r = !taken("name2") ? "name2" : "skip"; else if (r && r !== "skip" && taken(r)) r = "skip"; roles[j] = r; });
  for (let j = 0; j < width; j++) {
    if (roles[j]) continue;
    const vals = body.map((r) => (r[j] || "").trim()).filter(Boolean);
    if (!vals.length) { roles[j] = "skip"; continue; }
    const nums = vals.map((v) => (/^[0-9０-９]+$/.test(v) ? parseInt(toHalf(v), 10) : null));
    if (nums.every((n) => n !== null)) { const seq = vals.length > 2 && nums.every((n, i) => n === nums[0] + i); roles[j] = !seq && !taken("level") && nums.every((n) => n >= 1 && n <= 10) ? "level" : "skip"; continue; }
    const schoolish = vals.filter((v) => SCHOOL_RE.test(v)).length >= vals.length * 0.6, repeats = vals.length >= 3 && new Set(vals).size < vals.length * 0.8;
    if ((schoolish || repeats) && !taken("school")) roles[j] = "school";
    else if (!taken("name")) roles[j] = "name";
    else if (!taken("name2")) roles[j] = "name2";
    else if (!taken("school")) roles[j] = "school";
    else roles[j] = "skip";
  }
  return roles;
}
function analyzeImport(text) {
  if (!text.trim()) return null;
  if (!/[\t,]/.test(text)) return { text, free: true, layout: "auto" };
  const rows = parseTable(text);
  if (!rows.length) return null;
  const header = rows.length > 1 && rows[0].some((c) => roleOfHeader(c)) && !rows[0].some((c) => /^[0-9０-９]+$/.test(c.trim()));
  return { text, free: false, rows, header, roles: guessRoles(rows, header), layout: "auto" };
}
const lvOf = (v, ten) => { v = parseInt(toHalf(v), 10); return v ? (ten ? to5(v) : clamp(v, 1, RANK_MAX)) : 3; };
/* 貼り付けの1行(自由な書き方)→ { names:[…], school, level } */
function parseLine(line, layout) {
  const sep = line.includes("\t") || line.includes(",") || line.includes("、");
  let cols = line.includes("\t") ? line.split("\t") : line.includes(",") ? line.split(",") : line.includes("、") ? line.split("、") : line.trim().split(/\s{2,}|　+/);
  if (cols.length === 1) cols = line.trim().split(/\s+/);
  cols = cols.map((c) => c.trim()).filter((c, i) => c !== "" || i < 2);
  if (!cols[0] || /^(名前|氏名|選手|ペア|1人目)/.test(cols[0])) return null;
  let level = 3;
  const last = String(cols[cols.length - 1]);
  if (cols.length >= 2 && /^[0-9０-９]+$/.test(last)) { level = lvOf(last, parseInt(toHalf(last), 10) > RANK_MAX); cols = cols.slice(0, -1); }
  const looksPair = PAIR_SEP.test(cols[0]) || (sep && cols.length >= 3 && !SCHOOL_RE.test(cols[1]) && SCHOOL_RE.test(cols[2])) || (!sep && cols.length >= 4 && !SCHOOL_RE.test(cols[1]) && SCHOOL_RE.test(cols[cols.length - 1]) && layout === "pair");
  const asPair = layout === "pair" ? true : layout === "one" ? false : looksPair;
  if (asPair) {
    let names, school = "";
    if (PAIR_SEP.test(cols[0])) { names = cols[0].split(PAIR_SEP).map((s) => s.trim()); school = cols.slice(1).join(" "); }
    else if (sep && cols.length >= 3) { names = [cols[0], cols[1] || ""]; school = cols[2] || ""; }
    else if (sep) { const t = cols[0].split(/[\s　]+/).filter(Boolean); names = t.length === 4 ? [t.slice(0, 2).join(" "), t.slice(2).join(" ")] : [t[0], t.slice(1).join(" ")]; school = cols[1] || ""; }
    else { const nm = cols.length >= 3 ? cols.slice(0, -1) : cols; school = cols.length >= 3 ? cols[cols.length - 1] : ""; names = nm.length === 4 ? [nm.slice(0, 2).join(" "), nm.slice(2).join(" ")] : [nm[0], nm.slice(1).join(" ")]; }
    return { names: names.slice(0, 2).filter((x) => x !== undefined), school, level };
  }
  let name, school = "";
  if (cols.length >= 3 && !sep) { school = cols[cols.length - 1]; name = cols.slice(0, -1).join(" "); } else { name = cols[0]; school = cols[1] || ""; }
  return { names: [name], school, level };
}
/* 取り込む行を作る。{ rows:[{names,school,level}], empty, dup } */
function buildImport(e) {
  const imp = ui.imp;
  if (!imp) return { rows: [], empty: 0, dup: 0 };
  let rows;
  if (imp.free) rows = imp.text.split(/\r?\n/).filter((l) => l.trim()).map((l) => parseLine(l, imp.layout)).filter(Boolean);
  else {
    const body = imp.header ? imp.rows.slice(1) : imp.rows, ci = Object.fromEntries(["name", "name2", "school", "level", "rank"].map((r) => [r, imp.roles.indexOf(r)]));
    if (ci.name < 0) return { rows: [], empty: 0, dup: 0, noName: true };
    const ten = ci.level >= 0 && body.some((r) => parseInt(toHalf(r[ci.level]), 10) > RANK_MAX), n = body.length;
    rows = body.map((r) => {
      let names = [(r[ci.name] || "").trim()];
      const n2 = ci.name2 >= 0 ? (r[ci.name2] || "").trim() : "";
      if (imp.layout !== "one") { if (n2) names.push(n2); else if (imp.layout === "pair" || (imp.layout === "auto" && PAIR_SEP.test(names[0]))) names = names[0].split(PAIR_SEP).map((s) => s.trim()).slice(0, 2); }
      let level = 3;
      if (ci.level >= 0) level = lvOf(r[ci.level], ten); else if (ci.rank >= 0) { const v = parseInt(toHalf(r[ci.rank]), 10); if (v) level = clamp(RANK_MAX - Math.floor(((v - 1) * RANK_MAX) / Math.max(n, 1)), 1, RANK_MAX); }
      return { names, school: ci.school >= 0 ? (r[ci.school] || "").trim() : "", level };
    });
  }
  const norm = (s) => s.replace(/[\s　]+/g, "");
  const have = new Set(e.players.map((p) => norm(p.name) + "|" + canonSchool(p.school)));
  let empty = 0, dup = 0; const out = [];
  rows.forEach((r) => {
    if (!r.names[0]) { empty++; return; }
    const keys = r.names.filter(Boolean).map((nm) => norm(nm) + "|" + canonSchool(r.school));
    if (keys.some((k) => have.has(k))) { dup++; return; }
    keys.forEach((k) => have.add(k)); out.push(r);
  });
  return { rows: out, empty, dup };
}
function pasteHTML(e) {
  return `<textarea class="input" id="paste-box" data-input="paste" rows="6" style="width:100%;font-family:ui-monospace,Consolas,monospace;font-size:.86rem" placeholder="Excel から行を選んでコピーして貼り付け。1行に1人でも、1行に1ペアでも読めます。&#10;山田 太郎　東高　3&#10;山田・佐藤　東高　4">${esc(ui.imp ? ui.imp.text : "")}</textarea><div id="import-preview">${importPreviewHTML(e)}</div>`;
}
function importPreviewHTML(e) {
  const imp = ui.imp;
  if (!imp) return "";
  const res = buildImport(e), pairs = res.rows.filter((r) => r.names.length === 2).length, ones = res.rows.length - pairs;
  const sample = res.rows.slice(0, 3).map((r) => `${esc(r.names.join("・"))}(${esc(r.school) || "学校なし"}・ランク${r.level})`).join("、");
  const notes = [res.dup ? `もう入っている ${res.dup}行はとばします` : "", res.empty ? `名前が空の ${res.empty}行はとばします` : ""].filter(Boolean).join(" / ");
  let table = "";
  if (!imp.free) {
    const width = Math.max(...imp.rows.map((r) => r.length));
    const sel = (j) => `<select class="select imp-role ${imp.roles[j] === "skip" ? "is-skip" : ""}" data-change="imp-role" data-col="${j}" aria-label="${j + 1}列目は何か">${IMP_ROLES.map(([r, l]) => `<option value="${r}" ${imp.roles[j] === r ? "selected" : ""}>${l}</option>`).join("")}</select>`;
    const shown = imp.rows.slice(0, imp.header ? 7 : 6);
    table = `<p class="faint" style="margin:0">列の上のメニューで、それぞれの列が何かを確かめてください。</p><div class="table-wrap"><table class="imp-table"><thead><tr>${Array.from({ length: width }, (_, j) => `<th>${sel(j)}</th>`).join("")}</tr></thead><tbody>${shown.map((r, i) => `<tr class="${imp.header && i === 0 ? "is-head" : ""}">${Array.from({ length: width }, (_, j) => `<td class="${imp.roles[j] === "skip" ? "is-skip" : ""}">${esc(r[j] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      ${imp.rows.length > shown.length ? `<p class="faint" style="margin:0">ほか ${imp.rows.length - shown.length} 行</p>` : ""}<label class="check"><input type="checkbox" data-change="imp-header" ${imp.header ? "checked" : ""}>1行目は見出し(取り込まない)</label>`;
  }
  const lay = `<div class="seg"><button class="${imp.layout === "auto" ? "on" : ""}" data-action="imp-layout" data-k="auto">自動</button><button class="${imp.layout === "one" ? "on" : ""}" data-action="imp-layout" data-k="one">1行に1人</button>${pairCapable(e) ? `<button class="${imp.layout === "pair" ? "on" : ""}" data-action="imp-layout" data-k="pair">1行に1ペア</button>` : ""}</div>`;
  return `<div class="imp-box">${lay}${table}${res.noName ? `<p class="imp-warn">「名前」の列を1つ選んでください。</p>` : `<p style="margin:0"><b>${ones}人${pairs ? ` + ペア${pairs}組(${pairs * 2}人)` : ""}</b> を取り込みます${sample ? `:${sample}${res.rows.length > 3 ? " …" : ""}` : ""}</p>`}
    ${notes ? `<p class="faint" style="margin:0">${notes}</p>` : ""}<div class="row"><button class="btn btn-primary" data-action="imp-go" ${res.rows.length ? "" : "disabled"}>取り込む</button><button class="btn btn-ghost btn-sm" data-action="imp-clear">やめる</button></div></div>`;
}
function importGo(e) {
  const res = buildImport(e);
  res.rows.forEach((r) => {
    const mk = (nm, school) => { const p = { id: uid(), name: nm, school: school || "", level: r.level }; e.players.push(p); return p; };
    // 「東高・西高」のように2校書いてあれば、それぞれの学校にする
    const [s1, s2] = (r.school || "").includes("・") ? r.school.split("・").map((x) => x.trim()) : [r.school, r.school];
    const a = mk(r.names[0], s1);
    if (r.names.length === 2 && r.names[1]) { const b = mk(r.names[1], s2 || s1); e.pairs.push({ id: uid(), a: a.id, b: b.id, level: null }); }
  });
  ui.imp = null; commit(); render();
  toast(`${res.rows.length}行を取り込みました${res.dup ? `(${res.dup}行はとばしました)` : ""}`);
}
Object.assign(App, { pairCapable, importGo, importPreviewHTML, analyzeImport });

/* ============ Excelへのコピー ============ */
const xlGames = (e, games) => { const out = []; for (let g = 0; g < e.games; g++) { const [x, y] = games[g] || [null, null]; out.push(x == null || y == null ? "" : `${x}－${y}`); } return out; };
const xlScore = (e, o) => (o.wo ? "不戦" : o.quick ? "" : e.games === 1 ? `${o.pa}－${o.pb}` : `${o.ga}－${o.gb}`);
const gameHeads = (e) => (e.games === 1 ? ["スコア"] : ["第1ゲーム", "第2ゲーム", "第3ゲーム"]);
Object.assign(App, { xlGames, xlScore, gameHeads });
function exportBlocks(e) {
  const blocks = [];
  App.blocks.forEach((f) => { const b = f(e); if (b) blocks.push(...[].concat(b)); });
  return blocks;
}
App.blocks = [];
function exportHTML(e) {
  const blocks = exportBlocks(e);
  return `<section class="card"><div class="card-head"><div><h2>Excelに貼り付け</h2><p class="faint">押すとコピーされます。Excel で貼りたいセルを選んで Ctrl+V。スコアは日付に化けません。</p></div><button class="btn btn-ghost btn-sm" data-action="toggle-export">閉じる</button></div>
    ${blocks.length ? `<p class="muted" style="margin:0 0 12px">${blocks.map((b) => esc(b.title)).join(" / ")}</p><button class="btn btn-excel" data-action="x-copy">Excelにコピー</button>` : `<p class="muted" style="margin:0">まだコピーできる表がありません。</p>`}</section>`;
}
function copyBoxHTML() { return `<section class="card copybox"><div class="card-head"><div><h3>コピー用テキスト</h3><p class="faint">自動でコピーできなかったので、下を全部選んでコピーし、Excel に貼り付けてください。</p></div><button class="btn btn-ghost btn-sm" data-action="close-copy">閉じる</button></div><textarea class="input" id="copy-area" readonly>${esc(ui.copyText)}</textarea></section>`; }
function copyTables(blocks, what) {
  const e = ev(), width = Math.max(2, ...blocks.flatMap((b) => b.rows.map((r) => r.length)));
  const text = [`${e.name}\t${e.date}`, ...blocks.map((b) => [b.title, ...b.rows.map((r) => r.join("\t"))].join("\n"))].join("\n\n");
  const td = (v, head) => { const st = (head ? "font-weight:bold;background:#eef0f7;" : "") + "border:1px solid #c8cad3;"; return typeof v === "number" ? `<td style="${st}">${v}</td>` : `<td style="${st}mso-number-format:'\\@'">${esc(v)}</td>`; };
  const html = `<meta charset="utf-8"><table><tr><td colspan="${width}" style="font-weight:bold;font-size:14pt">${esc(e.name)} ${esc(e.date)}</td></tr>${blocks.map((b) => `<tr><td colspan="${width}"></td></tr><tr><td colspan="${width}" style="font-weight:bold">${esc(b.title)}</td></tr>${b.rows.map((r, i) => `<tr>${r.map((v) => td(v, i === 0)).join("")}</tr>`).join("")}`).join("")}</table>`;
  const done = () => { ui.copyText = null; render(); toast(`${what}をコピーしました。Excel で貼りたいセルを選んで Ctrl+V`); };
  const fail = () => { ui.copyText = text; render(); const ta = $("#copy-area"); if (ta) { ta.scrollIntoView({ block: "center" }); ta.focus(); ta.select(); } };
  const plain = () => { try { navigator.clipboard.writeText(text).then(done, fail); } catch (err) { fail(); } };
  try { if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) navigator.clipboard.write([new ClipboardItem({ "text/plain": new Blob([text], { type: "text/plain" }), "text/html": new Blob([html], { type: "text/html" }) })]).then(done, plain); else if (navigator.clipboard && navigator.clipboard.writeText) plain(); else fail(); } catch (err) { plain(); }
}
App.copyTables = copyTables;

/* ============ 操作(ボタン・入力) ============ */
const A = App.A, Ch = App.Ch, F = App.F;
function newEvent(mode, name, type) {
  const e = Core.blankEvent({ id: uid(), name: name || "名前なし", mode, type: mode === "practice" ? "singles" : type });
  if (mode === "practice") { e.games = 3; e.points = 15; }
  events[e.id] = e; currentId = e.id; ui.view = "event"; ui.tab = "players"; ui.createMode = null; Store.save(e); render(); scrollTo(0, 0);
}
App.newEvent = newEvent;
Object.assign(A, {
  tab: (b) => { ui.tab = b.dataset.tab; ui.sel = []; ui.confirm = null; render(); },
  home: () => { Object.assign(ui, { view: "home", createMode: null, confirm: null, copyText: null }); render(); scrollTo(0, 0); },
  theme: () => { setTheme(isDark() ? "light" : "dark"); render(); },
  "open-event": (b) => { currentId = b.dataset.id; ui.view = "event"; ui.confirmDel = null; ui.tab = "players"; ui.sel = []; ui.imp = null; render(); scrollTo(0, 0); },
  "del-home": (b) => { ui.confirmDel = b.dataset.id; render(); },
  "del-home-no": () => { ui.confirmDel = null; render(); },
  "del-home-yes": (b) => { const id = b.dataset.id; delete events[id]; ui.confirmDel = null; Store.remove(id); render(); toast("削除しました"); },
  "pick-mode": (b) => { ui.createMode = b.dataset.mode; render(); scrollTo(0, 0); },
  "cancel-create": () => { ui.createMode = null; render(); },
  "toggle-settings": () => { ui.showSettings = !ui.showSettings; ui.confirm = null; render(); },
  "ask-del-event": () => { ui.confirm = "del-event"; render(); },
  "del-event": () => { const id = currentId; delete events[id]; currentId = null; Object.assign(ui, { view: "home", confirm: null, showSettings: false }); Store.remove(id); render(); toast("削除しました"); },
  cancel: () => { ui.confirm = null; render(); },
  "toggle-export": () => { ui.exportOpen = !ui.exportOpen; ui.copyText = null; render(); },
  "close-copy": () => { ui.copyText = null; render(); },
  "x-copy": () => { const e = ev(); copyTables(exportBlocks(e), "表"); },
  sample: (b) => { const s = App.makeSample(b.dataset.type); events[s.id] = s; currentId = s.id; ui.view = "event"; ui.tab = s.mode === "practice" ? "players" : "matches"; Store.save(s); render(); scrollTo(0, 0); },
  "add-mode": (b) => { ui.addMode = b.dataset.k; render(); },
  "new-level": (b) => { ui.newLevel = Number(b.dataset.lv); render(); const n = $("#new-name"); if (n) n.focus(); },
  "set-level": (b) => { const p = playerMap(ev())[b.dataset.id]; if (p) { p.level = Number(b.dataset.lv); commit(); render(); } },
  plsort: (b) => { ui.plSort = b.dataset.k === "school" ? "school" : "level"; render(); },
  "del-player": (b) => { const e = ev(), id = b.dataset.id, p = playerMap(e)[id]; if (!p) return; const used = e.practice.rounds.some((r) => Core.pPlaced(r).includes(id)) || Object.keys(e.results).some((k) => k.includes(id));
    if (used && !askOk(`${p.name} は試合に入っています。削除すると、その試合の組み合わせや結果も消えます。削除しますか？`)) return;
    e.players = e.players.filter((x) => x.id !== id); e.pairs = e.pairs.filter((x) => x.a !== id && x.b !== id);
    ui.sel = ui.sel.filter((x) => x !== id);
    e.practice.rounds.forEach((r) => { r.rest = r.rest.filter((x) => x !== id); r.matches.forEach((m) => { m.a = m.a.map((x) => (x === id ? null : x)); m.b = m.b.map((x) => (x === id ? null : x)); }); });
    e.practice.dayOff = e.practice.dayOff.filter((x) => x.id !== id);
    const ids = new Set(Core.entries(e).map((x) => x.id)); e.leagues.forEach((l) => (l.ids = l.ids.filter((x) => ids.has(x)))); e.bracket = e.bracket && e.bracket.slots.some((s) => s && !ids.has(s)) ? null : e.bracket;
    commit(); render(); },
  sel: (b) => { const id = b.dataset.id, i = ui.sel.indexOf(id); if (i >= 0) ui.sel.splice(i, 1); else { if (ui.sel.length >= 2) ui.sel.shift(); ui.sel.push(id); } ui.confirm = null; render(); },
  "sel-clear": () => { ui.sel = []; ui.confirm = null; render(); },
  "pair-go": () => {
    const e = ev(); if (ui.sel.length !== 2) return;
    const [a, b] = ui.sel;
    if (!ui.confirm && Core.isCrossSchool(e, { a, b })) { ui.confirm = "cross:" + a; render(); return; }
    const r = Core.makePair(e, a, b); ui.sel = []; ui.confirm = null; commit(); render();
    toast(`${pn(e, a)}・${pn(e, b)} をペアにしました${r && r.broke.length ? "(前の組は解きました)" : ""}`);
  },
  "pair-del": (b) => { Core.removePair(ev(), b.dataset.id); const e = ev(); e.leagues.forEach((l) => (l.ids = l.ids.filter((x) => x !== b.dataset.id))); commit(); render(); },
  "pair-lv": (b) => { const e = ev(), pr = e.pairs.find((x) => x.id === b.dataset.id); if (!pr) return; pr.level = Core.clamp(Core.roundHalf(Core.pairLevel(e, pr) + Number(b.dataset.d)), 1, RANK_MAX); commit(); render(); },
  "auto-pairs": () => { const e = ev(), n = Core.autoPairs(e); commit(); render(); toast(n ? `${n}組のペアを作りました` : "作れるペアがありません(同じ学校で2人以上の人がいません)"); },
  "imp-go": () => importGo(ev()),
  "imp-clear": () => { ui.imp = null; render(); },
  "imp-layout": (b) => { ui.imp.layout = b.dataset.k; $("#import-preview").innerHTML = importPreviewHTML(ev()); },
});
Object.assign(Ch, {
  "ev-name": (t) => { const e = ev(); e.name = t.value.trim() || "名前なし"; commit(); render(); },
  "ev-date": (t) => { ev().date = t.value; commit(); render(); },
  "ev-games": (t) => { ev().games = Number(t.value) === 3 ? 3 : 1; commit(); render(); },
  "ev-points": (t) => { ev().points = Number(t.value); commit(); render(); },
  "ev-maxday": (t) => { ev().maxPerDay = clamp(Number(t.value), 1, 12); commit(); render(); },
  "switch-event": (t) => { currentId = t.value; ui.tab = "players"; ui.sel = []; render(); },
  "p-name": (t) => { const p = playerMap(ev())[t.dataset.id]; if (p) { p.name = t.value.trim(); commit(); render(); } },
  "p-school": (t) => { const p = playerMap(ev())[t.dataset.id]; if (p) { p.school = t.value.trim(); commit(); render(); } },
  "imp-role": (t) => { const imp = ui.imp, j = Number(t.dataset.col), r = t.value; if (r !== "skip") imp.roles.forEach((x, k) => { if (x === r && k !== j) imp.roles[k] = "skip"; }); imp.roles[j] = r; $("#import-preview").innerHTML = importPreviewHTML(ev()); },
  "imp-header": (t) => { ui.imp.header = t.checked; ui.imp.roles = guessRoles(ui.imp.rows, ui.imp.header); $("#import-preview").innerHTML = importPreviewHTML(ev()); },
});
Object.assign(F, {
  create: (f) => { const d = new FormData(f); newEvent(ui.createMode, String(d.get("name") || "").trim(), d.get("type") === "doubles" ? "doubles" : "singles"); },
  "add-player": (f) => {
    const e = ev(), d = new FormData(f), name = String(d.get("name") || "").trim(), school = String(d.get("school") || "").trim();
    if (!name) return;
    if (e.players.some((p) => p.name === name && p.school === school)) { toast("同じ名前・同じ学校の人がもういます"); return; }
    e.players.push({ id: uid(), name, school, level: ui.newLevel }); commit(); render(); const n = $("#new-name"); if (n) n.focus();
  },
});
App.input = (t) => {
  if (t.dataset.input === "paste") { ui.imp = analyzeImport(t.value); if (ui.imp) ui.imp.text = t.value; $("#import-preview").innerHTML = importPreviewHTML(ev()); return true; }
  return false;
};
App.views.players = playersHTML;
App.lvTxt = lvTxt;
Object.assign(App, { setReady: () => { ready = true; }, isDark, setTheme, THEME_KEY });

/* ============ 起動 ============ */
App.boot = async () => {
  try { const t = localStorage.getItem(THEME_KEY); document.documentElement.dataset.theme = t === "dark" ? "dark" : "light"; } catch (e) { document.documentElement.dataset.theme = "light"; }
  render();
  await Store.init();
  events = await Store.loadAll();
  const list = sortedEvents(); currentId = list.length ? list[0].id : null;
  ready = true; render(); Store.subscribe();
  if (!Store.db) setSave("local");
};
})();
