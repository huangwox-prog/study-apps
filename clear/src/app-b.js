/* ============================================================
   CLEAR 画面 (app) — B: リーグ戦・トーナメント・順位一覧・印刷・見本
   ============================================================ */
(() => {
"use strict";
const { clamp, uid, playerMap, entryMap, entries, isDbl, letter, keyOf } = Core;
const App = window.App, { A, Ch, F, ui, esc, $ } = App;
const ev = App.ev, commit = App.commit, render = App.render, toast = App.toast;
const lgClass = (i) => `lg-${i % 8}`;
const nameStack = (m) => (m ? (m.names ? `${esc(m.names[0])}<br>${esc(m.names[1])}` : esc(m.name || "(名前なし)")) : "");
const nameFlat = (m) => (m ? m.name || "(名前なし)" : "");

/* ---------- リーグ分け ---------- */
function leaguesHTML(e) {
  const n = entries(e).length, sizes = Core.groupSizesFor(e, n), K = sizes.length;
  const em = entryMap(e), un = Core.unassigned(e);
  const dayInfo = (l) => { const d = Core.dayCount(e, l.ids.length); return d > 1 ? `<span class="chip chip-warn">${d}日に分ける</span>` : ""; };
  const sizeBtn = (k) => { const s = Core.groupSizesFor({ ...e, groupSize: k }, n); const over = s.some((x) => Core.dayCount(e, x) > 1); return `<button class="size-b ${e.groupSize === k ? "cur" : ""} ${over ? "over" : ""}" data-action="gsize" data-k="${k}">${k}人<small>${s.length ? s.length + "リーグ" : "—"}</small></button>`; };
  const cards = e.leagues.map((l, li) => {
    const sorted = l.ids.map((id) => em[id]).filter(Boolean);
    const schools = new Set(sorted.map((p) => p.school).filter(Boolean));
    const dups = {}; sorted.forEach((p) => { if (p.school) dups[p.school] = (dups[p.school] || 0) + 1; });
    return `<article class="card league-card ${lgClass(li)}" data-drop="member" data-drop-id="${li}"><div class="league-title"><span class="league-letter">${letter(li)}</span><div><h3>${letter(li)}リーグ</h3><span class="faint">${sorted.length}${isDbl(e) ? "組" : "人"} · ${Core.matchCount(sorted.length)}試合</span></div></div>
      <div class="league-meta">${dayInfo(l)}${[...schools].length ? `<span class="chip">${schools.size}校</span>` : ""}</div>
      <ul class="plist">${sorted.map((p) => `<li data-drag="member" data-drag-id="${p.id}" data-drag-label="${esc(nameFlat(p))}"><div class="pname">⠿ ${nameStack(p)}<span class="pschool ${dups[p.school] > 1 ? "dup" : ""}">${esc(p.school)}</span></div>${App.levelBar(p.level)}
        <select class="select move-select" data-change="move" data-id="${p.id}" aria-label="移す先">${e.leagues.map((_, i) => `<option value="${i}" ${i === li ? "selected" : ""}>${letter(i)}</option>`).join("")}<option value="-1">外す</option></select></li>`).join("")}</ul></article>`;
  }).join("");
  const unp = isDbl(e) ? Core.unpairedPlayers(e) : [];
  return `<section class="card stack"><div class="card-head"><div><h2>リーグに分ける</h2><p class="faint">${n}${isDbl(e) ? "組" : "人"}を、1リーグの人数に近くなるように分けます。</p></div></div>
    <div class="field"><span>1リーグの人数</span><div class="size-pick">${[3, 4, 5, 6, 7, 8].map(sizeBtn).join("")}</div></div>
    <div class="field"><span>分け方</span><div class="choice-grid two">
      <label class="choice"><input type="radio" name="split" value="level" data-change="split" ${e.splitMethod === "level" ? "checked" : ""}><b>ランク別</b><span class="faint">強い順に A・B・C…</span></label>
      <label class="choice"><input type="radio" name="split" value="balanced" data-change="split" ${e.splitMethod === "balanced" ? "checked" : ""}><b>どのリーグも同じ強さ</b><span class="faint">強い人が各リーグに1人ずつ</span></label></div></div>
    <label class="check"><input type="checkbox" data-change="spread" ${e.spreadSchools ? "checked" : ""}>同じ学校は、なるべく別のリーグへ</label>
    ${unp.length ? `<div class="confirm"><b>ペアになっていない人が ${unp.length}人います。</b>選手の画面で、2人を選んでペアにしてください。</div>` : ""}
    ${ui.confirm === "reassign" ? `<div class="confirm"><b>いまのリーグ分けを消して、分け直します。</b>入れた結果は残りますが、組み合わせが変わると使われないものも出ます。<button class="btn btn-primary btn-sm" data-action="auto-yes">分け直す</button><button class="btn btn-ghost btn-sm" data-action="cancel">やめる</button></div>` : ""}
    <div class="row"><button class="btn btn-aurora" data-action="auto" ${n < 3 ? "disabled" : ""}>${e.leagues.length ? "分け直す" : "リーグに分ける"}</button>${n < 3 ? `<span class="faint">3${isDbl(e) ? "組" : "人"}以上で分けられます</span>` : ""}</div></section>
    ${un.length ? `<section class="card" data-drop="member" data-drop-id="-1"><h3>どこにも入っていない</h3><div class="row" style="margin-top:8px">${un.map((p) => `<span class="chip" data-drag="member" data-drag-id="${p.id}" data-drag-label="${esc(nameFlat(p))}">⠿ ${esc(nameFlat(p))}</span>`).join("")}</div></section>` : ""}
    ${e.leagues.length ? `<div class="league-grid">${cards}</div><p class="faint">名前をつかんで別のリーグへ落とすか、右のメニューで移せます。</p>` : ""}`;
}
/* ---------- 試合と結果 ---------- */
function leaguePillsHTML(e) {
  return `<div class="league-switch"><span class="switch-label">リーグ</span><div class="league-pills">${e.leagues.map((l, i) => { const s = Core.standings(e, l); return `<button class="league-pill ${lgClass(i)} ${ui.league === i ? "is-active" : ""}" data-action="pick-league" data-i="${i}"><span class="lp-letter">${letter(i)}</span><small>${s.finished}/${s.total}</small></button>`; }).join("")}</div></div>`;
}
function hoshiHTML(e, li) {
  const l = e.leagues[li], s = Core.standings(e, l), em = entryMap(e), ids = l.ids.filter((id) => em[id]), anyDone = s.finished > 0;
  const head = ids.map((id) => `<th>${nameStack(em[id])}</th>`).join("");
  const body = s.rows.map((r) => {
    const cells = ids.map((cid) => {
      if (cid === r.id) return `<td class="self"></td>`;
      const o = Core.outcome(e, r.id, cid);
      if (!o.winner) return `<td></td>`;
      const win = o.winner === r.id;
      return `<td class="${win ? "win" : "lose"}"><span class="mark">${win ? "○" : "●"}</span><span class="sc num">${esc(App.xlScore(e, o).replace("－", "-"))}</span></td>`;
    }).join("");
    return `<tr class="${r.rank === 1 && anyDone ? "top" : ""}"><td class="name-cell">${nameStack(r.p)}<span class="pschool">${esc(r.p.school)}</span></td>${cells}<td class="num">${r.w}</td><td class="num">${r.l}</td><td class="num">${r.gw - r.gl}</td><td class="num">${r.pf - r.pa}</td><td class="rank ${r.rank === 1 ? "rank-1" : ""}">${anyDone ? r.rank : "—"}</td></tr>`;
  }).join("");
  return `<div class="table-wrap"><table class="hoshi"><thead><tr><th class="name-cell">${isDbl(e) ? "ペア" : "選手"}</th>${head}<th>勝</th><th>敗</th><th>得失<br>ゲーム</th><th>得失<br>点</th><th>順位</th></tr></thead><tbody>${body}</tbody></table></div>${s.lots ? `<p class="tie-note">同じ順位の人は、BWF 規程の順(勝ち数 → 直接対決 → ゲーム差 → 得失点差)でも決まらなかったので、抽選で決めます。</p>` : ""}`;
}
function scoreInputs(e, a, b, pa, pb, cur, wo, ids) {
  const games = Core.gamesOf(e, a, b);
  return Array.from({ length: e.games }, (_, g) => {
    const [x, y] = games[g] || [null, null], bad = Core.gameWarn(e, x, y);
    return `<div class="game">${e.games > 1 ? `<span class="game-label">第${g + 1}</span>` : ""}<input class="score ${bad ? "bad" : ""}" id="sc-${ids}-${g}-0" inputmode="numeric" autocomplete="off" maxlength="2" data-input="score" ${cur} data-g="${g}" data-s="0" value="${x ?? ""}" ${wo ? "disabled" : ""} aria-label="${esc(pa)} 第${g + 1}ゲームの点数"><span>-</span><input class="score ${bad ? "bad" : ""}" id="sc-${ids}-${g}-1" inputmode="numeric" autocomplete="off" maxlength="2" data-input="score" ${cur} data-g="${g}" data-s="1" value="${y ?? ""}" ${wo ? "disabled" : ""} aria-label="${esc(pb)} 第${g + 1}ゲームの点数"></div>`;
  }).join("");
}
const qwinBtn = (o, me, attrs) => `<button type="button" class="qwin ${o && o.winner === me ? "on" : ""}" ${attrs} data-w="${me}" aria-pressed="${!!(o && o.winner === me)}">${o && o.winner === me ? "○ 勝ち" : "勝ち"}</button>`;
function woSelect(a, b, cur, na, nb, attrs) { return `<select class="select wo-select ${cur ? "is-on" : ""}" ${attrs} aria-label="棄権"><option value="">棄権なし</option><option value="${a}" ${cur === a ? "selected" : ""}>${esc(na)} が棄権</option><option value="${b}" ${cur === b ? "selected" : ""}>${esc(nb)} が棄権</option></select>`; }
function statusChip(e, o, games) {
  if (o.wo) return `<span class="chip chip-warn">不戦勝</span>`;
  if (o.winner) return Core.extraGame(e, games) ? `<span class="chip chip-warn">いらないゲームあり</span>` : `<span class="chip chip-ok">終了</span>`;
  return o.started ? `<span class="chip chip-live">途中</span>` : "";
}
function matchRowHTML(e, a, b) {
  const em = entryMap(e), A_ = em[a], B_ = em[b], o = Core.outcome(e, a, b), games = Core.gamesOf(e, a, b), cur = `data-a="${a}" data-b="${b}"`;
  return `<div class="match ${o.winner ? "is-done" : ""}" id="m-${keyOf(a, b)}"><div class="m-side a ${o.winner === a ? "win" : ""}"><span class="pname">${nameStack(A_)}</span><span class="pschool">${esc(A_.school)}</span>${qwinBtn(o, a, `data-action="qwin" ${cur}`)}</div>
    <div class="m-scores">${scoreInputs(e, a, b, nameFlat(A_), nameFlat(B_), cur, o.wo, keyOf(a, b))}${woSelect(a, b, Core.woOf(e, a, b), nameFlat(A_), nameFlat(B_), `data-change="wo" ${cur}`)}</div>
    <div class="m-side b ${o.winner === b ? "win" : ""}"><span class="pname">${nameStack(B_)}</span><span class="pschool">${esc(B_.school)}</span>${qwinBtn(o, b, `data-action="qwin" ${cur}`)}</div><div class="m-status">${statusChip(e, o, games)}</div></div>`;
}
function matchesHTML(e) {
  if (!e.leagues.length) return `<section class="card empty"><h2>まだリーグがありません</h2><p class="muted">「リーグ分け」のタブで、リーグを作ってください。</p><button class="btn btn-primary" data-action="tab" data-tab="leagues">リーグ分けへ</button></section>`;
  if (ui.league == null || !e.leagues[ui.league]) ui.league = 0;
  const li = ui.league, l = e.leagues[li], rr = Core.roundRobin(l.ids), days = Core.splitDays(rr, e.maxPerDay), em = entryMap(e);
  let rno = 0;
  const per = {}; rr.forEach((r) => r.pairs.flat().forEach((id) => (per[id] = (per[id] || 0) + 1)));
  const mx = Math.max(0, ...Object.values(per));
  const dayBlocks = days.map((d, di) => `${days.length > 1 ? `<div class="day-head"><h3>${di + 1}日目</h3><span class="faint">${d.reduce((s, r) => s + r.pairs.length, 0)}試合</span></div>` : ""}${d.map((r) => { rno++; return `<div class="round"><div class="row"><h3 style="font-size:.95rem">ラウンド ${rno}</h3>${r.bye ? `<span class="faint">休み: ${esc(nameFlat(em[r.bye]))}</span>` : ""}</div>${r.pairs.map(([a, b]) => matchRowHTML(e, a, b)).join("")}</div>`; }).join("")}`).join("");
  return `${leaguePillsHTML(e)}<section class="card ${lgClass(li)}"><div class="card-head"><div class="league-title"><span class="league-letter">${letter(li)}</span><div><h2 style="color:var(--lg)">${letter(li)}リーグ 星取表</h2><p class="faint">○ 勝ち ● 負け。順位は BWF 一般競技規程 16.2 のとおり。</p></div></div></div>${hoshiHTML(e, li)}</section>
    <section class="card"><div class="card-head"><div><h2>試合</h2><p class="faint">点数を入れるか「勝ち」を押します。1人 ${mx}試合${days.length > 1 ? ` · 1日 ${e.maxPerDay}試合までなので ${days.length}日に分けています` : ""}。</p></div></div>
      <div class="day-load ${mx > e.maxPerDay && days.length < 2 ? "is-over" : ""}">1人あたり最大 ${mx}試合 / 1日の上限 ${e.maxPerDay}</div><div class="stack">${dayBlocks}</div></section>`;
}
function overviewHTML(e) {
  if (!e.leagues.length) return `<section class="card empty"><h2>まだリーグがありません</h2></section>`;
  return `<div class="overview">${e.leagues.map((l, li) => { const s = Core.standings(e, l); return `<section class="card ${lgClass(li)}"><div class="league-title"><span class="league-letter">${letter(li)}</span><div><h3>${letter(li)}リーグ</h3><span class="faint">${s.finished}/${s.total}試合</span></div></div>
    <table class="mini"><tbody>${s.sorted.map((r) => `<tr><td class="rank">${s.finished ? r.rank : "—"}</td><td>${esc(nameFlat(r.p))}<span class="pschool">${esc(r.p.school)}</span></td><td class="stat">${r.w}勝${r.l}敗</td></tr>`).join("")}</tbody></table>${s.lots ? `<p class="tie-note">同じ順位は抽選で決めます。</p>` : ""}</section>`; }).join("")}</div>`;
}
/* ---------- トーナメント ---------- */
function bracketSVG(e, st) {
  const em = entryMap(e), { N, K, rounds, slots } = st, rowH = 28, colW = 46, gap = 170, top = 62, nameW = isDbl(e) ? 260 : 210, half = N / 2, leafY = {};
  let maxRows = 0;
  [0, 1].forEach((h) => { let y = top; for (let s = h * half; s < (h + 1) * half; s++) if (slots[s]) { leafY[s] = y; y += rowH; } maxRows = Math.max(maxRows, (y - top) / rowH); });
  const W = 2 * (nameW + (K - 1) * colW) + gap, cx = W / 2, X = (h, r) => (h === 0 ? nameW + r * colW : W - (nameW + r * colW)), yOf = {};
  rounds.forEach((nodes, ri) => nodes.forEach((n) => { const ys = ri === 0 ? [leafY[2 * n.i], leafY[2 * n.i + 1]] : [yOf[rounds[ri - 1][2 * n.i].mid], yOf[rounds[ri - 1][2 * n.i + 1].mid]]; const ok = ys.filter((v) => v != null); n.childY = ys; yOf[n.mid] = ok.length === 2 ? (ok[0] + ok[1]) / 2 : ok.length ? ok[0] : null; }));
  const bottom = top + maxRows * rowH, thirdY = bottom + 46, H = st.third ? thirdY + 30 : bottom + 14;
  let out = "";
  const box = (n, x, y) => `<g class="bnode ${n.o && n.o.winner ? "done" : ""} ${ui.bmatch === n.mid ? "sel" : ""}" data-action="bpick" data-mid="${n.mid}" role="button" aria-label="第${n.num}試合"><rect x="${x - 14}" y="${y - 10}" width="28" height="20" rx="7"/><text x="${x}" y="${y + 4}">${n.num}</text></g>`;
  const scoreLabel = (n, x, y) => (n.o && n.o.winner ? `<text class="bsc" x="${x}" y="${y - 6}">${esc(App.xlScore(e, n.o).replace("－", "-").replace("不戦", "不戦"))}</text>` : "");
  const hl = (n, c) => n.real && n.o && n.o.winner && n.o.winner === c;
  slots.forEach((id, s) => {
    if (!id) return;
    const h = s < half ? 0 : 1, x = h === 0 ? nameW - 8 : W - nameW + 8, sd = e.bracket.seeds && e.bracket.seeds[id], mark = sd ? `<tspan class="bseed">[${sd}]</tspan> ` : "", hx = h === 0 ? 0 : W - nameW + 4;
    out += `<g class="bslot" data-drag="slot" data-drag-id="${s}" data-drop="slot" data-drop-id="${s}" data-drag-label="${esc(nameFlat(em[id]))}"><rect class="bhit" x="${hx}" y="${leafY[s] - rowH / 2 + 1}" width="${nameW - 4}" height="${rowH - 2}" rx="8"/><text class="bt${st.champion === id ? " champ" : ""}" x="${x}" y="${leafY[s] + 4}" text-anchor="${h === 0 ? "end" : "start"}">${mark}${esc(nameFlat(em[id]))}<tspan class="bs"> ${esc(em[id].school)}</tspan></text></g>`;
  });
  for (let ri = 0; ri < K - 1; ri++) {
    const per = rounds[ri].length;
    rounds[ri].forEach((n) => {
      const y = yOf[n.mid]; if (y == null) return;
      const h = n.i < per / 2 ? 0 : 1;
      [0, 1].forEach((c) => { const cy = n.childY[c]; if (cy == null) return; const co = ri === 0 ? slots[2 * n.i + c] : rounds[ri - 1][2 * n.i + c].out; out += `<path class="bl${hl(n, co) ? " hl" : ""}" d="M${X(h, ri)} ${cy}H${X(h, ri + 1)}V${y}"/>`; });
      if (n.real) { out += box(n, X(h, ri + 1), y); out += scoreLabel(n, X(h, ri + 1) + (h === 0 ? colW / 2 : -colW / 2), y); }
    });
  }
  const f = st.final, fy = yOf[f.mid];
  [0, 1].forEach((c) => { const cy = f.childY[c]; if (cy == null) return; const co = K === 1 ? slots[c] : rounds[K - 2][c].out; out += `<path class="bl${hl(f, co) ? " hl" : ""}" d="M${X(c, K - 1)} ${cy}H${cx}V${fy}"/>`; });
  if (f.real) { out += box(f, cx, fy); out += `<text class="blabel" x="${cx}" y="22">決勝</text>`; if (st.champion && st.champion !== "?") out += `<text class="bchamp" x="${cx}" y="40">優勝 ${esc(nameFlat(em[st.champion]))}</text>`; out += scoreLabel(f, cx, fy + 30); }
  if (K >= 2) out += `<text class="blabel" x="${nameW / 2}" y="22">Aブロック</text><text class="blabel" x="${W - nameW / 2}" y="22">Bブロック</text>`;
  const t = st.third;
  if (t) { const nm = (id) => (id && id !== "?" ? esc(nameFlat(em[id])) : "(準決勝の敗者)"); out += `<text class="blabel" x="${cx}" y="${thirdY - 20}">3位決定戦</text><text class="bt" x="${cx - 70}" y="${thirdY + 4}" text-anchor="end">${nm(t.a)}</text><text class="bt" x="${cx + 70}" y="${thirdY + 4}" text-anchor="start">${nm(t.b)}</text><path class="bl${hl(t, t.a) ? " hl" : ""}" d="M${cx - 64} ${thirdY}H${cx}"/><path class="bl${hl(t, t.b) ? " hl" : ""}" d="M${cx + 64} ${thirdY}H${cx}"/>${box(t, cx, thirdY)}`; }
  return `<svg class="bracket-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="トーナメント表">${out}</svg>`;
}
function printSheetSVG(e, st) {
  const em = entryMap(e), { N, K, rounds, slots } = st, dbl = isDbl(e), W = 720, H = 1018, cx = W / 2, half = N / 2, top = 92, bottom = H - (st.third ? 110 : 30);
  const rowsOf = (h) => slots.slice(h * half, (h + 1) * half).filter(Boolean).length, maxRows = Math.max(rowsOf(0), rowsOf(1), 1), rowH = Math.min(100, (bottom - top) / maxRows), lines = dbl ? 3 : 2, fs = Math.min(15, rowH / (lines * 1.25));
  const boxW = dbl ? 150 : 136, nameX = 22, lx = nameX + boxW + 26, colW = K >= 2 ? (cx - 18 - lx) / (K - 1) : 0, X = (h, r) => (h === 0 ? lx + r * colW : W - (lx + r * colW));
  const spread = (s, x, y, size, weight) => { const len = [...s].length, fit = len > 1 ? ` textLength="${boxW}" lengthAdjust="${len * size <= boxW ? "spacing" : "spacingAndGlyphs"}"` : "", ax = len > 1 ? x : x + boxW / 2; return `<text x="${ax}" y="${y}" font-size="${size}" font-weight="${weight}"${len > 1 ? "" : ` text-anchor="middle"`}${fit}>${esc(s)}</text>`; };
  const leafY = {}; let out = "", no = 1;
  [0, 1].forEach((h) => { let k = 0; for (let s = h * half; s < (h + 1) * half; s++) { const p = slots[s] && em[slots[s]]; if (!p) continue; const y = top + rowH * (k++ + 0.5); leafY[s] = y; const texts = dbl ? [p.names[0], p.names[1]] : [p.name || ""]; if (p.school) texts.push(`(${p.school})`); const tx = h === 0 ? nameX : W - nameX - boxW; texts.forEach((t, i) => { const ty = y + (i - (texts.length - 1) / 2) * fs * 1.2 + fs * 0.36, sch = i === texts.length - 1 && p.school; out += spread(t, tx, ty, sch ? fs * 0.92 : fs, sch ? 400 : 700); }); out += `<text x="${h === 0 ? lx - 6 : W - lx + 6}" y="${y + fs * 0.32}" font-size="${fs * 0.85}" text-anchor="${h === 0 ? "end" : "start"}">${no++}</text>`; } });
  const yOf = {};
  rounds.forEach((nodes, ri) => nodes.forEach((n) => { const ys = ri === 0 ? [leafY[2 * n.i], leafY[2 * n.i + 1]] : [yOf[rounds[ri - 1][2 * n.i].mid], yOf[rounds[ri - 1][2 * n.i + 1].mid]]; const ok = ys.filter((v) => v != null); n.childY = ys; yOf[n.mid] = ok.length === 2 ? (ok[0] + ok[1]) / 2 : ok.length ? ok[0] : null; }));
  const numFs = Math.max(8, Math.min(11, fs * 0.75));
  for (let ri = 0; ri < K - 1; ri++) { const per = rounds[ri].length; rounds[ri].forEach((n) => { const y = yOf[n.mid]; if (y == null) return; const h = n.i < per / 2 ? 0 : 1; n.childY.forEach((cy) => { if (cy != null) out += `<path d="M${X(h, ri)} ${cy}H${X(h, ri + 1)}V${y}"/>`; }); if (n.real) out += `<text x="${X(h, ri + 1) + (h === 0 ? -3 : 3)}" y="${y + numFs * 0.35}" font-size="${numFs}" text-anchor="${h === 0 ? "end" : "start"}">${n.num}</text>`; }); }
  const f = st.final, [yl, yr] = f.childY, fy = yl != null && yr != null ? (yl + yr) / 2 : yl != null ? yl : yr;
  if (yl != null) out += `<path d="M${X(0, K - 1)} ${yl}${yl === fy ? "" : `H${cx - 12}V${fy}`}H${cx}"/>`;
  if (yr != null) out += `<path d="M${X(1, K - 1)} ${yr}${yr === fy ? "" : `H${cx + 12}V${fy}`}H${cx}"/>`;
  if (f.real) out += `<path d="M${cx} ${fy}V${fy - 12}"/><text x="${cx}" y="${fy + numFs + 3}" font-size="${numFs}" text-anchor="middle">${f.num}</text>`;
  const t = st.third;
  if (t) { const ty = Math.min(H - 62, top + maxRows * rowH + 70); out += `<text x="${cx}" y="${ty - 22}" font-size="${numFs + 1}" text-anchor="middle">3位決定戦</text><path d="M${cx - 28} ${ty + 26}V${ty}H${cx + 28}V${ty + 26}M${cx} ${ty}V${ty - 10}"/><text x="${cx}" y="${ty + numFs + 3}" font-size="${numFs}" text-anchor="middle">${t.num}</text>`; }
  const sub = `トーナメント・${dbl ? "ダブルス" : "シングルス"}(${App.countText(e, Object.keys(leafY).length)})　${e.date || ""}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="'Hiragino Kaku Gothic ProN','Yu Gothic','Meiryo',sans-serif" fill="#000"><text x="${cx}" y="38" font-size="22" font-weight="700" text-anchor="middle">${esc(e.name)}</text><text x="${cx}" y="62" font-size="12" text-anchor="middle">${esc(sub)}</text><g fill="none" stroke="#000" stroke-width="1.3">${out.match(/<path[^>]*>/g)?.join("") || ""}</g>${out.replace(/<path[^>]*>/g, "")}</svg>`;
}
App.printSheetSVG = printSheetSVG;
function sideName(e, n, side) {
  const em = entryMap(e), id = side === 0 ? n.a : n.b;
  if (id && id !== "?" && em[id]) return { text: nameFlat(em[id]), id };
  const c = side === 0 ? n.L : n.R;
  if (n.isThird) return { text: c && c.num ? `第${c.num}試合の敗者` : "未定" };
  let cc = c; while (cc && !cc.real && cc.L) cc = cc.L.cnt ? cc.L : cc.R;
  return { text: cc && cc.num ? `第${cc.num}試合の勝者` : "未定" };
}
function bracketHTML(e) {
  const st = Core.bracketState(e), n = entries(e).length, unp = isDbl(e) ? Core.unpairedPlayers(e) : [];
  const head = `<section class="card"><div class="card-head"><div><h2>トーナメント表</h2><p class="faint">シードを決めて「表を作る」。名前をつかんで別の枠に落とすと、2つが入れ替わります。</p></div></div>
    ${unp.length ? `<div class="confirm"><b>ペアになっていない人が ${unp.length}人います。</b>選手の画面でペアにしてください。</div>` : ""}
    ${ui.confirm === "rebuild" ? `<div class="confirm"><b>いまの表を作り直します。</b>入れた結果は消えます。<button class="btn btn-primary btn-sm" data-action="build-yes">作り直す</button><button class="btn btn-ghost btn-sm" data-action="cancel">やめる</button></div>` : ""}
    ${n >= 2 ? (() => { const K = Math.ceil(Math.log2(n)), over = K > e.maxPerDay; return `<p class="day-load ${over ? "is-over" : ""}">勝ち進むと1人 最大 ${K}試合。${over ? `1日${e.maxPerDay}試合を超えるので、途中の回戦で日を分けてください。` : `1日${e.maxPerDay}試合に収まります。`}</p>`; })() : ""}
    <div class="row"><button class="btn btn-aurora" data-action="build" ${n < 2 ? "disabled" : ""}>${st ? "表を作り直す" : "表を作る"}</button><label class="check"><input type="checkbox" data-change="t-third" ${e.tThird ? "checked" : ""}>3位決定戦をする</label><label class="check"><input type="checkbox" data-change="spread" ${e.spreadSchools ? "checked" : ""}>同じ学校を早い回戦で当てない</label>${st ? `<button class="btn btn-secondary btn-sm" data-action="print-bracket">A4で印刷</button>` : ""}</div>
    ${seedBoxHTML(e)}</section>`;
  if (!st) return head;
  const matches = Core.bracketMatches(st), sel = ui.bmatch ? Core.findNode(st, ui.bmatch) : null;
  return `${head}<section class="card"><div class="bracket-wrap">${bracketSVG(e, st)}</div></section>${sel && sel.real ? bpanelHTML(e, st, sel) : ""}
    <section class="card"><div class="card-head"><div><h2>試合の一覧</h2><p class="faint">押すと点数を入れる欄が開きます。</p></div></div><div class="bm-list">${matches.map((n) => { const A_ = sideName(e, n, 0), B_ = sideName(e, n, 1), w = n.o && n.o.winner; return `<button class="bm-row ${ui.bmatch === n.mid ? "is-sel" : ""}" data-action="bpick" data-mid="${n.mid}"><span class="bm-num">${n.num}</span><span class="bm-round">${n.label}</span><span class="bm-vs">${w === n.a ? "<b>" : ""}${esc(A_.text)}${w === n.a ? "</b>" : ""} 対 ${w === n.b ? "<b>" : ""}${esc(B_.text)}${w === n.b ? "</b>" : ""}</span>${n.o && n.o.winner ? `<span class="chip chip-ok">${esc(App.xlScore(e, n.o).replace("－", "-") || "終了")}</span>` : ""}</button>`; }).join("")}</div></section>${ranksHTML(e, st)}`;
}
function seedBoxHTML(e) {
  const list = entries(e).slice().sort((a, b) => b.level - a.level || a.name.localeCompare(b.name, "ja")), n = list.length, cnt = Object.keys(e.seeds).length;
  if (n < 2) return "";
  return `<details class="seedbox"><summary>シードを決める${cnt ? ` <span class="chip chip-live">${cnt}人指定</span>` : ""}</summary><p class="faint" style="margin:0 0 10px">指定しない人は、ランクの高い順にシードになります。</p>
    <div class="seed-list">${list.map((p) => `<div class="seed-row"><span class="pname">${esc(p.name)}<span class="pschool">${esc(p.school)}</span></span><select class="select" data-change="seed" data-id="${p.id}"><option value="">—</option>${Array.from({ length: Math.min(n, 16) }, (_, i) => `<option value="${i + 1}" ${e.seeds[p.id] === i + 1 ? "selected" : ""}>シード${i + 1}</option>`).join("")}</select></div>`).join("")}</div>${cnt ? `<button class="btn btn-ghost btn-sm" data-action="seed-clear">指定を解除</button>` : ""}</details>`;
}
function bpanelHTML(e, st, n) {
  const A_ = sideName(e, n, 0), B_ = sideName(e, n, 1), ready = n.a && n.a !== "?" && n.b && n.b !== "?";
  const res = e.bracket.results[n.mid], games = res && res.a === n.a && res.b === n.b ? res.g : [], o = n.o || {}, cur = `data-mid="${n.mid}"`;
  const inputs = ready ? Array.from({ length: e.games }, (_, g) => { const [x, y] = games[g] || [null, null], bad = Core.gameWarn(e, x, y); return `<div class="game">${e.games > 1 ? `<span class="game-label">第${g + 1}</span>` : ""}<input class="score ${bad ? "bad" : ""}" id="bs-${n.mid}-${g}-0" inputmode="numeric" maxlength="2" autocomplete="off" data-input="bscore" ${cur} data-g="${g}" data-s="0" value="${x ?? ""}" ${o.wo ? "disabled" : ""} aria-label="${esc(A_.text)} 第${g + 1}ゲーム"><span>-</span><input class="score ${bad ? "bad" : ""}" id="bs-${n.mid}-${g}-1" inputmode="numeric" maxlength="2" autocomplete="off" data-input="bscore" ${cur} data-g="${g}" data-s="1" value="${y ?? ""}" ${o.wo ? "disabled" : ""} aria-label="${esc(B_.text)} 第${g + 1}ゲーム"></div>`; }).join("") : `<p class="faint">対戦相手が決まると入力できます。</p>`;
  return `<section class="card"><div class="card-head"><div><h2>第${n.num}試合 <span class="chip">${n.label}</span></h2></div><button class="btn btn-ghost btn-sm" data-action="bclose">閉じる</button></div>
    <div class="match" style="grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)"><div class="m-side a ${o.winner && o.winner === n.a ? "win" : ""}"><span class="pname">${esc(A_.text)}</span>${ready ? qwinBtn(o, n.a, `data-action="bqwin" ${cur}`) : ""}</div><div class="m-scores">${inputs}${ready ? woSelect(n.a, n.b, o.wo, A_.text, B_.text, `data-change="bwo" ${cur}`) : ""}</div><div class="m-side b ${o.winner && o.winner === n.b ? "win" : ""}"><span class="pname">${esc(B_.text)}</span>${ready ? qwinBtn(o, n.b, `data-action="bqwin" ${cur}`) : ""}</div></div></section>`;
}
function ranksHTML(e, st) {
  const em = entryMap(e), f = st.final, champ = st.champion && st.champion !== "?" ? st.champion : null;
  const runner = f.real && f.o && f.o.winner ? (f.o.winner === f.a ? f.b : f.a) : null;
  const thirds = st.third ? (st.third.o && st.third.o.winner ? [st.third.o.winner] : []) : st.K >= 2 ? st.rounds[st.K - 2].filter((s) => s.real && s.o && s.o.winner).map((s) => (s.o.winner === s.a ? s.b : s.a)) : [];
  const card = (l, id) => `<div class="rank-card"><span class="faint">${l}</span><b>${id && em[id] ? esc(nameFlat(em[id])) : "—"}</b><span class="pschool">${id && em[id] ? esc(em[id].school) : ""}</span></div>`;
  return `<section class="card"><h2 style="margin-bottom:12px">順位</h2><div class="ranks">${card("優勝", champ)}${card("準優勝", runner)}${(thirds.length ? thirds : [null]).map((id) => card("3位", id)).join("")}</div></section>`;
}
App.views.leagues = leaguesHTML; App.views.matches = matchesHTML; App.views.overview = overviewHTML; App.views.bracket = bracketHTML;

/* ---------- 操作 ---------- */
function scoreCommit(e, t, set, getGames, key) {
  const cap = Core.scoreCap(e);
  let v = t.value.replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xfee0)).replace(/\D/g, "");
  let n = v === "" ? null : parseInt(v, 10);
  if (n != null && n > cap) { n = null; toast(`${e.points}点のゲームは ${cap} 点までです`); }
  set(n);
  commit(); render();
  if (n == null) return;
  const done = String(n).length >= 2 || n === 0 || n * 10 > cap, g = Number(t.dataset.g), s = Number(t.dataset.s);
  if (!done) return;
  const games = getGames();
  const x = games[g] || [null, null];
  const win = Core.outcomeOf(e, games, "a", "b", null, null).winner;
  let next = s === 0 ? `${key}-${g}-1` : win ? null : g + 1 < e.games ? `${key}-${g + 1}-0` : null;
  if (s === 1 && x[0] == null) next = `${key}-${g}-0`;
  if (next) { const el = document.getElementById(next); if (el && !el.disabled) { el.focus({ preventScroll: true }); el.select(); } }
}
App.scoreCommit = scoreCommit;
Object.assign(A, {
  gsize: (b) => { const e = ev(); e.groupSize = clamp(Number(b.dataset.k), 3, 8); commit(); render(); },
  auto: () => { const e = ev(); if (e.leagues.length) { ui.confirm = "reassign"; render(); } else { Core.autoAssign(e); commit(); render(); toast(`${e.leagues.length}つのリーグに分けました`); } },
  "auto-yes": () => { const e = ev(); ui.confirm = null; Core.autoAssign(e); commit(); render(); toast(`${e.leagues.length}つのリーグに分け直しました`); },
  "pick-league": (b) => { ui.league = Number(b.dataset.i); render(); },
  qwin: (b) => { const e = ev(), a = b.dataset.a, c = b.dataset.b, w = b.dataset.w, cur = Core.winOf(e, a, c), o = Core.outcome(e, a, c); Core.setWin(e, a, c, cur === w || (o.winner === w && !o.quick) ? null : w); commit(); render(); },
  bpick: (b) => { ui.bmatch = ui.bmatch === b.dataset.mid ? null : b.dataset.mid; render(); },
  bclose: () => { ui.bmatch = null; render(); },
  bqwin: (b) => { const e = ev(), st = Core.bracketState(e), n = Core.findNode(st, b.dataset.mid); if (!n) return; const w = b.dataset.w, r = e.bracket.results[n.mid]; Core.setBWin(e, n, r && r.win === w ? null : w); commit(); render(); },
  build: () => { const e = ev(); if (e.bracket) { ui.confirm = "rebuild"; render(); } else { Core.buildBracket(e); ui.bmatch = null; commit(); render(); } },
  "build-yes": () => { const e = ev(); ui.confirm = null; Core.buildBracket(e); ui.bmatch = null; commit(); render(); toast("表を作り直しました"); },
  "seed-clear": () => { const e = ev(); e.seeds = {}; commit(); render(); toast("シードの指定を解除しました"); },
  "print-bracket": () => App.doPrint(),
});
Object.assign(Ch, {
  split: (t) => { const e = ev(); e.splitMethod = t.value === "balanced" ? "balanced" : "level"; commit(); render(); },
  spread: (t) => { const e = ev(); e.spreadSchools = t.checked; commit(); render(); },
  "t-third": (t) => { const e = ev(); e.tThird = t.checked; commit(); render(); },
  move: (t) => { const e = ev(); Core.moveToLeague(e, t.dataset.id, Number(t.value)); commit(); render(); },
  wo: (t) => { const e = ev(); Core.setWo(e, t.dataset.a, t.dataset.b, t.value || null); commit(); render(); },
  bwo: (t) => { const e = ev(), n = Core.findNode(Core.bracketState(e), t.dataset.mid); if (n) { Core.setBWo(e, n, t.value || null); commit(); render(); } },
  seed: (t) => { const e = ev(), id = t.dataset.id, v = parseInt(t.value, 10); Object.keys(e.seeds).forEach((k) => { if (k === id || e.seeds[k] === v) delete e.seeds[k]; }); if (v) e.seeds[id] = v; commit(); render(); },
});
const prevIn = App.input;
App.input = (t) => {
  if (prevIn(t)) return true;
  const e = ev();
  if (t.dataset.input === "score") { const a = t.dataset.a, b = t.dataset.b, g = Number(t.dataset.g), s = Number(t.dataset.s); scoreCommit(e, t, (n) => Core.setScore(e, a, b, g, s, n), () => Core.gamesOf(e, a, b), `sc-${keyOf(a, b)}`); return true; }
  if (t.dataset.input === "bscore") { const n0 = Core.findNode(Core.bracketState(e), t.dataset.mid), g = Number(t.dataset.g), s = Number(t.dataset.s); if (!n0) return true; scoreCommit(e, t, (n) => Core.setBScore(e, n0, g, s, n), () => { const r = e.bracket.results[n0.mid]; return r ? r.g : []; }, `bs-${n0.mid}`); return true; }
  return false;
};
/* ドラッグの行き先(ドラッグの仕組みは C にある) */
App.drops = App.drops || {};
App.drops.slot = (from, to) => { const e = ev(), em = entryMap(e), s = e.bracket.slots; const i = Number(from), j = Number(to); if (!Core.swapSlots(e, i, j)) return; commit(); render(); toast(`${nameFlat(em[s[j]])} と ${nameFlat(em[s[i]])} を入れ替えました`); };
App.drops.member = (from, to) => { const e = ev(), toI = Number(to); if (Core.leagueIndexOf(e, from) === toI) return; const em = entryMap(e); Core.moveToLeague(e, from, toI); commit(); render(); toast(`${nameFlat(em[from])} を${toI >= 0 ? letter(toI) + "リーグへ動かしました" : "リーグから外しました"}`); };

/* ---------- Excel に出す表 ---------- */
App.blocks.push((e) => {
  const em = entryMap(e), u = App.unitWord(e), blocks = [];
  if (e.mode === "league" && e.leagues.length) {
    e.leagues.forEach((l, li) => {
      const s = Core.standings(e, l), ids = l.ids.filter((id) => em[id]), any = s.finished > 0;
      const rows = [[u, "学校", ...ids.map((id) => nameFlat(em[id])), "勝", "敗", "得失ゲーム", "得失点", "順位"]];
      s.rows.forEach((r) => rows.push([nameFlat(r.p), r.p.school, ...ids.map((c) => { if (c === r.id) return "＼"; const o = Core.outcome(e, r.id, c); return o.winner ? (o.winner === r.id ? "○" : "●") + App.xlScore(e, o) : ""; }), r.w, r.l, r.gw - r.gl, r.pf - r.pa, any ? r.rank : ""]));
      blocks.push({ title: `${letter(li)}リーグ 星取表`, rows });
    });
    const rk = [["リーグ", "順位", u, "学校", "試合", "勝", "敗", "得失ゲーム", "得失点"]];
    e.leagues.forEach((l, li) => { const s = Core.standings(e, l); s.sorted.forEach((r) => rk.push([`${letter(li)}リーグ`, s.finished ? r.rank : "", nameFlat(r.p), r.p.school, r.played, r.w, r.l, r.gw - r.gl, r.pf - r.pa])); });
    blocks.push({ title: "順位表", rows: rk });
    const ms = [["リーグ", "ラウンド", `${u}1`, "学校", `${u}2`, "学校", ...App.gameHeads(e), "勝者"]];
    e.leagues.forEach((l, li) => Core.roundRobin(l.ids.filter((id) => em[id])).forEach((r, ri) => r.pairs.forEach(([a, b]) => { const o = Core.outcome(e, a, b), g = o.wo ? [`${nameFlat(em[o.wo])} 棄権`, ...new Array(e.games - 1).fill("")] : App.xlGames(e, Core.gamesOf(e, a, b)); ms.push([`${letter(li)}リーグ`, ri + 1, nameFlat(em[a]), em[a].school, nameFlat(em[b]), em[b].school, ...g, o.winner ? nameFlat(em[o.winner]) : ""]); })));
    blocks.push({ title: "試合結果の一覧", rows: ms });
  }
  if (e.mode === "tournament" && e.bracket) {
    const st = Core.bracketState(e), rows = [["試合番号", "回戦", `${u}1`, "学校", `${u}2`, "学校", ...App.gameHeads(e), "勝者"]];
    Core.bracketMatches(st).forEach((n) => { const A_ = sideName(e, n, 0), B_ = sideName(e, n, 1), res = e.bracket.results[n.mid], games = res && res.a === n.a && res.b === n.b ? res.g : [], w = n.o && n.o.winner, g = n.o && n.o.wo ? [`${nameFlat(em[n.o.wo])} 棄権`, ...new Array(e.games - 1).fill("")] : App.xlGames(e, games); rows.push([n.num, n.label, A_.text, em[n.a] ? em[n.a].school : "", B_.text, em[n.b] ? em[n.b].school : "", ...g, w ? nameFlat(em[w]) : ""]); });
    blocks.push({ title: "トーナメント 試合結果", rows });
  }
  return blocks;
});

/* ============ 見本(架空の名前・架空の学校) ============ */
const NAMES = ["桐生 蓮", "鳴海 陽菜", "日向 紬", "佐倉 千尋", "柏木 湊", "神崎 遥", "早瀬 葵", "小鳥遊 楓", "水城 悠真", "鷹野 晴", "橘 翔太", "若葉 颯", "朝倉 大翔", "榊 美月", "結城 心春", "白石 結衣", "瀬戸 律", "篠原 颯太", "高峰 蒼", "九条 樹", "雪村 詩", "七瀬 柚", "真柴 芽依", "望月 隼", "藤代 澪", "一ノ瀬 美咲", "宮坂 凛", "相馬 陸", "東雲 朔", "天野 灯", "春日 陽向", "久遠 奏"];
const SCH = ["東高", "西高", "南高"];
App.makeSample = (type) => {
  const rand = Core.rng(20260501);
  const mk = (n, schools) => NAMES.slice(0, n).map((nm, i) => ({ id: uid(), name: nm, school: schools[i % schools.length], level: 1 + Math.floor(rand() * 5) }));
  if (type === "practice") {
    const e = Core.blankEvent({ id: uid(), name: "見本:合同練習試合(名簿だけ)", mode: "practice", games: 3, points: 15, players: mk(32, SCH) });
    return e;
  }
  const e = Core.blankEvent({ id: uid(), name: "見本:部内リーグ戦", mode: "league", players: mk(12, SCH.slice(0, 2)), groupSize: 4 });
  Core.autoAssign(e, 7);
  return e;
};
})();
