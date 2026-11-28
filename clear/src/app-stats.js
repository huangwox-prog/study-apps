/* ============================================================
   ラブオール 画面 (app-stats) — 練習試合の成績と印刷
   - 画面用:「対戦」の画面と同じ見た目のカード(sheetViewHTML / listViewHTML / mergeViewHTML)
   - PDF用:紙の形の表(sheetHTML / listHTML / mergeHTML)。先生の決まりの形なので変えない
   - 選手ごとのページ(名前を押すと開く)
   ============================================================ */
(() => {
  "use strict";
  const { playerMap } = Core;
  const App = window.App,
    { A, ui, esc, $ } = App;
  const ev = App.ev,
    render = App.render,
    toast = App.toast,
    pn = App.pn;
  const { CIRC, daysOf, isLive, kindLabel, rankCell, sideTxt, sideSch, playerNo, idStack } = App.P;

  /* ---------- 選手ごとのページ ---------- */
  function pStatsOf(e, id) {
    return Core.pStats(e).rows.find((x) => x.p.id === id);
  }
  function playerPageHTML(e, id) {
    const p = playerMap(e)[id];
    if (!p) return "";
    const st = pStatsOf(e, id);
    const rows = e.practice.rounds
      .map((r, ri) => {
        const m = r.matches.find((x) => x.a.includes(id) || x.b.includes(id));
        if (!m)
          return `<tr><td>${Core.roundTitle(e, ri)}</td><td colspan="3" class="faint">${r.rest.includes(id) ? "休み" : "待機"}</td></tr>`;
        const s = m.a.includes(id) ? "a" : "b",
          o = Core.pOutcome(e, m),
          mate = m[s].filter((x) => x && x !== id),
          opp = m[s === "a" ? "b" : "a"].filter(Boolean);
        return `<tr><td>${Core.roundTitle(e, ri)}</td><td>${mate.length ? `ペア ${esc(mate.map((x) => pn(e, x)).join(""))}<br>` : ""}vs ${esc(opp.map((x) => pn(e, x)).join("・"))}</td><td class="num">${m.g
          .filter((x) => x[0] != null || x[1] != null)
          .map(([x, y]) => (s === "a" ? `${x ?? ""}-${y ?? ""}` : `${y ?? ""}-${x ?? ""}`))
          .join(
            " / "
          )}</td><td>${o.winner ? (o.winner === s ? `<span class="chip chip-ok">勝ち</span>` : `<span class="chip">負け</span>`) : ""} <button class="link-btn" data-action="pjump" data-m="${m.id}">試合へ</button></td></tr>`;
      })
      .join("");
    return `<div class="modal-bg" data-action="pplayer-close-bg"><div class="modal stack"><div class="card-head" style="margin:0"><div><h2>${esc(p.name)}</h2><p class="faint">${esc(p.school)} · ランク ${p.level}</p></div><button class="btn btn-ghost btn-sm" data-action="pplayer-close">閉じる</button></div>
    <div class="row"><span class="chip">${st.games}試合</span><span class="chip chip-ok">${st.w}勝</span><span class="chip">${st.l}敗</span><span class="chip chip-live">勝率 ${st.rate == null ? "—" : st.rate + "%"}</span></div>
    ${
      Core.pStats(e).days.length > 1
        ? `<div class="faint">${Core.pStats(e)
            .days.map(
              (d) =>
                `${d}日目 ${st.day[d].rate == null ? "—" : st.day[d].rate + "%"}${st.day[d].delta != null ? ` (${st.day[d].delta > 0 ? "+" : ""}${st.day[d].delta})` : ""}`
            )
            .join(" / ")}</div>`
        : ""
    }
    <div class="table-wrap"><table><tbody>${rows || `<tr><td class="faint">まだ回転がありません</td></tr>`}</tbody></table></div></div></div>`;
  }

  /* ---------- 成績 ---------- */
  /* 対戦結果表(紙の形): 試合番号・回転・選手番号・ランク・選手名/学校・得点・相手側の同じ列。勝った側の名前の欄と得点は赤く「勝ち」 */
  function sheetRows(e) {
    const out = [],
      hist = {};
    e.practice.rounds.forEach((r, ri) => {
      const H = hist[ri] || (hist[ri] = Core.pHistory(e, ri));
      r.matches.forEach((m, mi) => {
        const o = Core.pOutcome(e, m);
        const dup = m.a.every(Boolean) && m.b.every(Boolean) && !!H.met[Core.matchKey(m.a, m.b)];
        out.push({ r, ri, m, mi, o, dup });
      });
    });
    return out;
  }
  function nameCellHTML(e, ids, win, SC) {
    const pm = playerMap(e),
      list = ids.filter(Boolean);
    return `<td class="sh-name ${win ? "sh-winname" : ""}">${win ? `<span class="sh-winmark">勝ち</span>` : ""}${list.map((id) => `<b><button class="plink ${SC.cls(pm[id].school)}" data-action="pplayer" data-id="${id}">${esc(pm[id].name || "(名前なし)")}</button></b>`).join("")}<span class="pschool">${esc(sideSch(e, list))}</span></td>`;
  }
  function sheetHTML(e) {
    const rows = sheetRows(e),
      SC = App.schoolColors(e),
      pm = playerMap(e),
      no = playerNo(e);
    let last = -1;
    const body = rows
      .filter((x) => !ui.q || x.m.a.concat(x.m.b).some((id) => id && App.qMatch(pm[id])))
      .map(({ r, ri, m, mi, o, dup }) => {
        const head =
          ri !== last
            ? ((last = ri),
              `<tr class="sh-round"><td colspan="9">${r.day}日目 ${Core.roundNo(e, ri)}回転目 · ${kindLabel(r)}</td></tr>`)
            : "";
        const gs = m.g.slice(0, e.games).filter((x) => x[0] != null || x[1] != null);
        const sc = gs.length
          ? gs
              .map(
                ([x, y]) =>
                  `<div class="sh-g"><span class="${x > y ? "w" : ""}">${x ?? ""}</span><i>−</i><span class="${y > x ? "w" : ""}">${y ?? ""}</span></div>`
              )
              .join("")
          : o.winner
            ? `<div class="sh-g"><span class="${o.winner === "a" ? "w" : ""}">${o.winner === "a" ? "勝" : "負"}</span><i>−</i><span class="${o.winner === "b" ? "w" : ""}">${o.winner === "b" ? "勝" : "負"}</span></div>`
            : "";
        const lv = (ids) => rankCell(e, ids);
        return `${head}<tr><td class="num">${mi + 1}${dup ? `<small class="sh-dup">かぶり</small>` : ""}</td><td class="num">${Core.roundNo(e, ri)}</td><td class="sh-id num">${idStack(m.a.map((id) => id && no[id]))}</td><td class="num">${lv(m.a)}</td>${nameCellHTML(e, m.a, o.winner === "a", SC)}<td class="sh-sc num">${sc}</td>${nameCellHTML(e, m.b, o.winner === "b", SC)}<td class="num">${lv(m.b)}</td><td class="sh-id num">${idStack(m.b.map((id) => id && no[id]))}</td></tr>`;
      })
      .join("");
    return `    
    <div class="table-wrap"><table class="sheet"><thead><tr><th>試合<br>番号</th><th>回転</th><th class="sh-id">選手<br>番号</th><th>ランク</th><th>選手名<br>学校名</th><th>得点</th><th>選手名<br>学校名</th><th>ランク</th><th class="sh-id">選手<br>番号</th></tr></thead><tbody>${body || `<tr><td colspan="9" class="faint">まだ試合がありません</td></tr>`}</tbody></table></div>`;
  }
  /* 組み合わせごとの成績: 同じ相手(ダブルスは同じペアどうし)の試合を、回転をまたいで1行にまとめる。各回の得点をゲームとして縦に並べ、ゲーム数は勝った数の合計 */
  function mergedRows(e) {
    const map = new Map();
    const need = e.games === 1 ? 1 : 2;
    e.practice.rounds.forEach((r, ri) =>
      r.matches.forEach((m) => {
        const A_ = m.a.filter(Boolean),
          B_ = m.b.filter(Boolean);
        if (!A_.length || !B_.length) return;
        const ka = A_.slice().sort().join("+"),
          kb = B_.slice().sort().join("+"),
          flip = ka > kb,
          key = flip ? `${kb}|${ka}` : `${ka}|${kb}`;
        const row = map.get(key) || {
          a: flip ? B_ : A_,
          b: flip ? A_ : B_,
          lines: [],
          gA: 0,
          gB: 0,
          rounds: [],
          times: 0,
          shown: false,
        };
        const o = Core.pOutcome(e, m);
        const quick = o.winner && !m.g.some((x) => x[0] != null || x[1] != null);
        const lines = quick
          ? [o.winner === "a" ? ["勝", "負"] : ["負", "勝"]]
          : m.g.slice(0, e.games).filter((x) => x[0] != null || x[1] != null);
        lines.forEach(([x, y]) => row.lines.push(flip ? [y, x] : [x, y]));
        if (o.started || o.winner) {
          row.shown = true;
          const ga = quick ? (o.winner === "a" ? need : 0) : o.ga,
            gb = quick ? (o.winner === "b" ? need : 0) : o.gb;
          row.gA += flip ? gb : ga;
          row.gB += flip ? ga : gb;
        }
        row.rounds.push(daysOf(e).length > 1 ? Core.roundTitle(e, ri) : Core.roundNo(e, ri));
        row.times++;
        map.set(key, row);
      })
    );
    return [...map.values()];
  }
  function mergeHTML(e) {
    const rows = mergedRows(e),
      SC = App.schoolColors(e),
      pm = playerMap(e),
      no = playerNo(e);
    const body = rows
      .filter((x) => !ui.q || x.a.concat(x.b).some((id) => App.qMatch(pm[id])))
      .map((x, i) => {
        const wa = x.shown && x.gA > x.gB,
          wb = x.shown && x.gB > x.gA;
        const sc = x.lines
          .map(([a, b]) => {
            const num = typeof a === "number" && typeof b === "number";
            const la = num ? a > b : a === "勝",
              lb = num ? b > a : b === "勝";
            return `<div class="sh-g"><span class="${la ? "w" : ""}">${a ?? ""}</span><i>−</i><span class="${lb ? "w" : ""}">${b ?? ""}</span></div>`;
          })
          .join("");
        return `<tr><td class="num">${i + 1}${x.times > 1 ? `<small class="sh-dup">${x.times}回対戦</small>` : ""}</td><td class="num">${x.rounds.join(daysOf(e).length > 1 ? "<br>" : "・")}</td><td class="sh-id num">${idStack(x.a.map((id) => no[id]))}</td><td class="num">${rankCell(e, x.a)}</td>${nameCellHTML(e, x.a, false, SC)}<td class="sh-gc num ${wa ? "sh-win" : ""}">${x.shown ? x.gA : ""}</td><td class="sh-sc num">${sc}</td><td class="sh-gc num ${wb ? "sh-win" : ""}">${x.shown ? x.gB : ""}</td>${nameCellHTML(e, x.b, false, SC)}<td class="num">${rankCell(e, x.b)}</td><td class="sh-id num">${idStack(x.b.map((id) => no[id]))}</td></tr>`;
      })
      .join("");
    return `<div class="table-wrap"><table class="sheet"><thead><tr><th>番号</th><th>回転</th><th class="sh-id">選手<br>番号</th><th>ランク</th><th>選手名<br>学校名</th><th>ゲーム<br>数</th><th>得点</th><th>ゲーム<br>数</th><th>選手名<br>学校名</th><th>ランク</th><th class="sh-id">選手<br>番号</th></tr></thead><tbody>${body || `<tr><td colspan="11" class="faint">まだ試合がありません</td></tr>`}</tbody></table></div>`;
  }
  function listHTML(e) {
    const st = Core.pStats(e),
      SC = App.schoolColors(e),
      rs = e.practice.rounds,
      maxG = Math.max(0, ...st.rows.map((r) => r.games));
    let rows = st.rows.filter((r) => App.qMatch(r.p));
    const bySch = (a, b) => (a.p.school || "").trim().localeCompare((b.p.school || "").trim(), "ja");
    rows.sort((a, b) => bySch(a, b) || sortIn(a, b));
    function sortIn(a, b) {
      return (
        ui.pSort === "rate"
          ? (a, b) => (b.rate ?? -1) - (a.rate ?? -1) || b.games - a.games
          : ui.pSort === "few"
            ? (a, b) => a.games - b.games || b.p.level - a.p.level
            : (a, b) => b.p.level - a.p.level || a.p.name.localeCompare(b.p.name, "ja")
      )(a, b);
    }
    const few = st.rows.filter((r) => maxG - r.games >= 2).length;
    const pairs = Core.pairStats(e).sort(
      (a, b) =>
        sideSch(e, a.ids).localeCompare(sideSch(e, b.ids), "ja") || (b.rate ?? -1) - (a.rate ?? -1) || b.games - a.games
    );
    return `<div class="row"><div class="seg">${[
      ["level", "ランク順"],
      ["rate", "勝率順"],
      ["few", "試合数の少ない順"],
    ]
      .map(([k, l]) => `<button class="${ui.pSort === k ? "on" : ""}" data-action="psort" data-k="${k}">${l}</button>`)
      .join("")}</div></div>
    ${few ? `<div class="confirm"><b>試合数が少ない人が ${few}人います</b>(最多より2試合以上少ない)。</div>` : ""}
    <div class="table-wrap"><table class="stat-table"><thead><tr><th>選手</th><th>ランク</th><th>試合</th><th>勝</th><th>敗</th><th>勝率</th>${st.days.map((d) => `<th>${d}日目</th>`).join("")}${rs.map((r, i) => `<th>${st.days.length > 1 ? `<small>${r.day}日目</small><br>` : ""}${Core.roundNo(e, i)}</th>`).join("")}</tr></thead><tbody>${rows
      .map((r, i) => {
        const sk = (r.p.school || "").trim(),
          head =
            i === 0 || sk !== (rows[i - 1].p.school || "").trim()
              ? `<tr class="school-head ${SC.cls(r.p.school)}"><td colspan="${6 + st.days.length + rs.length}"><b>${esc(sk || "学校なし")}</b> <span class="faint">${rows.filter((x) => (x.p.school || "").trim() === sk).length}人</span></td></tr>`
              : "";
        return `${head}<tr class="sch-row ${SC.cls(r.p.school)}"><td class="c-name"><button class="plink" data-action="pplayer" data-id="${r.p.id}">${esc(r.p.name)}</button><span class="pschool">${esc(r.p.school)}</span></td><td class="num">${r.p.level}</td><td class="num">${r.games}</td><td class="num">${r.w}</td><td class="num">${r.l}</td><td class="num">${r.rate == null ? "—" : r.rate + "%"}</td>${st.days.map((d) => `<td class="num">${r.day[d].rate == null ? "—" : r.day[d].rate + "%"}${r.day[d].delta != null ? `<span class="pdelta ${r.day[d].delta > 0 ? "up" : r.day[d].delta < 0 ? "down" : ""}">${r.day[d].delta > 0 ? "+" : ""}${r.day[d].delta}</span>` : ""}</td>`).join("")}${r.byR.map((b) => `<td style="text-align:center">${b === "play" ? "●" : b === "rest" ? "休" : "未"}</td>`).join("")}</tr>`;
      })
      .join("")}</tbody></table></div>
    ${
      pairs.length
        ? `<h3 style="margin-top:8px">ペアごとの成績</h3><div class="table-wrap"><table class="stat-table"><thead><tr><th>ペア</th><th>試合</th><th>勝</th><th>敗</th><th>勝率</th></tr></thead><tbody>${pairs
            .map((p, i) => {
              const sk = sideSch(e, p.ids),
                one = playerMap(e)[p.ids[0]],
                head =
                  i === 0 || sk !== sideSch(e, pairs[i - 1].ids)
                    ? `<tr class="school-head ${sk.includes("・") ? "" : SC.cls(one && one.school)}"><td colspan="5"><b>${esc(sk || "学校なし")}</b> <span class="faint">${pairs.filter((x) => sideSch(e, x.ids) === sk).length}組</span></td></tr>`
                    : "";
              return `${head}<tr class="sch-row ${sk.includes("・") ? "" : SC.cls(one && one.school)}"><td class="c-name">${esc(sideTxt(e, p.ids))}<span class="pschool">${esc(sideSch(e, p.ids))}</span></td><td class="num">${p.games}</td><td class="num">${p.w}</td><td class="num">${p.l}</td><td class="num">${p.rate == null ? "—" : p.rate + "%"}</td></tr>`;
            })
            .join("")}</tbody></table></div>`
        : ""
    }`;
  }
  /* ---------- 成績(画面用) ----------
   「対戦」の画面と同じ見た目:回転ごと・学校ごとのカード、①の番号、種目の印、名前と点数の並び。
   紙の形(sheetHTML / listHTML / mergeHTML)は、PDFで保存のときに使う */
  const gameLines = (e, m, flip) =>
    m.g
      .slice(0, e.games)
      .filter((x) => x[0] != null || x[1] != null)
      .map(([x, y]) => (flip ? [y, x] : [x, y]));
  function stSideHTML(e, ids, SC, no, cls, meta) {
    const pm = playerMap(e),
      list = ids.filter((id) => id && pm[id]);
    const one = list.length && !sideSch(e, list).includes("・") ? pm[list[0]] : null;
    return `<div class="st-side ${cls} ${one ? SC.cls(one.school) : ""}"><div class="st-names">${list.map((id) => `<button class="plink" data-action="pplayer" data-id="${id}">${esc(pm[id].name || "(名前なし)")}</button>`).join(`<i>・</i>`) || `<span class="faint">(空き)</span>`}</div><span class="st-meta">${esc(sideSch(e, list))}${list.length ? `<span class="st-extra"> · No.${list.map((id) => no[id]).join("・")} · ランク${rankCell(e, list)}</span>` : ""}${meta || ""}</span></div>`;
  }
  function stScoreHTML(ga, gb, lines, state) {
    const big =
      state === "none"
        ? `<b class="st-none">—</b>`
        : `<b><span class="${state === "a" ? "w" : ""}">${ga}</span><i>−</i><span class="${state === "b" ? "w" : ""}">${gb}</span></b>`;
    const small = lines
      .map(([x, y]) => {
        return `<span>${x ?? ""}<i>-</i>${y ?? ""}</span>`;
      })
      .join("");
    return `<div class="st-score ${state === "live" ? "is-live" : ""}">${big}${state === "live" ? `<em>試合中</em>` : ""}${small ? `<small>${small}</small>` : ""}</div>`;
  }
  function stDayTabs(e) {
    const days = daysOf(e);
    if (days.length < 2) return "";
    const sd = days.includes(ui.sDay) ? ui.sDay : "all";
    return `<div class="day-tabs" role="tablist" aria-label="日の切り替え">${[["all", "全日程", e.practice.rounds.length], ...days.map((d) => [d, `${d}日目`, e.practice.rounds.filter((r) => r.day === d).length])].map(([d, l, n]) => `<button role="tab" aria-selected="${sd === d}" class="day-tab ${sd === d ? "on" : ""}" data-action="sday" data-d="${d}">${l}<small>${n}回転</small></button>`).join("")}</div>`;
  }
  function sheetViewHTML(e) {
    const SC = App.schoolColors(e),
      pm = playerMap(e),
      no = playerNo(e),
      days = daysOf(e),
      sd = days.includes(ui.sDay) ? ui.sDay : "all";
    const cards = e.practice.rounds
      .map((r, ri) => {
        if (sd !== "all" && r.day !== sd) return "";
        const H = Core.pHistory(e, ri);
        const rows = r.matches
          .map((m, mi) => {
            if (ui.q && !m.a.concat(m.b).some((id) => id && pm[id] && App.qMatch(pm[id]))) return "";
            const o = Core.pOutcome(e, m),
              dbl = m.a.length === 2 || m.b.length === 2,
              live = !o.winner && isLive(o);
            const dup = m.a.every(Boolean) && m.b.every(Boolean) && !!H.met[Core.matchKey(m.a, m.b)];
            const quick = o.winner && !m.g.some((x) => x[0] != null || x[1] != null),
              need = e.games === 1 ? 1 : 2;
            const ga = quick ? (o.winner === "a" ? need : 0) : o.ga || 0,
              gb = quick ? (o.winner === "b" ? need : 0) : o.gb || 0;
            const state = o.winner || (live ? "live" : o.started ? "live" : "none");
            return `<div class="st-row ${o.winner ? "is-done" : live ? "is-live" : ""}"><span class="st-no">${CIRC[mi] || mi + 1}</span><span class="st-kind"><span class="kind ${dbl ? "k-dbl" : "k-sgl"}">${dbl ? "ダブルス" : "シングルス"}</span>${dup ? `<span class="chip" style="background:var(--arc-2-soft);color:var(--arc-2)">かぶり</span>` : ""}</span>${stSideHTML(e, m.a, SC, no, `a ${o.winner === "a" ? "win" : ""}`, o.winner === "a" ? `<span class="st-win">勝ち</span>` : "")}${stScoreHTML(ga, gb, gameLines(e, m), state)}${stSideHTML(e, m.b, SC, no, `b ${o.winner === "b" ? "win" : ""}`, o.winner === "b" ? `<span class="st-win">勝ち</span>` : "")}</div>`;
          })
          .join("");
        if (!rows) return "";
        const done = r.matches.filter((m) => Core.pOutcome(e, m).winner).length;
        return `<section class="card st-card"><div class="card-head"><div><h2>${Core.roundNo(e, ri)}回転目</h2><p class="faint">${days.length > 1 ? `${r.day}日目 · ` : ""}${kindLabel(r)} · ${r.matches.length}試合 · ${done}/${r.matches.length} 終了</p></div>${done === r.matches.length && r.matches.length ? `<span class="chip chip-ok">全試合終了</span>` : ""}</div><div class="st-list">${rows}</div></section>`;
      })
      .join("");
    return `${stDayTabs(e)}${cards || `<section class="card"><p class="faint" style="margin:0">${ui.q ? "見つかりませんでした" : "まだ試合がありません"}</p></section>`}`;
  }
  function mergeViewHTML(e) {
    const rows = mergedRows(e),
      SC = App.schoolColors(e),
      pm = playerMap(e),
      no = playerNo(e);
    const body = rows
      .filter((x) => !ui.q || x.a.concat(x.b).some((id) => pm[id] && App.qMatch(pm[id])))
      .map((x, i) => {
        const st = !x.shown ? "none" : x.gA > x.gB ? "a" : x.gB > x.gA ? "b" : "even";
        const dbl = x.a.length === 2 || x.b.length === 2;
        return `<div class="st-row"><span class="st-no">${CIRC[i] || i + 1}</span><span class="st-kind"><span class="kind ${dbl ? "k-dbl" : "k-sgl"}">${dbl ? "ダブルス" : "シングルス"}</span>${x.times > 1 ? `<span class="chip chip-live">${x.times}回対戦</span>` : ""}<span class="st-rounds">${x.rounds.join("・")}${daysOf(e).length > 1 ? "" : "回転目"}</span></span>${stSideHTML(e, x.a, SC, no, `a ${st === "a" ? "win" : ""}`)}${stScoreHTML(x.gA, x.gB, x.lines, st === "even" ? "x" : st)}${stSideHTML(e, x.b, SC, no, `b ${st === "b" ? "win" : ""}`)}</div>`;
      })
      .join("");
    return `<section class="card st-card"><div class="card-head"><div><h2>組み合わせごとの成績</h2></div></div><div class="st-list">${body || `<p class="faint" style="margin:0">${ui.q ? "見つかりませんでした" : "まだ試合がありません"}</p>`}</div></section>`;
  }
  function rateBar(rate) {
    return `<span class="st-rate"><b>${rate == null ? "—" : rate + "%"}</b><span class="st-bar"><i style="width:${rate || 0}%"></i></span></span>`;
  }
  function listViewHTML(e) {
    const st = Core.pStats(e),
      SC = App.schoolColors(e),
      rs = e.practice.rounds,
      maxG = Math.max(0, ...st.rows.map((r) => r.games));
    const sortIn =
      ui.pSort === "rate"
        ? (a, b) => (b.rate ?? -1) - (a.rate ?? -1) || b.games - a.games
        : ui.pSort === "few"
          ? (a, b) => a.games - b.games || b.p.level - a.p.level
          : (a, b) => b.p.level - a.p.level || a.p.name.localeCompare(b.p.name, "ja");
    const rows = st.rows.filter((r) => App.qMatch(r.p));
    const schools = [...new Set(rows.map((r) => (r.p.school || "").trim()))].sort((a, b) => a.localeCompare(b, "ja"));
    const few = st.rows.filter((r) => maxG - r.games >= 2).length;
    const dots = (r) =>
      `<span class="st-dots">${r.byR.map((b, i) => `<i class="${b}" title="${Core.roundTitle(e, i)}:${b === "play" ? "出場" : b === "rest" ? "休み" : "未"}">${b === "play" ? "" : b === "rest" ? "休" : ""}</i>`).join("")}</span>`;
    const dayTxt = (r) =>
      st.days.length > 1
        ? `<span class="st-days">${st.days.map((d) => `${d}日目 ${r.day[d].rate == null ? "—" : r.day[d].rate + "%"}${r.day[d].delta != null && r.day[d].delta !== 0 ? `<em class="${r.day[d].delta > 0 ? "up" : "down"}">${r.day[d].delta > 0 ? "+" : ""}${r.day[d].delta}</em>` : ""}`).join("　")}</span>`
        : "";
    const cards = schools
      .map((sk) => {
        const list = rows.filter((r) => (r.p.school || "").trim() === sk).sort(sortIn);
        const g = list.reduce((t, r) => t + r.w + r.l, 0),
          w = list.reduce((t, r) => t + r.w, 0);
        return `<section class="card st-card st-school ${SC.cls(sk)}"><div class="card-head"><div><h2>${esc(sk || "学校なし")}</h2><p class="faint">${list.length}人 · ${w}勝${g - w}敗${g ? ` · 勝率 ${Math.round((w / g) * 100)}%` : ""}</p></div></div>
      <div class="st-plist" style="--nr:${rs.length}"><div class="st-phead"><span>選手</span><span>ランク</span><span>試合</span><span>勝敗</span><span>勝率</span><span>出場</span></div>
      ${list.map((r) => `<div class="st-prow ${maxG - r.games >= 2 ? "is-few" : ""}"><span class="st-pname"><button class="plink" data-action="pplayer" data-id="${r.p.id}">${esc(r.p.name)}</button>${dayTxt(r)}</span><span class="st-lv">${App.levelBar(r.p.level)}</span><span class="st-games"><b>${r.games}</b>試合</span><span class="st-wl">${r.w}勝${r.l}敗</span>${rateBar(r.rate)}${dots(r)}</div>`).join("")}</div></section>`;
      })
      .join("");
    const pairs = Core.pairStats(e)
      .filter((p) => !ui.q || p.ids.some((id) => playerMap(e)[id] && App.qMatch(playerMap(e)[id])))
      .sort(
        (a, b) =>
          sideSch(e, a.ids).localeCompare(sideSch(e, b.ids), "ja") ||
          (b.rate ?? -1) - (a.rate ?? -1) ||
          b.games - a.games
      );
    const pairCard = pairs.length
      ? `<section class="card st-card"><div class="card-head"><div><h2>ペアごとの成績</h2><p class="faint">${pairs.length}組</p></div></div><div class="st-plist st-pairs"><div class="st-phead"><span>ペア</span><span>試合</span><span>勝敗</span><span>勝率</span></div>${pairs
          .map((p) => {
            const one = playerMap(e)[p.ids[0]],
              sk = sideSch(e, p.ids);
            return `<div class="st-prow ${sk.includes("・") ? "" : SC.cls(one && one.school)}"><span class="st-pname">${p.ids.map((id) => `<button class="plink" data-action="pplayer" data-id="${id}">${esc(pn(e, id))}</button>`).join("・")}<span class="pschool">${esc(sk)}</span></span><span class="st-games"><b>${p.games}</b>試合</span><span class="st-wl">${p.w}勝${p.l}敗</span>${rateBar(p.rate)}</div>`;
          })
          .join("")}</div></section>`
      : "";
    return `${few ? `<div class="confirm"><b>試合数が少ない人が ${few}人います</b>(最多より2試合以上少ない人は、行がオレンジです)。</div>` : ""}${cards || `<section class="card"><p class="faint" style="margin:0">見つかりませんでした</p></section>`}${pairCard}`;
  }
  function pstatsHTML(e) {
    if (!e.practice.rounds.length)
      return `<section class="card empty"><h2>まだ回転がありません</h2><p class="muted">「対戦」のタブで回転を作ると、ここに成績が出ます。</p><button class="btn btn-primary" data-action="tab" data-tab="rounds">対戦へ</button></section>`;
    const SC = App.schoolColors(e),
      views = [
        ["list", "個人・ペア"],
        ["sheet", "対戦結果"],
        ["merge", "組み合わせ"],
      ];
    const body = ui.pView === "sheet" ? sheetViewHTML(e) : ui.pView === "merge" ? mergeViewHTML(e) : listViewHTML(e);
    return `<section class="card stack"><div class="card-head" style="margin:0"><div><h2>成績</h2></div><button class="btn btn-secondary btn-sm" data-action="print-practice">PDFで保存</button></div>
    <div class="view-switch seg" style="align-self:flex-start">${views.map(([k, l]) => `<button class="${ui.pView === k ? "on" : ""}" data-action="pview" data-view="${k}">${l}</button>`).join("")}</div>
    <div class="qbox"><input class="input" id="q" type="search" data-input="q" value="${esc(ui.q)}" placeholder="名前・学校で探す" autocomplete="off">${ui.q ? `<button class="btn btn-ghost btn-sm" data-action="qclear">消す</button>` : ""}</div>
    ${
      ui.pView === "list"
        ? `<div class="row"><span class="faint">並び順</span><div class="seg">${[
            ["level", "ランク順"],
            ["rate", "勝率順"],
            ["few", "試合数の少ない順"],
          ]
            .map(
              ([k, l]) =>
                `<button class="${ui.pSort === k ? "on" : ""}" data-action="psort" data-k="${k}">${l}</button>`
            )
            .join("")}</div></div>`
        : ""
    }
    ${SC.list.length > 1 ? `<div class="school-legend">${SC.list.map((s) => `<span class="chip ${SC.cls(s)}">${esc(s)} ${e.players.filter((p) => (p.school || "").trim() === s).length}人</span>`).join("")}</div>` : ""}</section>
    <div id="pstats-body" class="stack">${body}</div>${ui.pPlayer ? playerPageHTML(e, ui.pPlayer) : ""}`;
  }
  App.playerPageHTML = playerPageHTML;
  App.views.pstats = pstatsHTML;

  /* ---------- 操作 ---------- */
  Object.assign(A, {
    pview: (b) => {
      ui.pView = b.dataset.view;
      render();
    },
    sday: (b) => {
      const d = b.dataset.d;
      ui.sDay = d === "all" ? "all" : Number(d);
      render();
    },
    psort: (b) => {
      ui.pSort = b.dataset.k;
      render();
    },
    "print-practice": () => App.doPrint(),
  });

  /* ============ 印刷(トーナメントの組み合わせ表 / 練習試合の成績) ============ */
  function fillPrint() {
    const area = $("#print-area"),
      e = ev();
    let html = "";
    if (e && ui.view !== "home") {
      if (e.mode === "tournament" && ui.tab === "bracket") {
        const st = Core.bracketState(e);
        if (st) html = App.printSheetSVG(e, st);
      } else if (e.mode === "practice" && ui.tab === "pstats" && e.practice.rounds.length) {
        const box = document.createElement("div");
        box.innerHTML = `<div id="x">${ui.pView === "sheet" ? sheetHTML(e) : ui.pView === "merge" ? mergeHTML(e) : listHTML(e)}</div>`;
        box.querySelectorAll("button:not(.plink), select, .seg, .row").forEach((n) => n.remove());
        html = `<div class="pp"><div class="pp-head"><b>${esc(e.name)}</b><span>${esc(e.date || "")}</span></div>${box.innerHTML}</div>`;
      }
    }
    area.innerHTML = html;
    document.body.classList.toggle("has-print", !!html);
  }
  App.doPrint = () => {
    if (window.claude && typeof window.claude.use === "function") {
      toast("claude.ai の中では印刷・PDF保存ができません。公開ページで開いて保存してください");
      return;
    }
    fillPrint();
    try {
      window.print();
    } catch (x) {
      toast("印刷の画面を開けませんでした");
    }
  };
  addEventListener("beforeprint", fillPrint);
  addEventListener("afterprint", () => document.body.classList.remove("has-print"));
})();
