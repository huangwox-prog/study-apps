/* ============================================================
   CLEAR 画面 (app) — C: 練習試合・成績・ドラッグ・印刷・イベント
   ============================================================ */
(() => {
"use strict";
const { clamp, uid, playerMap, keyOf } = Core;
const App = window.App, { A, Ch, F, ui, esc, $, lvTxt } = App;
const ev = App.ev, commit = App.commit, render = App.render, toast = App.toast, pn = App.pn;
Object.assign(ui, { pOpen: null, pView: "list", pSort: "level", nextKind: null, nextDay: null, nextRest: [], pSheetRound: "all", pPlayer: null, ask: null, showRest: false, showSet: false });

const rById = (e, id) => e.practice.rounds.find((r) => r.id === id);
const kindLabel = (r) => (r.kind === "doubles" ? (r.fixed ? "ダブルス(ペア固定)" : "ダブルス(毎回組み替え)") : "シングルス");
const nextKindOf = (e) => ui.nextKind || (e.practice.kind === "doubles" ? (e.practice.pairMode === "fixed" ? "fixed" : "rotate") : "singles");
const restAll = (e, r, ri) => [...new Set([...r.rest, ...Core.keptAt(e, ri)])];
const isKept = (e, id, ri) => Core.keptAt(e, ri).includes(id);
const matchById = (e, mid) => { for (const r of e.practice.rounds) { const m = r.matches.find((x) => x.id === mid); if (m) return [r, m]; } return [null, null]; };

/* ---------- 回転の作成・組み直し ---------- */
function genFor(e, r, ri, must, reunite) { return Core.genRound(e, r.kind, restAll(e, r, ri), ri, must, undefined, !!reunite, r.kind === "doubles" ? !!r.fixed : false); }
function emptyLast(r) { r.matches.sort((x, y) => (x.a.some((v) => !v) || x.b.some((v) => !v) ? 1 : 0) - (y.a.some((v) => !v) || y.b.some((v) => !v) ? 1 : 0)); }
function regen(e, r, must, msg, reunite) {
  const ri = e.practice.rounds.indexOf(r), g = genFor(e, r, ri, must || [], reunite);
  r.matches = g.matches; r.left = g.leftover || []; commit(); render(); if (msg) toast(msg);
}
function createRound(e, reunite) {
  const kindSel = nextKindOf(e), kind = kindSel === "singles" ? "singles" : "doubles", fixed = kindSel === "fixed";
  if (kind === "doubles" && fixed && !e.pairs.length) { toast("ペア固定には、先に選手の画面でペアを作ってください(同じ学校で自動作成もできます)"); return; }
  e.practice.kind = kind; e.practice.pairMode = fixed ? "fixed" : "rotate"; e.practice.dayOff.forEach((x) => (x.from = Math.min(x.from, e.practice.rounds.length)));
  const rs = e.practice.rounds, ri = rs.length, day = ui.nextDay || (rs.length ? rs[rs.length - 1].day : 1);
  const r = { id: uid(), day, kind, fixed: kind === "doubles" && fixed, rest: [...new Set([...ui.nextRest, ...Core.keptAt(e, ri)])], matches: [] };
  rs.push(r);
  const g = genFor(e, r, ri, [], reunite);
  r.matches = g.matches; r.left = g.leftover || []; ui.nextRest = []; ui.ask = null; commit(); render();
  toast(g.matches.length ? `第${ri + 1}回転を作りました(${g.matches.length}試合)` : "試合を作れませんでした(人数が足りません)");
  setTimeout(() => { const n = document.getElementById(`round-${r.id}`); if (n) n.scrollIntoView({ block: "start", behavior: "smooth" }); }, 50);
}
/* 固定ペアの片方が休むとき、どうするか聞く(休む人に登録ペアの相方がいて、その相方は休まないとき) */
function brokenFixed(e, restIds) { const out = []; restIds.forEach((id) => { const mate = Core.partnerOf(e, id); if (mate && !restIds.includes(mate) && !out.some((x) => x.mate === id)) out.push({ id, mate }); }); return out; }

/* ---------- ドラッグ&ドロップで動かす ---------- */
function posOf(m, side, pos) { return m[side][pos]; }
function takeOut(e, r, id, keep) {
  r.matches.forEach((m) => { m.a = m.a.map((x) => (x === id ? null : x)); m.b = m.b.map((x) => (x === id ? null : x)); });
  if (!r.rest.includes(id)) r.rest.push(id);
  const ri = e.practice.rounds.indexOf(r);
  if (keep) { e.practice.dayOff = e.practice.dayOff.filter((x) => x.id !== id).concat({ id, from: ri }); e.practice.rounds.forEach((x, k) => { if (k > ri && !Core.pPlaced(x).includes(id) && !x.rest.includes(id)) x.rest.push(id); }); }
  emptyLast(r);
}
/* 空き枠に ids(1人か2人)を入れる。入れたら true */
function placeInto(r, ids) {
  for (const m of r.matches) for (const side of ["a", "b"]) {
    const empties = m[side].map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    if (ids.length === 2 ? m[side].length === 2 && empties.length === 2 : empties.length >= 1) { ids.forEach((id, k) => (m[side][empties[k]] = id)); return true; }
  }
  return false;
}
function fillEmpty(r, ri, id) {
  if (r.matches.some((m) => [...m.a, ...m.b].filter((x) => x === id).length)) return;
  let ok = false;
  for (const m of r.matches) for (const side of ["a", "b"]) { const i = m[side].indexOf(null); if (!ok && i >= 0) { m[side][i] = id; ok = true; } }
  return ok;
}
function bringBack(e, r, id, silent) {
  const ri = e.practice.rounds.indexOf(r);
  r.rest = r.rest.filter((x) => x !== id);
  if (isKept(e, id, ri)) { e.practice.dayOff = e.practice.dayOff.filter((x) => x.id !== id); e.practice.rounds.forEach((x, k) => { if (k > ri) x.rest = x.rest.filter((y) => y !== id); }); }
  if (Core.pPlaced(r).includes(id)) { commit(); render(); return; }
  const mate = Core.partnerOf(e, id);
  const pairBack = r.kind === "doubles" && mate && r.rest.includes(mate) && placeInto(r, [id, mate]);
  if (pairBack) { r.rest = r.rest.filter((x) => x !== mate); if (isKept(e, mate, ri)) { e.practice.dayOff = e.practice.dayOff.filter((x) => x.id !== mate); } }
  else if (!fillEmpty(r, ri, id)) {
    if (!r.matches.some((m) => m.win || !Core.isEmptyGames(m.g))) { regen(e, r, [id], `${pn(e, id)} を入れて、第${ri + 1}回転を組み直しました`); return; }
    toast("空き枠がありません。結果を入れた回転なので、組み直さず待機のままにしています");
  }
  commit(); render();
}
const sideOf = (r, key) => { const [, mi, side] = key.split(":"); return [r.matches[Number(mi)], side]; };
function rd(e, ri) { return e.practice.rounds[Number(ri)]; }
App.drops = App.drops || {};
App.drops.pteam = (from, to) => {
  const e = ev(), [ri, mi, side] = from.split(":"), r = rd(e, ri); if (!r) return;
  const src = r.matches[Number(mi)][side];
  if (!to.includes(":")) { // 待機へ:ペアごと外す
    if (to !== ri) return; src.filter(Boolean).forEach((id) => takeOut(e, r, id)); commit(); render(); toast("ペアごと「今回だけ抜く」にしました"); return; }
  const [tri, tmi, tside] = to.split(":"); if (tri !== ri || (tmi === mi && tside === side)) return;
  const dst = r.matches[Number(tmi)][tside];
  const a = r.matches[Number(mi)], b = r.matches[Number(tmi)]; [a[side], b[tside]] = [dst, src];
  commit(); render(); toast("ペアごと入れ替えました");
};
App.drops.pmember = (from, to) => {
  const e = ev(), [ri, mi, side, pos] = from.split(":"), r = rd(e, ri); if (!r) return;
  const m = r.matches[Number(mi)], id = m[side][Number(pos)]; if (!id) return;
  if (!to.includes(":")) { // 待機へ:1人だけ外す
    if (to !== ri) return;
    const mate = r.kind === "doubles" ? m[side].find((x) => x && x !== id) : null;
    if (mate && Core.partnerOf(e, id) === mate) { ui.ask = { ri: Number(ri), mi: Number(mi), side, id, mate }; render(); return; }
    takeOut(e, r, id); commit(); render(); toast(`${pn(e, id)} を「今回だけ抜く」にしました`); return; }
  const parts = to.split(":"), [tri, tmi, tside] = parts; if (tri !== ri) return;
  const tpos = parts.length === 4 ? Number(parts[3]) : m[side].length === 1 ? 0 : tside === side && tmi === mi ? -1 : null;
  const tm = r.matches[Number(tmi)];
  if (parts.length < 4) { // チームの上に落とした:空き枠があればそこへ
    const i = tm[tside].indexOf(null); if (i < 0) return; m[side][Number(pos)] = null; tm[tside][i] = id; emptyLast(r); commit(); render(); return; }
  if (tmi === mi && tside === side && tpos === Number(pos)) return;
  const other = tm[tside][tpos];
  const brk = [id, other].filter(Boolean).some((x) => { const mate = Core.partnerOf(e, x); return mate && (m[side].includes(mate) || tm[tside].includes(mate)) && !(m === tm && side === tside); });
  if (brk && !App.askOk("登録したペアの組が変わります。入れ替えますか？")) return;
  m[side][Number(pos)] = other || null; tm[tside][tpos] = id; emptyLast(r); commit(); render();
  toast(other ? `${pn(e, id)} と ${pn(e, other)} を入れ替えました` : "動かしました");
};
App.drops.pbenchp = (from, to) => {
  const e = ev(), [ri, id] = from.split(":"), r = rd(e, ri); if (!r || !to.includes(":")) return;
  const parts = to.split(":"), [tri, tmi, tside] = parts; if (tri !== ri) return;
  const tm = r.matches[Number(tmi)];
  r.rest = r.rest.filter((x) => x !== id);
  if (isKept(e, id, Number(ri))) e.practice.dayOff = e.practice.dayOff.filter((x) => x.id !== id);
  if (parts.length === 4) { const old = tm[tside][Number(parts[3])]; tm[tside][Number(parts[3])] = id; if (old) { r.rest.push(old); } }
  else { const i = tm[tside].indexOf(null); if (i < 0) { r.rest.push(id); toast("空き枠がありません"); return; } tm[tside][i] = id; }
  emptyLast(r); commit(); render();
};

/* ---------- 画面 ---------- */
const lvl = (e, id) => (playerMap(e)[id] ? playerMap(e)[id].level : 3);
function memberHTML(e, SC, r, ri, mi, side, pos, id, cum) {
  const p = playerMap(e)[id], key = `${ri}:${mi}:${side}:${pos}`;
  if (!id || !p) return `<div class="empty-slot" data-drop="pmember pbenchp" data-drop-id="${key}">空き枠 — 下の置き場から名前をドラッグ</div>`;
  const q = ui.q && App.qMatch(p);
  return `<div class="member ${SC.cls(p.school)}" data-drag="pmember" data-drag-id="${key}" data-drag-label="${esc(p.name)}" data-drop="pmember pbenchp" data-drop-id="${key}" ${q ? `style="outline:2px solid var(--accent)"` : ""}>
    <button class="plink" data-action="pplayer" data-id="${id}">${esc(p.name)}</button><button class="mem-x" data-action="pout" data-r="${ri}" data-m="${mi}" data-s="${side}" data-p="${pos}" title="${esc(p.name)} だけ抜く">抜く</button>
    <span class="pschool">${esc(p.school)} · ランク${lvTxt(p.level)} · ${cum[id] || 0}試合目</span></div>`;
}
function teamHTML(e, SC, r, ri, mi, side, cum, win) {
  const m = r.matches[mi], ids = m[side], pair = ids.length === 2, key = `${ri}:${mi}:${side}`;
  const reg = pair && ids[0] && ids[1] && Core.partnerOf(e, ids[0]) === ids[1];
  return `<div class="team ${side} ${pair ? "pair" : ""} ${win ? "win" : ""}" data-drop="pteam pbenchp" data-drop-id="${key}">
    ${pair ? `<span class="team-grip" data-drag="pteam" data-drag-id="${key}" data-drag-label="ペア ${esc(ids.filter(Boolean).map((x) => pn(e, x)).join("・"))}" title="ペアごと動かす">⠿</span>` : ""}
    ${ids.map((id, pos) => memberHTML(e, SC, r, ri, mi, side, pos, id, cum)).join("")}
    ${pair ? `<span class="faint" style="font-size:.7rem">${reg ? "登録ペア · " : ""}平均ランク ${lvTxt(Core.sideLevel(e, ids.filter(Boolean)))}</span>` : ""}
    ${pair ? `<button class="mem-x" data-action="pout-team" data-r="${ri}" data-m="${mi}" data-s="${side}">ペアで抜く</button>` : ""}</div>`;
}
function pStHTML(e, o) {
  if (!o.started) return "";
  return `<span class="pst"><span class="${o.winner === "a" ? "w" : ""}">${o.ga}</span> − <span class="${o.winner === "b" ? "w" : ""}">${o.gb}</span></span>`;
}
function pMatchHTML(e, SC, r, ri, mi, iss, cum) {
  const m = r.matches[mi], o = Core.pOutcome(e, m), open = ui.pOpen === m.id;
  const games = Array.from({ length: e.games }, (_, g) => m.g[g] || [null, null]).filter((x, g) => x[0] != null || x[1] != null || g === 0);
  const gtxt = games.filter((x) => x[0] != null || x[1] != null).map(([x, y]) => `${x ?? ""}-${y ?? ""}`).join(" / ");
  const notes = (iss.per[mi] || []).map((n) => `<span class="note ${n.lv === "err" ? "err" : n.lv === "dup" ? "dup" : n.lv === "warn" ? "warn" : ""}">${esc(n.t)}</span>`).join("");
  const cur = `data-m="${m.id}"`;
  const inputs = open ? `<div class="pm-extra" style="grid-column:1/-1">${Array.from({ length: e.games }, (_, g) => { const [x, y] = m.g[g] || [null, null], bad = Core.gameWarn(e, x, y); return `<div class="game">${e.games > 1 ? `<span class="game-label">第${g + 1}</span>` : ""}<input class="score ${bad ? "bad" : ""}" id="ps-${m.id}-${g}-0" inputmode="numeric" maxlength="2" autocomplete="off" data-input="pscore" ${cur} data-g="${g}" data-s="0" value="${x ?? ""}"><span>-</span><input class="score ${bad ? "bad" : ""}" id="ps-${m.id}-${g}-1" inputmode="numeric" maxlength="2" autocomplete="off" data-input="pscore" ${cur} data-g="${g}" data-s="1" value="${y ?? ""}"></div>`; }).join("")}
      <div class="row"><button class="qwin ${o.winner === "a" ? "on" : ""}" data-action="pqwin" ${cur} data-w="a">${o.winner === "a" ? "○ " : ""}左が勝ち</button><button class="qwin ${o.winner === "b" ? "on" : ""}" data-action="pqwin" ${cur} data-w="b">${o.winner === "b" ? "○ " : ""}右が勝ち</button><button class="btn btn-ghost btn-sm" data-action="popen" ${cur}>閉じる</button></div></div>` : "";
  return `<div class="pmatch ${o.winner ? "is-done" : ""}" id="pm-${m.id}"><span class="pm-num">${mi + 1}</span>${teamHTML(e, SC, r, ri, mi, "a", cum, o.winner === "a")}
    <button class="pm-mid" data-action="popen" ${cur} aria-label="点数を入れる" style="text-align:center;min-width:64px">${gtxt ? `<span class="num" style="font-size:.8rem;display:block">${esc(gtxt)}</span>` : `<span class="faint" style="font-size:.72rem">点数を入れる</span>`}${pStHTML(e, o)}</button>
    ${teamHTML(e, SC, r, ri, mi, "b", cum, o.winner === "b")}${notes ? `<div class="pm-extra" style="grid-column:2/-1;display:flex;flex-wrap:wrap;gap:4px">${notes}</div>` : ""}${inputs}</div>`;
}
function benchHTML(e, SC, r, ri, iss) {
  const placed = new Set(Core.pPlaced(r)), pm = playerMap(e), keptNow = new Set(Core.keptAt(e, ri));
  const rest = r.rest.filter((id) => pm[id] && !placed.has(id)), spare = iss.unplaced.filter((id) => !r.rest.includes(id));
  const chip = (id, cls) => `<span class="bchip ${cls} ${SC.cls(pm[id].school)}" data-drag="pbenchp" data-drag-id="${ri}:${id}" data-drag-label="${esc(pm[id].name)}"><button class="plink" style="border:none;background:none;font-weight:650;padding:0" data-action="pplayer" data-id="${id}">${esc(pm[id].name)}</button>
    ${cls === "spare" ? `<button data-action="pbench-rest" data-r="${ri}" data-id="${id}">今回だけ抜く</button>` : `<button data-action="pkeep" data-r="${ri}" data-id="${id}" title="次の回転も抜くか切り替え">${keptNow.has(id) ? "次も抜く ✓" : "次も抜く"}</button>`}<button data-action="pback" data-r="${ri}" data-id="${id}">戻す</button></span>`;
  return `<div class="bench" data-drop="pteam pmember" data-drop-id="${ri}"><b>試合に入っていない人</b><span class="faint">名前をここへドラッグすると「今回だけ抜く」(黄)。「次も抜く」で次の回転以降も外します(赤)。灰色は人数の余りです。</span>
    ${(() => { if (r.kind !== "doubles") return ""; const solo = (r.left || []).filter((id) => spare.includes(id) && pm[id]); if (!solo.length) return ""; const sch = (id) => (pm[id].school || "").trim(); const sameSchoolLeft = solo.some((a) => solo.some((b) => a !== b && sch(a) === sch(b)));
      return `<p class="note warn" style="white-space:normal">相方がいない人: ${solo.map((id) => esc(pm[id].name) + "(" + esc(pm[id].school) + ")").join("、")}。同じ学校どうしで組むため、学校の人数が奇数だと1人あまります。${sameSchoolLeft ? "" : "全員を試合に入れたいときは、選手の画面で、この人たちを選んで手でペアにしてください(学校がちがうペアになります)。"}</p><button class="btn btn-secondary btn-sm" style="align-self:flex-start" data-action="tab" data-tab="players">選手の画面でペアを作る</button>`; })()}
    <div class="bench-list">${rest.length || spare.length ? rest.map((id) => chip(id, keptNow.has(id) ? "rest keep" : "rest")).join("") + spare.map((id) => chip(id, "spare")).join("") : `<span class="muted">全員が試合に入っています</span>`}</div></div>`;
}
function pRoundHTML(e, SC, ri, cumAll) {
  const r = e.practice.rounds[ri], iss = Core.pIssues(e, ri), cum = cumAll[ri];
  const done = r.matches.filter((m) => Core.pOutcome(e, m).winner).length, dup = iss.dup.length, hasDup = r.matches.flatMap((_, i) => iss.per[i]).filter((n) => n.lv === "dup").length;
  const askMsg = ui.confirm === `preg:${r.id}` ? `<div class="confirm"><b>組み直します。</b>${r.matches.some((m) => m.win || !Core.isEmptyGames(m.g)) ? "入れた結果は消えます。" : ""}<button class="btn btn-primary btn-sm" data-action="preg-yes" data-r="${r.id}">組み直す</button><button class="btn btn-ghost btn-sm" data-action="cancel">やめる</button></div>` : ui.confirm === `pdel:${r.id}` ? `<div class="confirm"><b>第${ri + 1}回転を削除します。</b>結果も消えます。<button class="btn btn-del btn-sm" data-action="pdel-yes" data-r="${r.id}">削除する</button><button class="btn btn-ghost btn-sm" data-action="cancel">やめる</button></div>` : "";
  return `<section class="card" id="round-${r.id}"><div class="card-head"><div><h2>第${ri + 1}回転</h2><p class="faint">${kindLabel(r)} · ${r.matches.length}試合 · ${done}/${r.matches.length} 終了${hasDup ? ` · <span class="chip" style="background:var(--arc-2-soft);color:var(--arc-2)">かぶり ${hasDup}</span>` : ""}</p></div>
      <div class="row"><label class="faint">日 <select class="select" data-change="p-day" data-r="${r.id}">${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}" ${r.day === i + 1 ? "selected" : ""}>${i + 1}日目</option>`).join("")}</select></label><button class="btn btn-secondary btn-sm" data-action="preg" data-r="${r.id}">組み直す</button><button class="btn btn-ghost btn-sm btn-danger" data-action="pdel" data-r="${r.id}">削除</button></div></div>
    ${askMsg}${dup ? `<div class="confirm perr"><b>同じ人が同じ回転に2回入っています。</b>直してください。</div>` : ""}
    <div class="pgrid">${r.matches.map((_, mi) => pMatchHTML(e, SC, r, ri, mi, iss, cum)).join("")}</div>${benchHTML(e, SC, r, ri, iss)}</section>`;
}
function nextCardHTML(e, SC) {
  const rs = e.practice.rounds, n = rs.length + 1, ri = rs.length, kind = nextKindOf(e), day = ui.nextDay || (rs.length ? rs[rs.length - 1].day : 1);
  const kinds = [["singles", "シングルス", "1人ずつ"], ["fixed", "ダブルス・ペア固定", "登録したペアで組む"], ["rotate", "ダブルス・毎回組み替え", "登録ペア以外は回転ごとに組み替え"]];
  const rch = (id) => { const p = playerMap(e)[id], y = ui.nextRest.includes(id), k = isKept(e, id, ri); return `<span class="rchip ${y ? "on" : ""} ${k ? "on keep" : ""}"><button class="rchip-name" data-action="pjump-p" data-id="${id}">${esc(p.name)}</button><button class="rchip-tog" data-action="prest" data-id="${id}">${k ? "次も抜く" : y ? "今回抜く" : "抜く"}</button></span>`; };
  const fixedNo = kind === "fixed" && !e.pairs.length;
  return `<section class="card pnext" id="pnext"><div class="card-head" style="margin:0"><div><h2>第${n}回転を作る</h2><p class="faint">ランクの近い人どうしで組みます。前と同じ相手・同じ相方はなるべく避けます。</p></div></div>
    <div class="field"><span>形式</span><div class="choice-grid">${kinds.map(([k, t, d]) => `<label class="choice"><input type="radio" name="nk" value="${k}" data-change="pnext-kind" ${kind === k ? "checked" : ""}><b>${t}</b><span class="faint">${d}</span></label>`).join("")}</div></div>
    ${fixedNo ? `<div class="confirm"><b>ペアがありません。</b>選手の画面でペアを作るか、<button class="btn btn-secondary btn-sm" data-action="auto-pairs">同じ学校で自動作成</button></div>` : ""}
    <div class="row"><label class="faint">何日目 <select class="select" data-change="pnext-day">${Array.from({ length: Math.max(3, day + 1) }, (_, i) => `<option value="${i + 1}" ${day === i + 1 ? "selected" : ""}>${i + 1}日目</option>`).join("")}</select></label></div>
    <details class="more" ${ui.showRest || ui.nextRest.length || Core.keptAt(e, ri).length ? "open" : ""} data-toggle="showRest"><summary>次の回転で抜く人${ui.nextRest.length || Core.keptAt(e, ri).length ? `(${ui.nextRest.length + Core.keptAt(e, ri).length}人)` : ""}</summary><div class="rchips">${e.players.slice().sort((a, b) => b.level - a.level).map((p) => rch(p.id)).join("")}</div><p class="faint">「抜く」=今回だけ(黄)。もう一度押すと「次も抜く」(赤)、もう一度で戻ります。</p></details>
    <details class="more" data-toggle="showSet"><summary>組み方の設定(ランク差・学校)</summary><div class="settings"><label class="field"><span>組むときのランク差</span><select class="select" data-change="p-tol">${[0, 1, 2, 3].map((k) => `<option value="${k}" ${e.practice.tol === k ? "selected" : ""}>${k === 0 ? "同じランクだけ" : `前後${k}まで`}</option>`).join("")}</select></label>
      <label class="check"><input type="checkbox" data-change="p-avoid" ${e.practice.avoidSchool ? "checked" : ""}>なるべく別の学校の人と当てる</label></div><p class="faint">ダブルスのペアは、自動のときは同じ学校どうしにします。学校のちがう組は、選手の画面で手で作ります。</p></details>
    <div class="row"><button class="btn btn-aurora" data-action="pround">第${n}回転を作る</button></div></section>`;
}
App.qMatch = (p) => { const q = norm(ui.q); return !q || norm(p.name).includes(q) || norm(p.school || "").includes(q); };
const norm = (s) => String(s || "").toLowerCase().replace(/[\s　]+/g, "").replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
function searchHTML(e, SC) {
  const q = ui.q, hits = q ? e.players.filter(App.qMatch) : [];
  return `<div class="qbox"><input class="input" id="q" type="search" data-input="q" value="${esc(q)}" placeholder="名前・学校で探す" autocomplete="off" aria-label="名前・学校で探す">${q ? `<button class="btn btn-ghost btn-sm" data-action="qclear">消す</button>` : ""}</div>
    ${q && hits.length && hits.length <= 6 ? hits.map((p) => `<div class="note" style="margin-top:6px">${esc(p.name)}:${e.practice.rounds.map((r, ri) => { const m = r.matches.find((x) => x.a.includes(p.id) || x.b.includes(p.id)); if (!m) return `第${ri + 1}回転 ${r.rest.includes(p.id) ? "休み" : "待機"}`; const opp = (m.a.includes(p.id) ? m.b : m.a).filter(Boolean).map((x) => pn(e, x)).join("・"); return `<button class="link-btn" data-action="pjump" data-m="${m.id}">第${ri + 1}回転 vs ${esc(opp)}</button>`; }).join(" / ")}</div>`).join("") : q && !hits.length ? `<p class="faint">見つかりません</p>` : ""}`;
}
function practiceHTML(e) {
  const SC = App.schoolColors(e), rs = e.practice.rounds, cumAll = Core.pCum(e);
  if (e.players.length < 2) return `<section class="card empty"><h2>選手が足りません</h2><p class="muted">「選手」のタブで、2人以上入れてください。</p><button class="btn btn-primary" data-action="tab" data-tab="players">選手の画面へ</button></section>`;
  return `${rs.length ? `<section class="card stack">${searchHTML(e, SC)}${SC.list.length > 1 ? `<div class="school-legend">${SC.list.map((s) => `<span class="chip ${SC.cls(s)}">${esc(s)} ${e.players.filter((p) => (p.school || "").trim() === s).length}人</span>`).join("")}</div>` : ""}</section>` : ""}
    ${rs.map((_, ri) => pRoundHTML(e, SC, ri, cumAll)).join("")}${nextCardHTML(e, SC)}${ui.ask ? askHTML(e) : ""}${ui.pPlayer ? playerPageHTML(e, ui.pPlayer) : ""}`;
}
/* 片方が休むときのポップアップ */
function askHTML(e) {
  const a = ui.ask;
  if (a.type === "create") return `<div class="modal-bg"><div class="modal stack"><h3>固定ペアの片方が休みです</h3>${a.list.map((x) => `<div class="note warn">${esc(pn(e, x.id))} が休み → 相方の ${esc(pn(e, x.mate))}</div>`).join("")}<p class="muted" style="margin:0">相方はどうしますか？(今回の回転すべての組に同じ扱いです)</p>
    <div class="row"><button class="btn btn-primary" data-action="ask-create" data-k="wait">相方も待機にする</button><button class="btn btn-secondary" data-action="ask-create" data-k="swap">別の人と組む</button><button class="btn btn-ghost" data-action="ask-cancel">やめる</button></div></div></div>`;
  const r = e.practice.rounds[a.ri], placed = Core.pPlaced(r), pool = Core.partnerCandidates(e, a.mate, e.players.map((p) => p.id).filter((id) => !placed.includes(id) && id !== a.id)).slice(0, 8);
  return `<div class="modal-bg"><div class="modal stack"><h3>${esc(pn(e, a.id))} を抜きます</h3><p class="muted" style="margin:0">ペアの相方 ${esc(pn(e, a.mate))} はどうしますか？</p>
    <div class="row"><button class="btn btn-primary" data-action="ask-go" data-k="both">相方も待機にする</button></div>
    ${pool.length ? `<div class="field"><span>その回転だけ、別の人と組む(近い順)</span><div class="rchips">${pool.map((p) => `<button class="rchip-name" style="border:1px solid var(--border-soft);border-radius:999px" data-action="ask-go" data-k="swap" data-with="${p.id}">${esc(p.name)} <span class="faint">${esc(p.school)}・${p.level}</span></button>`).join("")}</div></div>` : `<p class="faint">待機中の人がいないので、別の人とは組めません。</p>`}
    <div class="row"><button class="btn btn-ghost" data-action="ask-cancel">やめる</button></div></div></div>`;
}

/* ---------- 選手ごとのページ ---------- */
function pStatsOf(e, id) { return Core.pStats(e).rows.find((x) => x.p.id === id); }
function playerPageHTML(e, id) {
  const p = playerMap(e)[id]; if (!p) return "";
  const st = pStatsOf(e, id), SC = App.schoolColors(e);
  const rows = e.practice.rounds.map((r, ri) => { const m = r.matches.find((x) => x.a.includes(id) || x.b.includes(id)); if (!m) return `<tr><td>第${ri + 1}回転</td><td colspan="3" class="faint">${r.rest.includes(id) ? "休み" : "待機"}</td></tr>`; const s = m.a.includes(id) ? "a" : "b", o = Core.pOutcome(e, m), mate = m[s].filter((x) => x && x !== id), opp = m[s === "a" ? "b" : "a"].filter(Boolean);
    return `<tr><td>第${ri + 1}回転</td><td>${mate.length ? `ペア ${esc(mate.map((x) => pn(e, x)).join(""))}<br>` : ""}vs ${esc(opp.map((x) => pn(e, x)).join("・"))}</td><td class="num">${m.g.filter((x) => x[0] != null || x[1] != null).map(([x, y]) => (s === "a" ? `${x ?? ""}-${y ?? ""}` : `${y ?? ""}-${x ?? ""}`)).join(" / ")}</td><td>${o.winner ? (o.winner === s ? `<span class="chip chip-ok">勝ち</span>` : `<span class="chip">負け</span>`) : ""} <button class="link-btn" data-action="pjump" data-m="${m.id}">試合へ</button></td></tr>`; }).join("");
  return `<div class="modal-bg" data-action="pplayer-close-bg"><div class="modal stack"><div class="card-head" style="margin:0"><div><h2>${esc(p.name)}</h2><p class="faint">${esc(p.school)} · ランク ${p.level}</p></div><button class="btn btn-ghost btn-sm" data-action="pplayer-close">閉じる</button></div>
    <div class="row"><span class="chip">${st.games}試合</span><span class="chip chip-ok">${st.w}勝</span><span class="chip">${st.l}敗</span><span class="chip chip-live">勝率 ${st.rate == null ? "—" : st.rate + "%"}</span></div>
    ${Core.pStats(e).days.length > 1 ? `<div class="faint">${Core.pStats(e).days.map((d) => `${d}日目 ${st.day[d].rate == null ? "—" : st.day[d].rate + "%"}${st.day[d].delta != null ? ` (${st.day[d].delta > 0 ? "+" : ""}${st.day[d].delta})` : ""}`).join(" / ")}</div>` : ""}
    <div class="table-wrap"><table><tbody>${rows || `<tr><td class="faint">まだ回転がありません</td></tr>`}</tbody></table></div></div></div>`;
}

/* ---------- 成績 ---------- */
const sideTxt = (e, ids) => ids.filter(Boolean).map((x) => pn(e, x)).join("・");
const sideSch = (e, ids) => [...new Set(ids.filter(Boolean).map((x) => (playerMap(e)[x].school || "").trim()).filter(Boolean))].join("・");
const playerNo = (e) => { const m = {}; e.players.forEach((p, i) => (m[p.id] = i + 1)); return m; };
/* 対戦結果表(紙の形): 試合番号・回転・選手番号・ランク・選手名/学校・得点・相手側の同じ列。勝った側の名前の欄と得点は赤く「勝ち」 */
function sheetRows(e) {
  const out = [], hist = {};
  e.practice.rounds.forEach((r, ri) => { if (ui.pSheetRound !== "all" && ui.pSheetRound !== r.id) return; const H = hist[ri] || (hist[ri] = Core.pHistory(e, ri)); r.matches.forEach((m, mi) => { const o = Core.pOutcome(e, m); const dup = m.a.some((x) => x && m.b.some((y) => y && H.faced[keyOf(x, y)])); out.push({ r, ri, m, mi, o, dup }); }); });
  return out;
}
const idStack = (arr) => arr.filter((x) => x !== "" && x != null).join("<br>");
function nameCellHTML(e, ids, win, SC) {
  const pm = playerMap(e), list = ids.filter(Boolean);
  return `<td class="sh-name ${win ? "sh-winname" : ""}">${win ? `<span class="sh-winmark">勝ち</span>` : ""}${list.map((id) => `<b><button class="plink ${SC.cls(pm[id].school)}" data-action="pplayer" data-id="${id}">${esc(pm[id].name || "(名前なし)")}</button></b>`).join("")}<span class="pschool">${esc(sideSch(e, list))}</span></td>`;
}
function sheetHTML(e) {
  const rows = sheetRows(e), SC = App.schoolColors(e), pm = playerMap(e), no = playerNo(e);
  let last = -1;
  const body = rows.filter((x) => !ui.q || x.m.a.concat(x.m.b).some((id) => id && App.qMatch(pm[id]))).map(({ r, ri, m, mi, o, dup }) => {
    const head = ri !== last ? (last = ri, `<tr class="sh-round"><td colspan="9">第${ri + 1}回転 · ${r.day}日目 · ${kindLabel(r)}</td></tr>`) : "";
    const gs = m.g.slice(0, e.games).filter((x) => x[0] != null || x[1] != null);
    const sc = gs.length ? gs.map(([x, y]) => `<div class="sh-g"><span class="${x > y ? "w" : ""}">${x ?? ""}</span><i>−</i><span class="${y > x ? "w" : ""}">${y ?? ""}</span></div>`).join("") : o.winner ? `<div class="sh-g"><span class="${o.winner === "a" ? "w" : ""}">${o.winner === "a" ? "勝" : "負"}</span><i>−</i><span class="${o.winner === "b" ? "w" : ""}">${o.winner === "b" ? "勝" : "負"}</span></div>` : "";
    const lv = (ids) => idStack(ids.filter(Boolean).map((id) => pm[id].level));
    return `${head}<tr><td class="num">${mi + 1}${dup ? `<small class="sh-dup">かぶり</small>` : ""}</td><td class="num">${ri + 1}</td><td class="sh-id num">${idStack(m.a.map((id) => id && no[id]))}</td><td class="num">${lv(m.a)}</td>${nameCellHTML(e, m.a, o.winner === "a", SC)}<td class="sh-sc num">${sc}</td>${nameCellHTML(e, m.b, o.winner === "b", SC)}<td class="num">${lv(m.b)}</td><td class="sh-id num">${idStack(m.b.map((id) => id && no[id]))}</td></tr>`;
  }).join("");
  return `<div class="row"><label class="faint">回転 <select class="select" data-change="p-sheet-round"><option value="all">すべて</option>${e.practice.rounds.map((r, i) => `<option value="${r.id}" ${ui.pSheetRound === r.id ? "selected" : ""}>第${i + 1}回転(${r.day}日目・${kindLabel(r)})</option>`).join("")}</select></label></div>
    <p class="faint" style="margin:0">紙の対戦表と同じ並びです。選手番号は「選手」の画面の登録順。勝った側の名前の欄と得点が赤くなります。</p>
    <div class="table-wrap"><table class="sheet"><thead><tr><th>試合<br>番号</th><th>回転</th><th class="sh-id">選手<br>番号</th><th>ランク</th><th>選手名<br>学校名</th><th>得点</th><th>選手名<br>学校名</th><th>ランク</th><th class="sh-id">選手<br>番号</th></tr></thead><tbody>${body || `<tr><td colspan="9" class="faint">まだ試合がありません</td></tr>`}</tbody></table></div>`;
}
/* 組み合わせごとの成績: 同じ相手(ダブルスは同じペアどうし)の試合を、回転をまたいで1行にまとめる。各回の得点をゲームとして縦に並べ、ゲーム数は勝った数の合計 */
function mergedRows(e) {
  const map = new Map(), no = playerNo(e);
  const need = e.games === 1 ? 1 : 2;
  e.practice.rounds.forEach((r, ri) => r.matches.forEach((m) => {
    const A_ = m.a.filter(Boolean), B_ = m.b.filter(Boolean); if (!A_.length || !B_.length) return;
    const ka = A_.slice().sort().join("+"), kb = B_.slice().sort().join("+"), flip = ka > kb, key = flip ? `${kb}|${ka}` : `${ka}|${kb}`;
    const row = map.get(key) || { a: flip ? B_ : A_, b: flip ? A_ : B_, lines: [], gA: 0, gB: 0, rounds: [], times: 0, shown: false };
    const o = Core.pOutcome(e, m);
    const quick = o.winner && !m.g.some((x) => x[0] != null || x[1] != null);
    const lines = quick ? [o.winner === "a" ? ["勝", "負"] : ["負", "勝"]] : m.g.slice(0, e.games).filter((x) => x[0] != null || x[1] != null);
    lines.forEach(([x, y]) => row.lines.push(flip ? [y, x] : [x, y]));
    if (o.started || o.winner) { row.shown = true; const ga = quick ? (o.winner === "a" ? need : 0) : o.ga, gb = quick ? (o.winner === "b" ? need : 0) : o.gb; row.gA += flip ? gb : ga; row.gB += flip ? ga : gb; }
    row.rounds.push(ri + 1); row.times++; map.set(key, row);
  }));
  return [...map.values()];
}
function mergeHTML(e) {
  const rows = mergedRows(e), SC = App.schoolColors(e), pm = playerMap(e), no = playerNo(e);
  const body = rows.filter((x) => !ui.q || x.a.concat(x.b).some((id) => App.qMatch(pm[id]))).map((x, i) => {
    const wa = x.shown && x.gA > x.gB, wb = x.shown && x.gB > x.gA;
    const sc = x.lines.map(([a, b]) => { const num = typeof a === "number" && typeof b === "number"; const la = num ? a > b : a === "勝", lb = num ? b > a : b === "勝"; return `<div class="sh-g"><span class="${la ? "w" : ""}">${a ?? ""}</span><i>−</i><span class="${lb ? "w" : ""}">${b ?? ""}</span></div>`; }).join("");
    return `<tr><td class="num">${i + 1}${x.times > 1 ? `<small class="sh-dup">${x.times}回対戦</small>` : ""}</td><td class="num">${x.rounds.join("・")}</td><td class="sh-id num">${idStack(x.a.map((id) => no[id]))}</td><td class="num">${idStack(x.a.map((id) => pm[id].level))}</td>${nameCellHTML(e, x.a, false, SC)}<td class="sh-gc num ${wa ? "sh-win" : ""}">${x.shown ? x.gA : ""}</td><td class="sh-sc num">${sc}</td><td class="sh-gc num ${wb ? "sh-win" : ""}">${x.shown ? x.gB : ""}</td>${nameCellHTML(e, x.b, false, SC)}<td class="num">${idStack(x.b.map((id) => pm[id].level))}</td><td class="sh-id num">${idStack(x.b.map((id) => no[id]))}</td></tr>`;
  }).join("");
  return `<p class="faint" style="margin:0">同じ相手(ダブルスは同じペアどうし)と当たった試合を1行にまとめます。各回の得点をゲームとして並べ、ゲーム数は勝った数です。回転の欄は当たった回転です。</p>
    <div class="table-wrap"><table class="sheet"><thead><tr><th>番号</th><th>回転</th><th class="sh-id">選手<br>番号</th><th>ランク</th><th>選手名<br>学校名</th><th>ゲーム<br>数</th><th>得点</th><th>ゲーム<br>数</th><th>選手名<br>学校名</th><th>ランク</th><th class="sh-id">選手<br>番号</th></tr></thead><tbody>${body || `<tr><td colspan="11" class="faint">まだ試合がありません</td></tr>`}</tbody></table></div>`;
}
function listHTML(e) {
  const st = Core.pStats(e), SC = App.schoolColors(e), rs = e.practice.rounds, maxG = Math.max(0, ...st.rows.map((r) => r.games));
  let rows = st.rows.filter((r) => App.qMatch(r.p));
  rows.sort(ui.pSort === "rate" ? (a, b) => (b.rate ?? -1) - (a.rate ?? -1) || b.games - a.games : ui.pSort === "few" ? (a, b) => a.games - b.games || b.p.level - a.p.level : (a, b) => b.p.level - a.p.level || a.p.name.localeCompare(b.p.name, "ja"));
  const few = st.rows.filter((r) => maxG - r.games >= 2).length;
  const pairs = Core.pairStats(e).sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1) || b.games - a.games);
  return `<div class="row"><div class="seg">${[["level", "ランク順"], ["rate", "勝率順"], ["few", "試合数の少ない順"]].map(([k, l]) => `<button class="${ui.pSort === k ? "on" : ""}" data-action="psort" data-k="${k}">${l}</button>`).join("")}</div></div>
    ${few ? `<div class="confirm"><b>試合数が少ない人が ${few}人います</b>(最多より2試合以上少ない)。</div>` : ""}
    <div class="table-wrap"><table><thead><tr><th>選手</th><th>ランク</th><th>試合</th><th>勝</th><th>敗</th><th>勝率</th>${st.days.map((d) => `<th>${d}日目</th>`).join("")}${rs.map((_, i) => `<th>${i + 1}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr><td class="c-name ${SC.cls(r.p.school)}"><button class="plink" data-action="pplayer" data-id="${r.p.id}">${esc(r.p.name)}</button><span class="pschool">${esc(r.p.school)}</span></td><td class="num">${r.p.level}</td><td class="num">${r.games}</td><td class="num">${r.w}</td><td class="num">${r.l}</td><td class="num">${r.rate == null ? "—" : r.rate + "%"}</td>${st.days.map((d) => `<td class="num">${r.day[d].rate == null ? "—" : r.day[d].rate + "%"}${r.day[d].delta != null ? `<span class="pdelta ${r.day[d].delta > 0 ? "up" : r.day[d].delta < 0 ? "down" : ""}">${r.day[d].delta > 0 ? "+" : ""}${r.day[d].delta}</span>` : ""}</td>`).join("")}${r.byR.map((b) => `<td style="text-align:center">${b === "play" ? "●" : b === "rest" ? "休" : "未"}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    ${pairs.length ? `<h3 style="margin-top:8px">ペアごとの成績</h3><div class="table-wrap"><table><thead><tr><th>ペア</th><th>試合</th><th>勝</th><th>敗</th><th>勝率</th></tr></thead><tbody>${pairs.map((p) => `<tr><td>${esc(sideTxt(e, p.ids))}<span class="pschool">${esc(sideSch(e, p.ids))}</span></td><td class="num">${p.games}</td><td class="num">${p.w}</td><td class="num">${p.l}</td><td class="num">${p.rate == null ? "—" : p.rate + "%"}</td></tr>`).join("")}</tbody></table></div>` : ""}`;
}
function pstatsHTML(e) {
  if (!e.practice.rounds.length) return `<section class="card empty"><h2>まだ回転がありません</h2><p class="muted">「対戦」のタブで回転を作ると、ここに成績が出ます。</p><button class="btn btn-primary" data-action="tab" data-tab="rounds">対戦へ</button></section>`;
  const views = [["list", "試合数と勝率(個人・ペア)"], ["sheet", "対戦結果表"], ["merge", "組み合わせごとの成績"]];
  return `<section class="card stack"><div class="card-head" style="margin:0"><div><h2>成績</h2></div><button class="btn btn-secondary btn-sm" data-action="print-practice">PDFで保存</button></div>
    <div class="view-switch seg" style="align-self:flex-start">${views.map(([k, l]) => `<button class="${ui.pView === k ? "on" : ""}" data-action="pview" data-view="${k}">${l}</button>`).join("")}</div>
    <div class="qbox"><input class="input" id="q" type="search" data-input="q" value="${esc(ui.q)}" placeholder="名前・学校で探す" autocomplete="off">${ui.q ? `<button class="btn btn-ghost btn-sm" data-action="qclear">消す</button>` : ""}</div>
    <div id="pstats-body">${ui.pView === "sheet" ? sheetHTML(e) : ui.pView === "merge" ? mergeHTML(e) : listHTML(e)}</div></section>${ui.pPlayer ? playerPageHTML(e, ui.pPlayer) : ""}`;
}
App.views.rounds = practiceHTML; App.views.pstats = pstatsHTML;

/* ---------- 操作 ---------- */
const withR = (b) => { const e = ev(), r = e.practice.rounds[Number(b.dataset.r)] || rById(e, b.dataset.r); return [e, r]; };
Object.assign(A, {
  pround: () => {
    const e = ev(), kind = nextKindOf(e), ri = e.practice.rounds.length;
    if (kind === "fixed") { const rest = [...new Set([...ui.nextRest, ...Core.keptAt(e, ri)])], list = brokenFixed(e, rest); if (list.length) { ui.ask = { type: "create", list }; render(); return; } }
    createRound(e, false);
  },
  "ask-create": (b) => { const e = ev(); ui.ask = null; createRound(e, b.dataset.k === "swap"); },
  "ask-cancel": () => { ui.ask = null; render(); },
  "ask-go": (b) => { const e = ev(), a = ui.ask, r = e.practice.rounds[a.ri], m = r.matches[a.mi]; ui.ask = null;
    if (b.dataset.k === "both") { [a.id, a.mate].forEach((x) => takeOut(e, r, x)); toast("ペアごと「今回だけ抜く」にしました"); }
    else { const w = b.dataset.with; r.rest = r.rest.filter((x) => x !== w); takeOut(e, r, a.id); const sd = m.a.includes(a.mate) ? "a" : "b"; const i = m[sd].indexOf(null); if (i >= 0) m[sd][i] = w; emptyLast(r); toast(`${pn(e, a.mate)} の相方を ${pn(e, w)} にしました(この回転だけ)`); }
    commit(); render(); },
  prest: (b) => { const e = ev(), id = b.dataset.id, ri = e.practice.rounds.length;
    if (isKept(e, id, ri)) { e.practice.dayOff = e.practice.dayOff.filter((x) => x.id !== id); ui.nextRest = ui.nextRest.filter((x) => x !== id); }
    else if (ui.nextRest.includes(id)) { e.practice.dayOff = e.practice.dayOff.filter((x) => x.id !== id).concat({ id, from: ri }); }
    else ui.nextRest.push(id);
    ui.showRest = true; commit(); render(); },
  "pjump-p": (b) => { const e = ev(), id = b.dataset.id; ui.pPlayer = id; render(); },
  popen: (b) => { ui.pOpen = ui.pOpen === b.dataset.m ? null : b.dataset.m; render(); },
  pout: (b) => { const e = ev(), r = e.practice.rounds[Number(b.dataset.r)], m = r.matches[Number(b.dataset.m)], side = b.dataset.s, id = m[side][Number(b.dataset.p)]; if (!id) return; App.drops.pmember(`${b.dataset.r}:${b.dataset.m}:${side}:${b.dataset.p}`, b.dataset.r); },
  "pout-team": (b) => { App.drops.pteam(`${b.dataset.r}:${b.dataset.m}:${b.dataset.s}`, b.dataset.r); },
  "pbench-rest": (b) => { const e = ev(), r = e.practice.rounds[Number(b.dataset.r)]; if (!r.rest.includes(b.dataset.id)) r.rest.push(b.dataset.id); commit(); render(); },
  pkeep: (b) => { const e = ev(), ri = Number(b.dataset.r), id = b.dataset.id; if (isKept(e, id, ri)) { e.practice.dayOff = e.practice.dayOff.filter((x) => x.id !== id); e.practice.rounds.forEach((x, k) => { if (k > ri) x.rest = x.rest.filter((y) => y !== id); }); } else { const r = e.practice.rounds[ri]; e.practice.dayOff = e.practice.dayOff.filter((x) => x.id !== id).concat({ id, from: ri }); if (!r.rest.includes(id)) r.rest.push(id); e.practice.rounds.forEach((x, k) => { if (k > ri && !Core.pPlaced(x).includes(id) && !x.rest.includes(id)) x.rest.push(id); }); } commit(); render(); },
  pback: (b) => { const e = ev(); bringBack(e, e.practice.rounds[Number(b.dataset.r)], b.dataset.id); },
  preg: (b) => { ui.confirm = `preg:${b.dataset.r}`; render(); },
  "preg-yes": (b) => { const e = ev(), r = rById(e, b.dataset.r); ui.confirm = null; regen(e, r, [], "組み直しました"); },
  pdel: (b) => { ui.confirm = `pdel:${b.dataset.r}`; render(); },
  "pdel-yes": (b) => { const e = ev(); e.practice.rounds = e.practice.rounds.filter((r) => r.id !== b.dataset.r); ui.confirm = null; commit(); render(); toast("削除しました"); },
  pqwin: (b) => { const e = ev(), [, m] = matchById(e, b.dataset.m); if (!m) return; const w = b.dataset.w; m.win = m.win === w ? null : w; if (m.win) m.g = []; commit(); render(); },
  pplayer: (b) => { ui.pPlayer = b.dataset.id; render(); },
  "pplayer-close": () => { ui.pPlayer = null; render(); },
  "pplayer-close-bg": (b, evt) => { if (evt.target === b) { ui.pPlayer = null; render(); } },
  pjump: (b) => { ui.pPlayer = null; ui.tab = "rounds"; ui.pOpen = b.dataset.m; render(); const n = document.getElementById(`pm-${b.dataset.m}`); if (n) { n.scrollIntoView({ block: "center", behavior: "smooth" }); n.style.boxShadow = "0 0 0 4px var(--accent)"; setTimeout(() => (n.style.boxShadow = ""), 1400); } },
  pview: (b) => { ui.pView = b.dataset.view; render(); },
  psort: (b) => { ui.pSort = b.dataset.k; render(); },
  qclear: () => { ui.q = ""; render(); const n = $("#q"); if (n) n.focus({ preventScroll: true }); },
  "print-practice": () => App.doPrint(),
});
Object.assign(Ch, {
  "pnext-kind": (t) => { ui.nextKind = t.value; render(); },
  "pnext-day": (t) => { ui.nextDay = Number(t.value); },
  "p-day": (t) => { const e = ev(), r = rById(e, t.dataset.r); if (r) { r.day = clamp(Number(t.value), 1, 30); commit(); render(); } },
  "p-tol": (t) => { ev().practice.tol = clamp(Number(t.value), 0, Core.RANK_MAX - 1); commit(); render(); },
  "p-avoid": (t) => { ev().practice.avoidSchool = t.checked; commit(); render(); },
  "p-sheet-round": (t) => { ui.pSheetRound = t.value; render(); },
});
const prevIn = App.input;
App.input = (t) => {
  if (prevIn(t)) return true;
  const e = ev();
  if (t.dataset.input === "q") { if (t.isComposing) return true; applySearch(t); return true; }
  if (t.dataset.input === "pscore") { const [, m] = matchById(e, t.dataset.m); if (!m) return true; const g = Number(t.dataset.g), s = Number(t.dataset.s);
    App.scoreCommit(e, t, (n) => { while (m.g.length <= g) m.g.push([null, null]); m.g[g][s] = n; m.win = null; if (m.g.every((x) => x[0] == null && x[1] == null)) m.g = []; }, () => m.g, `ps-${m.id}`); return true; }
  return false;
};
function applySearch(t) { const pos = t.selectionStart; ui.q = t.value; render(); const n = $("#q"); if (n) { n.focus({ preventScroll: true }); try { n.setSelectionRange(pos, pos); } catch (x) {} } }
App.applySearch = applySearch;

/* ---------- Excel に出す表(練習試合) ---------- */
App.blocks.push((e) => {
  if (e.mode !== "practice" || !e.practice.rounds.length) return null;
  const rows = [["回転", "日", "形式", "試合", "左", "左の学校", "右", "右の学校", ...App.gameHeads(e), "勝ち"]];
  e.practice.rounds.forEach((r, ri) => r.matches.forEach((m, mi) => { const o = Core.pOutcome(e, m); rows.push([ri + 1, r.day, kindLabel(r), mi + 1, sideTxt(e, m.a), sideSch(e, m.a), sideTxt(e, m.b), sideSch(e, m.b), ...App.xlGames(e, m.g), o.winner ? (o.winner === "a" ? "左" : "右") : ""]); }));
  const st = Core.pStats(e), srows = [["選手", "学校", "ランク", "試合", "勝", "敗", "勝率(%)", ...st.days.map((d) => `${d}日目勝率(%)`)]];
  st.rows.forEach((r) => srows.push([r.p.name, r.p.school, r.p.level, r.games, r.w, r.l, r.rate == null ? "" : r.rate, ...st.days.map((d) => (r.day[d].rate == null ? "" : r.day[d].rate))]));
  const blocks = [{ title: "回転ごとの対戦と結果", rows }, { title: "成績(個人)", rows: srows }];
  const ps = Core.pairStats(e); if (ps.length) blocks.push({ title: "成績(ペア)", rows: [["ペア", "学校", "試合", "勝", "敗", "勝率(%)"], ...ps.map((p) => [sideTxt(e, p.ids), sideSch(e, p.ids), p.games, p.w, p.l, p.rate == null ? "" : p.rate])] });
  return blocks;
});

/* ============ ドラッグ&ドロップ(マウスでも指でも) ============ */
let drag = null, suppressUntil = 0;
const app = () => $("#app");
const dropAt = (x, y, kind) => { const el = document.elementFromPoint(x, y); if (!el) return null; for (let n = el; n; n = n.parentElement) if (n.dataset && n.dataset.drop && n.dataset.drop.split(" ").includes(kind)) return n; return null; };
document.addEventListener("pointerdown", (evt) => {
  const el = evt.target.closest && evt.target.closest("[data-drag]");
  if (!el || evt.button > 0 || evt.target.closest("select,button,input,textarea,a")) return;
  drag = { el, kind: el.dataset.drag, id: el.dataset.dragId, label: el.dataset.dragLabel || "", x: evt.clientX, y: evt.clientY, on: false, ghost: null, over: null };
});
addEventListener("pointermove", (evt) => {
  if (!drag) return;
  if (!drag.on) {
    if (Math.hypot(evt.clientX - drag.x, evt.clientY - drag.y) < 6) return;
    drag.on = true; drag.ghost = document.createElement("div"); drag.ghost.className = "drag-ghost"; drag.ghost.textContent = drag.label; document.body.appendChild(drag.ghost); drag.el.classList.add("drag-src"); document.body.classList.add("is-dragging");
  }
  evt.preventDefault(); drag.cx = evt.clientX; drag.cy = evt.clientY; drag.ghost.style.transform = `translate(${evt.clientX + 12}px,${evt.clientY + 12}px)`;
  updateOver(); if (!drag.raf) drag.raf = requestAnimationFrame(autoScroll);
}, { passive: false });
function updateOver() { const t = dropAt(drag.cx, drag.cy, drag.kind); if (t !== drag.over) { if (drag.over) drag.over.classList.remove("drop-over"); drag.over = t; if (t) t.classList.add("drop-over"); } }
function autoScroll() { if (!drag || !drag.on) return; const edge = 80, y = drag.cy, v = y < edge ? -Math.ceil((edge - y) / 4) : y > innerHeight - edge ? Math.ceil((y - (innerHeight - edge)) / 4) : 0; if (v) { scrollBy(0, v); updateOver(); } drag.raf = requestAnimationFrame(autoScroll); }
function endDrag(cancel) {
  if (!drag) return; const d = drag; drag = null;
  if (d.raf) cancelAnimationFrame(d.raf); if (d.ghost) d.ghost.remove(); d.el.classList.remove("drag-src"); if (d.over) d.over.classList.remove("drop-over"); document.body.classList.remove("is-dragging");
  if (d.on) suppressUntil = Date.now() + 350;
  if (!d.on || cancel || !d.over) return;
  const f = App.drops[d.kind]; if (f) f(d.id, d.over.dataset.dropId);
}
addEventListener("pointerup", () => endDrag(false)); addEventListener("pointercancel", () => endDrag(true));
addEventListener("click", (c) => { if (Date.now() < suppressUntil) { c.stopPropagation(); c.preventDefault(); } }, true);
addEventListener("keydown", (evt) => { if (evt.key === "Escape") { endDrag(true); if (ui.ask) { ui.ask = null; render(); } else if (ui.pPlayer) { ui.pPlayer = null; render(); } else if (ui.pOpen) { ui.pOpen = null; render(); } } });

/* ============ 印刷(トーナメントの組み合わせ表 / 練習試合の成績) ============ */
function fillPrint() {
  const area = $("#print-area"), e = ev(); let html = "";
  if (e && ui.view !== "home") {
    if (e.mode === "tournament" && ui.tab === "bracket") { const st = Core.bracketState(e); if (st) html = App.printSheetSVG(e, st); }
    else if (e.mode === "practice" && ui.tab === "pstats" && e.practice.rounds.length) { const box = document.createElement("div"); box.innerHTML = `<div id="x">${ui.pView === "sheet" ? sheetHTML(e) : ui.pView === "merge" ? mergeHTML(e) : listHTML(e)}</div>`; box.querySelectorAll("button:not(.plink), select, .seg, .row").forEach((n) => n.remove()); html = `<div class="pp"><div class="pp-head"><b>${esc(e.name)}</b><span>${esc(e.date || "")}</span></div>${box.innerHTML}</div>`; }
  }
  area.innerHTML = html; document.body.classList.toggle("has-print", !!html);
}
App.doPrint = () => { if (window.claude && typeof window.claude.use === "function") { toast("claude.ai の中では印刷・PDF保存ができません。公開ページで開いて保存してください"); return; } fillPrint(); try { window.print(); } catch (x) { toast("印刷の画面を開けませんでした"); } };
addEventListener("beforeprint", fillPrint); addEventListener("afterprint", () => document.body.classList.remove("has-print"));

/* ============ イベントのつなぎ ============ */
document.addEventListener("click", (evt) => {
  const b = evt.target.closest && evt.target.closest("[data-action]"); if (!b) return;
  const f = A[b.dataset.action]; if (f) f(b, evt);
});
document.addEventListener("change", (evt) => { const t = evt.target; if (!t.dataset) return; if (t.dataset.change && Ch[t.dataset.change]) Ch[t.dataset.change](t); });
document.addEventListener("input", (evt) => { const t = evt.target; if (t.dataset && t.dataset.input && !(evt.isComposing && t.dataset.input !== "q")) App.input(t); });
document.addEventListener("compositionend", (evt) => { const t = evt.target; if (t.dataset && t.dataset.input === "q") applySearch(t); });
document.addEventListener("submit", (evt) => { const f = evt.target.dataset && F[evt.target.dataset.form]; if (f) { evt.preventDefault(); f(evt.target); } });
document.addEventListener("toggle", (evt) => { const t = evt.target; if (t.dataset && t.dataset.toggle) ui[t.dataset.toggle] = t.open; }, true);
document.addEventListener("keydown", (evt) => { if (evt.key === "Enter" && evt.target.id === "ev-name") { evt.preventDefault(); evt.target.blur(); } });
document.addEventListener("focusout", (evt) => { /* 名前欄は textarea。変更は change で拾う */ });
App.printSheetSVG = App.printSheetSVG;
})();
