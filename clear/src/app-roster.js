/* ============================================================
   スマッチ 画面 (app-roster) — 部員名簿(自分の学校の選手の台帳)
   - 1人ずつ:名前・学校・学年・ランク・顔写真・メモ
   - 出場履歴と成績:作った練習試合などから、名簿の人(rid でつながる)を集める
   - スポーツテスト:項目は先生が決める(名前・単位・大きいほど良いか)。測定日ごとに記録
   - 練習試合の「選手」の画面から、名簿の人をまとめて入れられる
   保存は events とは別の入れ物(roster コレクション、1件 = main)
   ============================================================ */
(() => {
  "use strict";
  const { clamp, uid, today } = Core;
  const { esc, $ } = App;
  const ui = App.ui,
    A = App.A,
    Ch = App.Ch,
    F = App.F;
  const toast = (m) => App.toast(m),
    render = () => App.render();
  const GRADES = ["", "中1", "中2", "中3", "高1", "高2", "高3"];
  const gradeTxt = (g) => GRADES[g] || "";
  const isGuest = () => !!(App.isGuest && App.isGuest());

  /* ============ 保存 ============ */
  const blank = () => ({ id: "main", v: 1, school: "", players: [], testItems: [], tests: [], updatedAt: 0 });
  function norm(r) {
    const x = Object.assign(blank(), r || {});
    x.players = (Array.isArray(x.players) ? x.players : [])
      .filter((p) => p && p.id)
      .map((p) => ({
        id: String(p.id),
        name: String(p.name || ""),
        school: String(p.school || ""),
        grade: clamp(parseInt(p.grade, 10) || 0, 0, 6),
        level: clamp(parseInt(p.level, 10) || 3, 1, 5),
        photo: typeof p.photo === "string" && p.photo.startsWith("data:image/") ? p.photo : "",
        note: String(p.note || ""),
        active: p.active !== false,
        createdAt: p.createdAt || Date.now(),
      }));
    x.testItems = (Array.isArray(x.testItems) ? x.testItems : [])
      .filter((t) => t && t.id)
      .map((t) => ({
        id: String(t.id),
        name: String(t.name || ""),
        unit: String(t.unit || ""),
        better: t.better === "low" ? "low" : "high",
      }));
    x.tests = (Array.isArray(x.tests) ? x.tests : [])
      .filter((t) => t && t.id)
      .map((t) => ({
        id: String(t.id),
        date: String(t.date || ""),
        values: t.values && typeof t.values === "object" ? t.values : {},
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return x;
  }
  let roster = blank(),
    loaded = false,
    saveTimer = null;
  const Roster = (App.Roster = {
    get: () => roster,
    lsKey() {
      return (App.Store.lsKey || "arca-league-v1") + "#roster";
    },
    async load() {
      const S = App.Store;
      try {
        roster = norm(JSON.parse(localStorage.getItem(this.lsKey()) || "null"));
      } catch (e) {
        roster = blank();
      }
      if (S.db) {
        try {
          const d = await S.db.collection("roster").doc("main").get();
          if (d.exists) {
            const r = norm(d.data());
            if ((r.updatedAt || 0) >= (roster.updatedAt || 0)) roster = r;
          }
        } catch (e) {
          /* 表がまだ無いときなど:この端末の控えで続ける */
        }
      }
      loaded = true;
    },
    save() {
      roster.updatedAt = Date.now();
      try {
        localStorage.setItem(this.lsKey(), JSON.stringify(roster));
      } catch (e) {
        toast("この端末の保存がいっぱいです。写真を減らしてください");
      }
      const S = App.Store;
      if (!S.db) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        try {
          await S.db
            .collection("roster")
            .doc("main")
            .set(JSON.parse(JSON.stringify(roster)));
        } catch (e) {
          toast("名簿をオンラインに保存できませんでした。この端末には残っています");
        }
      }, 700);
    },
  });
  const rp = (id) => roster.players.find((p) => p.id === id);
  const activePlayers = () =>
    roster.players
      .filter((p) => p.active)
      .sort((a, b) => b.grade - a.grade || b.level - a.level || a.name.localeCompare(b.name, "ja"));

  /* ============ 出場履歴・成績(作ったものから集める) ============ */
  const MODE = { practice: "練習試合", league: "リーグ戦", tournament: "トーナメント" };
  function historyOf(rid) {
    const out = [];
    Object.values(App.events()).forEach((e) => {
      const p = (e.players || []).find((x) => x.rid === rid);
      if (!p) return;
      let games = 0,
        w = 0,
        l = 0;
      if (e.mode === "practice" && e.practice && e.practice.rounds.length) {
        const row = Core.pStats(e).rows.find((x) => x.p.id === p.id);
        if (row) ({ games, w, l } = row);
      }
      out.push({ e, p, games, w, l, rate: w + l ? Math.round((w / (w + l)) * 100) : null });
    });
    return out.sort(
      (a, b) => (b.e.date || "").localeCompare(a.e.date || "") || (b.e.updatedAt || 0) - (a.e.updatedAt || 0)
    );
  }
  function totalOf(rid) {
    const h = historyOf(rid);
    const g = h.reduce((t, x) => t + x.games, 0),
      w = h.reduce((t, x) => t + x.w, 0),
      l = h.reduce((t, x) => t + x.l, 0);
    return { h, events: h.length, games: g, w, l, rate: w + l ? Math.round((w / (w + l)) * 100) : null };
  }

  /* ============ 写真(小さくしてから保存する) ============ */
  function shrinkPhoto(file) {
    return new Promise((resolve, reject) => {
      const img = new Image(),
        url = URL.createObjectURL(file);
      img.onload = () => {
        const S = 200,
          c = document.createElement("canvas");
        c.width = c.height = S;
        const s = Math.min(img.width, img.height),
          sx = (img.width - s) / 2,
          sy = (img.height - s) / 2;
        c.getContext("2d").drawImage(img, sx, sy, s, s, 0, 0, S, S);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("img"));
      };
      img.src = url;
    });
  }
  const avatar = (p, size = 56) =>
    p.photo
      ? `<img class="rs-ava" src="${p.photo}" width="${size}" height="${size}" alt="" style="width:${size}px;height:${size}px">`
      : `<span class="rs-ava rs-ava-none" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.42)}px" aria-hidden="true">${esc((p.name || "?").trim().charAt(0))}</span>`;

  /* ============ はじめの画面の入口 ============ */
  App.rosterHomeCard = () => {
    if (isGuest())
      return `<section class="card rs-home"><h3 style="margin:0">部員名簿</h3><p class="faint" style="margin:4px 0 0">ログインすると使えます。</p></section>`;
    const n = activePlayers().length;
    return `<button class="card rs-home rs-home-btn" data-action="roster-open"><span class="rs-home-ico" aria-hidden="true">👥</span><span><b>部員名簿</b>${n ? `<span class="faint">${n}人</span>` : ""}</span><span class="rs-home-go">›</span></button>`;
  };

  /* ============ 名簿の画面 ============ */
  function rosterHTML() {
    if (isGuest())
      return `<section class="card stack"><h2>部員名簿</h2><p class="muted">部員名簿は、ログインすると使えます。</p><div class="row"><button class="btn btn-primary" data-action="go-login">ログイン・新規登録</button></div></section>`;
    if (!loaded) return `<div class="loading">名簿を読み込み中…</div>`;
    const tab = ui.rsTab || "players";
    return `<div class="rs-top"><button class="back-btn" data-action="home"><span>‹</span>はじめの画面</button><h2 class="rs-title">部員名簿</h2></div>
    <div class="tabs seg" role="tablist" style="align-self:flex-start;margin-bottom:14px"><button class="${tab === "players" ? "on" : ""}" data-action="rs-tab" data-k="players">部員</button><button class="${tab === "tests" ? "on" : ""}" data-action="rs-tab" data-k="tests">スポーツテスト</button></div>
    ${tab === "tests" ? testsHTML() : playersListHTML()}${ui.rsPlayer && rp(ui.rsPlayer) ? playerCardHTML(rp(ui.rsPlayer)) : ""}`;
  }
  function playersListHTML() {
    const list = activePlayers(),
      old = roster.players.filter((p) => !p.active);
    const q = (ui.rsQ || "").trim();
    const shown = q ? list.filter((p) => p.name.includes(q) || p.school.includes(q)) : list;
    return `<section class="card stack"><div class="card-head" style="margin:0"><div><h2>部員を登録する</h2></div></div>
    <form class="add-form" data-form="rs-add"><label class="field"><span>名前</span><input class="input" name="name" id="rs-name" maxlength="30" autocomplete="off" required></label>
      <label class="field"><span>学校</span><input class="input" name="school" maxlength="30" autocomplete="off" value="${esc(roster.school)}"></label>
      <label class="field"><span>学年</span><select class="select" name="grade">${GRADES.map((g, i) => `<option value="${i}" ${i === (ui.rsGrade || 0) ? "selected" : ""}>${i ? g : "—"}</option>`).join("")}</select></label>
      <div class="field"><span>ランク</span>${App.levelPicker(`data-action="rs-new-level"`, ui.rsLevel || 3)}</div><button class="btn btn-primary" type="submit">登録</button></form></section>
    <section class="card stack"><div class="card-head" style="margin:0"><div><h2>部員 ${list.length}人</h2></div></div>
      ${list.length > 6 ? `<div class="qbox"><input class="input" type="search" data-change="rs-q" value="${esc(q)}" placeholder="名前・学校で探す"></div>` : ""}
      ${
        shown.length
          ? `<div class="rs-grid">${shown
              .map((p) => {
                const t = totalOf(p.id);
                return `<button class="rs-card" data-action="rs-player" data-id="${p.id}">${avatar(p, 64)}<span class="rs-card-body"><b>${esc(p.name)}</b><span class="faint">${esc([gradeTxt(p.grade), p.school].filter(Boolean).join(" · "))}</span><span class="rs-card-stats">${App.levelBar(p.level)}<span>${t.events}回出場</span><span>${t.games ? `${t.w}勝${t.l}敗` : "試合なし"}</span></span></span></button>`;
              })
              .join("")}</div>`
          : `<p class="faint" style="margin:0">${q ? "見つかりませんでした" : "まだ誰もいません。上から登録してください。"}</p>`
      }
      ${old.length ? `<details class="more"><summary>引退・休部の人(${old.length}人)</summary><div class="rs-grid" style="margin-top:10px">${old.map((p) => `<button class="rs-card is-old" data-action="rs-player" data-id="${p.id}">${avatar(p, 48)}<span class="rs-card-body"><b>${esc(p.name)}</b><span class="faint">${esc([gradeTxt(p.grade), p.school].filter(Boolean).join(" · "))}</span></span></button>`).join("")}</div></details>` : ""}</section>`;
  }

  /* ---------- 1人のカルテ ---------- */
  function playerCardHTML(p) {
    const t = totalOf(p.id),
      last = t.h[0];
    const tests = roster.tests.filter(
      (x) => x.values[p.id] && Object.values(x.values[p.id]).some((v) => v !== "" && v != null)
    );
    return `<div class="modal-bg" data-action="rs-close-bg"><div class="modal stack rs-modal">
    <div class="rs-head">${avatar(p, 96)}<div class="rs-head-body"><h2 style="margin:0">${esc(p.name)}</h2><p class="faint" style="margin:2px 0 8px">${esc([gradeTxt(p.grade), p.school].filter(Boolean).join(" · ")) || "学年・学校は未設定"}</p>
      <div class="row"><label class="btn btn-secondary btn-sm rs-photo-btn">${p.photo ? "写真を変える" : "顔写真を入れる"}<input type="file" accept="image/*" data-change="rs-photo" data-id="${p.id}" hidden></label>${p.photo ? `<button class="btn btn-ghost btn-sm" data-action="rs-photo-del" data-id="${p.id}">写真を消す</button>` : ""}</div></div>
      <button class="btn btn-ghost btn-sm" data-action="rs-close" style="align-self:flex-start">閉じる</button></div>
    <div class="rs-stats"><div><b>${t.events}</b><span>出場</span></div><div><b>${t.games}</b><span>試合</span></div><div><b>${t.w}<small>勝</small>${t.l}<small>敗</small></b><span>勝敗</span></div><div><b>${t.rate == null ? "—" : t.rate + "%"}</b><span>勝率</span></div></div>
    ${last ? `<div class="rs-last"><span class="chip chip-live">前回</span> <b>${esc(last.e.name)}</b> <span class="faint">${esc(last.e.date || "")} · ${MODE[last.e.mode] || ""}</span> ${last.games ? `<span class="rs-last-res">${last.games}試合 ${last.w}勝${last.l}敗${last.rate != null ? `(${last.rate}%)` : ""}</span>` : ""}</div>` : ""}
    <details class="more" ${ui.rsEdit ? "open" : ""}><summary>名前・学年・ランク・メモを直す</summary><form class="stack" data-form="rs-edit" data-id="${p.id}" style="margin-top:10px">
      <div class="add-form"><label class="field"><span>名前</span><input class="input" name="name" maxlength="30" value="${esc(p.name)}" required></label><label class="field"><span>学校</span><input class="input" name="school" maxlength="30" value="${esc(p.school)}"></label>
      <label class="field"><span>学年</span><select class="select" name="grade">${GRADES.map((g, i) => `<option value="${i}" ${i === p.grade ? "selected" : ""}>${i ? g : "—"}</option>`).join("")}</select></label></div>
      <div class="field"><span>ランク</span>${App.levelPicker(`data-action="rs-level" data-id="${p.id}"`, p.level)}</div>
      <label class="field"><span>メモ(得意なショット・課題・けがなど)</span><textarea class="input" name="note" rows="3" maxlength="1000">${esc(p.note)}</textarea></label>
      <div class="row"><button class="btn btn-primary btn-sm" type="submit">保存</button><button type="button" class="btn btn-ghost btn-sm" data-action="rs-active" data-id="${p.id}">${p.active ? "引退・休部にする" : "部員に戻す"}</button><button type="button" class="btn btn-del btn-sm" data-action="rs-del" data-id="${p.id}">名簿から消す</button></div></form></details>
    ${p.note ? `<div class="rs-note"><b>メモ</b><p>${esc(p.note).replace(/\n/g, "<br>")}</p></div>` : ""}
    <h3 style="margin:6px 0 0">出場履歴</h3>
    ${t.h.length ? `<div class="rs-hist">${t.h.map((x) => `<button class="rs-hrow" data-action="rs-open-event" data-id="${x.e.id}"><span class="rs-hdate">${esc(x.e.date || "")}</span><span class="rs-hname"><b>${esc(x.e.name)}</b><span class="faint">${MODE[x.e.mode] || ""}</span></span><span class="rs-hres">${x.games ? `${x.games}試合 <b>${x.w}勝${x.l}敗</b>` : `<span class="faint">出場</span>`}</span></button>`).join("")}</div>` : `<p class="faint" style="margin:0">まだ出場がありません。練習試合の「選手」の画面で「名簿から入れる」を使うと、ここに出ます。</p>`}
    <h3 style="margin:6px 0 0">スポーツテスト</h3>
    ${
      roster.testItems.length && tests.length
        ? `<div class="table-wrap"><table class="rs-ttable"><thead><tr><th>測定日</th>${roster.testItems.map((it) => `<th>${esc(it.name)}${it.unit ? `<small>(${esc(it.unit)})</small>` : ""}</th>`).join("")}</tr></thead><tbody>${tests
            .map(
              (x) =>
                `<tr><td>${esc(x.date)}</td>${roster.testItems
                  .map((it) => {
                    const v = (x.values[p.id] || {})[it.id];
                    return `<td class="num">${v === "" || v == null ? "—" : esc(v)}</td>`;
                  })
                  .join("")}</tr>`
            )
            .join("")}</tbody></table></div>`
        : `<p class="faint" style="margin:0">まだ記録がありません。「スポーツテスト」のタブで、項目と測定日を作って入れてください。</p>`
    }
  </div></div>`;
  }

  /* ---------- スポーツテスト ---------- */
  function testsHTML() {
    const items = roster.testItems,
      tests = roster.tests,
      list = activePlayers();
    const cur = tests.find((x) => x.id === ui.rsTest) || tests[tests.length - 1];
    const itemsCard = `<section class="card stack"><div class="card-head" style="margin:0"><div><h2>測る項目</h2></div></div>
    ${items.length ? `<div class="rs-items">${items.map((it, i) => `<div class="rs-item"><b>${esc(it.name)}</b><span class="faint">${it.unit ? esc(it.unit) + " · " : ""}${it.better === "low" ? "小さいほど良い" : "大きいほど良い"}</span><span class="rs-item-ops"><button class="icon-btn" data-action="rs-item-mv" data-i="${i}" data-d="-1" aria-label="上へ" ${i ? "" : "disabled"}>▲</button><button class="icon-btn" data-action="rs-item-mv" data-i="${i}" data-d="1" aria-label="下へ" ${i < items.length - 1 ? "" : "disabled"}>▼</button><button class="icon-btn" data-action="rs-item-del" data-id="${it.id}" aria-label="${esc(it.name)}を消す">×</button></span></div>`).join("")}</div>` : `<p class="faint" style="margin:0">まだ項目がありません。</p>`}
    <form class="add-form" data-form="rs-item-add"><label class="field"><span>項目名</span><input class="input" name="name" maxlength="30" placeholder="例:50m走" required></label><label class="field"><span>単位</span><input class="input" name="unit" maxlength="10" placeholder="例:秒"></label>
      <label class="field"><span>良いのは</span><select class="select" name="better"><option value="high">大きいほど良い</option><option value="low">小さいほど良い</option></select></label><button class="btn btn-secondary" type="submit">項目を足す</button></form></section>`;
    if (!items.length) return itemsCard;
    const dates = `<div class="day-tabs" role="tablist" aria-label="測定日">${tests.map((x) => `<span class="day-wrap"><button class="day-tab ${cur && cur.id === x.id ? "on" : ""}" data-action="rs-test-sel" data-id="${x.id}">${esc(x.date.slice(5).replace("-", "/") || "日付なし")}<small>${esc(x.date.slice(0, 4))}</small></button></span>`).join("")}<button class="day-add" data-action="rs-test-add" aria-label="測定日を足す" title="測定日を足す">＋</button></div>`;
    const best = {};
    if (cur)
      items.forEach((it) => {
        const vs = list.map((p) => parseFloat((cur.values[p.id] || {})[it.id])).filter((v) => !isNaN(v));
        if (vs.length) best[it.id] = it.better === "low" ? Math.min(...vs) : Math.max(...vs);
      });
    const grid = cur
      ? `<section class="card stack"><div class="card-head" style="margin:0"><div><h2>記録</h2><p class="faint">測定日 <input class="input rs-date" type="date" data-change="rs-test-date" data-id="${cur.id}" value="${esc(cur.date)}"> · 数字を入れると自動で保存します。いちばん良い記録は色がつきます。</p></div><button class="btn btn-ghost btn-sm" data-action="rs-test-del" data-id="${cur.id}">この測定日を消す</button></div>
    ${
      list.length
        ? `<div class="table-wrap"><table class="rs-ttable rs-tinput"><thead><tr><th>部員</th>${items.map((it) => `<th>${esc(it.name)}${it.unit ? `<small>(${esc(it.unit)})</small>` : ""}</th>`).join("")}</tr></thead><tbody>${list
            .map(
              (p) =>
                `<tr><td class="rs-tname">${avatar(p, 28)}<button class="plink" data-action="rs-player" data-id="${p.id}">${esc(p.name)}</button></td>${items
                  .map((it) => {
                    const v = (cur.values[p.id] || {})[it.id];
                    const isBest = v !== "" && v != null && parseFloat(v) === best[it.id];
                    return `<td><input class="input rs-num ${isBest ? "is-best" : ""}" inputmode="decimal" data-change="rs-val" data-t="${cur.id}" data-p="${p.id}" data-i="${it.id}" value="${v == null ? "" : esc(v)}" aria-label="${esc(p.name)} ${esc(it.name)}"></td>`;
                  })
                  .join("")}</tr>`
            )
            .join("")}</tbody></table></div>`
        : `<p class="faint" style="margin:0">「部員」のタブで部員を登録すると、ここに並びます。</p>`
    }</section>`
      : `<section class="card"><p class="faint" style="margin:0">右の「＋」で測定日を足すと、記録を入れられます。</p></section>`;
    return `${itemsCard}<div class="stack"><h3 style="margin:4px 0 0">測定日</h3>${dates}</div>${grid}`;
  }

  /* ============ 練習試合などに名簿から入れる ============ */
  App.rosterPickBtn = (e) =>
    isGuest() || !loaded
      ? ""
      : `<button type="button" class="btn btn-secondary btn-sm" data-action="rs-pick-open">名簿から入れる${activePlayers().length ? `(${activePlayers().length}人)` : ""}</button>`;
  function pickHTML(e) {
    const list = activePlayers(),
      inIds = new Set(e.players.map((p) => p.rid).filter(Boolean));
    const sel = ui.rsPick || [];
    return `<div class="modal-bg"><div class="modal stack"><div class="card-head" style="margin:0"><div><h2>名簿から入れる</h2></div><button class="btn btn-ghost btn-sm" data-action="rs-pick-close">やめる</button></div>
    ${
      list.length
        ? `<div class="row"><button class="btn btn-ghost btn-sm" data-action="rs-pick-all">まだ入っていない人を全部選ぶ</button>${sel.length ? `<button class="btn btn-ghost btn-sm" data-action="rs-pick-none">選ぶのをやめる</button>` : ""}</div>
    <div class="rs-picks">${list
      .map((p) => {
        const done = inIds.has(p.id),
          on = sel.includes(p.id);
        return `<label class="rs-pick ${done ? "is-in" : ""} ${on ? "on" : ""}"><input type="checkbox" data-change="rs-pick" data-id="${p.id}" ${on ? "checked" : ""} ${done ? "disabled" : ""}>${avatar(p, 36)}<span><b>${esc(p.name)}</b><span class="faint">${esc([gradeTxt(p.grade), p.school].filter(Boolean).join(" · "))} · ランク${p.level}${done ? " · 入っています" : ""}</span></span></label>`;
      })
      .join("")}</div>
    <div class="row"><button class="btn btn-primary" data-action="rs-pick-go" ${sel.length ? "" : "disabled"}>${sel.length}人を入れる</button></div>`
        : `<p class="muted" style="margin:0">名簿にまだ誰もいません。</p><div class="row"><button class="btn btn-primary" data-action="roster-open">部員名簿を開く</button></div>`
    }</div></div>`;
  }
  App.rosterPickHTML = (e) => (ui.rsPick ? pickHTML(e) : "");

  /* ============ 操作 ============ */
  Object.assign(A, {
    "roster-open": () => {
      ui.view = "roster";
      ui.rsTab = "players";
      ui.rsPick = null;
      ui.rsPlayer = null;
      render();
      scrollTo(0, 0);
    },
    "rs-tab": (b) => {
      ui.rsTab = b.dataset.k;
      render();
    },
    "rs-new-level": (b) => {
      ui.rsLevel = Number(b.dataset.lv);
      App.keepInPlace(b, render);
    },
    "rs-player": (b) => {
      ui.rsPlayer = b.dataset.id;
      ui.rsEdit = false;
      if (ui.view !== "roster") ui.view = "roster";
      render();
    },
    "rs-close": () => {
      ui.rsPlayer = null;
      render();
    },
    "rs-close-bg": (b, evt) => {
      if (evt.target === b) {
        ui.rsPlayer = null;
        render();
      }
    },
    "rs-level": (b) => {
      const p = rp(b.dataset.id);
      if (!p) return;
      p.level = Number(b.dataset.lv);
      ui.rsEdit = true;
      Roster.save();
      render();
    },
    "rs-photo-del": (b) => {
      const p = rp(b.dataset.id);
      if (!p) return;
      p.photo = "";
      Roster.save();
      render();
    },
    "rs-active": (b) => {
      const p = rp(b.dataset.id);
      if (!p) return;
      p.active = !p.active;
      Roster.save();
      render();
      toast(p.active ? "部員に戻しました" : "引退・休部にしました(履歴は残ります)");
    },
    "rs-del": (b) => {
      const p = rp(b.dataset.id);
      if (!p || !App.askOk(`${p.name} を名簿から消しますか？(作った練習試合の中の名前は残ります)`)) return;
      roster.players = roster.players.filter((x) => x.id !== p.id);
      roster.tests.forEach((t) => delete t.values[p.id]);
      ui.rsPlayer = null;
      Roster.save();
      render();
      toast("名簿から消しました");
    },
    "rs-open-event": (b) => {
      ui.rsPlayer = null;
      A["open-event"](b);
    },
    "rs-item-mv": (b) => {
      const i = Number(b.dataset.i),
        j = i + Number(b.dataset.d),
        it = roster.testItems;
      if (j < 0 || j >= it.length) return;
      [it[i], it[j]] = [it[j], it[i]];
      Roster.save();
      render();
    },
    "rs-item-del": (b) => {
      const it = roster.testItems.find((x) => x.id === b.dataset.id);
      if (!it || !App.askOk(`項目「${it.name}」を消しますか？入れた記録も消えます。`)) return;
      roster.testItems = roster.testItems.filter((x) => x.id !== it.id);
      roster.tests.forEach((t) => Object.values(t.values).forEach((v) => delete v[it.id]));
      Roster.save();
      render();
    },
    "rs-test-add": () => {
      const t = { id: uid(), date: today(), values: {} };
      roster.tests.push(t);
      roster.tests.sort((a, b) => a.date.localeCompare(b.date));
      ui.rsTest = t.id;
      Roster.save();
      render();
    },
    "rs-test-sel": (b) => {
      ui.rsTest = b.dataset.id;
      render();
    },
    "rs-test-del": (b) => {
      const t = roster.tests.find((x) => x.id === b.dataset.id);
      if (!t || !App.askOk(`${t.date} の記録を全部消しますか？`)) return;
      roster.tests = roster.tests.filter((x) => x.id !== t.id);
      ui.rsTest = null;
      Roster.save();
      render();
    },
    "rs-pick-open": () => {
      ui.rsPick = [];
      render();
    },
    "rs-pick-close": () => {
      ui.rsPick = null;
      render();
    },
    "rs-pick-all": () => {
      const e = App.ev(),
        inIds = new Set(e.players.map((p) => p.rid).filter(Boolean));
      ui.rsPick = activePlayers()
        .filter((p) => !inIds.has(p.id))
        .map((p) => p.id);
      render();
    },
    "rs-pick-none": () => {
      ui.rsPick = [];
      render();
    },
    "rs-pick-go": () => {
      const e = App.ev();
      if (!e || !ui.rsPick || !ui.rsPick.length) return;
      const ids = ui.rsPick.slice(),
        left = isGuest() ? 0 : Infinity;
      if (ids.length > left) return;
      let n = 0;
      ids.forEach((id) => {
        const p = rp(id);
        if (!p || e.players.some((x) => x.rid === p.id)) return;
        e.players.push({
          id: uid(),
          rid: p.id,
          name: p.name,
          school: p.school,
          level: p.level,
          grade: p.grade,
          pref: "",
          block: "",
          single: false,
        });
        n++;
      });
      ui.rsPick = null;
      App.commit();
      render();
      toast(`${n}人を入れました`);
    },
  });
  Object.assign(Ch, {
    "rs-q": (t) => {
      ui.rsQ = t.value;
      render();
    },
    "rs-photo": async (t) => {
      const p = rp(t.dataset.id),
        f = t.files && t.files[0];
      if (!p || !f) return;
      try {
        p.photo = await shrinkPhoto(f);
        Roster.save();
        render();
        toast("写真を入れました");
      } catch (e) {
        toast("この写真は読み込めませんでした");
      }
    },
    /* 記録の入力:表を描き直すと、Tab で次の欄へ移った先が消えるので、色だけその場で付け直す */
    "rs-val": (t) => {
      const x = roster.tests.find((z) => z.id === t.dataset.t);
      if (!x) return;
      const v = t.value.normalize("NFKC").trim();
      t.value = v;
      (x.values[t.dataset.p] || (x.values[t.dataset.p] = {}))[t.dataset.i] = v;
      Roster.save();
      const it = roster.testItems.find((z) => z.id === t.dataset.i),
        cells = [...document.querySelectorAll(`input.rs-num[data-t="${x.id}"][data-i="${t.dataset.i}"]`)];
      const nums = cells.map((c) => parseFloat(c.value)).filter((n) => !isNaN(n)),
        best = nums.length ? (it && it.better === "low" ? Math.min(...nums) : Math.max(...nums)) : null;
      cells.forEach((c) => c.classList.toggle("is-best", best != null && parseFloat(c.value) === best));
    },
    "rs-test-date": (t) => {
      const x = roster.tests.find((z) => z.id === t.dataset.id);
      if (!x || !t.value) return;
      x.date = t.value;
      roster.tests.sort((a, b) => a.date.localeCompare(b.date));
      Roster.save();
      render();
    },
    "rs-pick": (t) => {
      const id = t.dataset.id,
        s = new Set(ui.rsPick || []);
      if (t.checked) s.add(id);
      else s.delete(id);
      ui.rsPick = [...s];
      render();
    },
  });
  Object.assign(F, {
    "rs-add": (f) => {
      const d = new FormData(f),
        name = String(d.get("name") || "").trim(),
        school = String(d.get("school") || "").trim(),
        grade = clamp(parseInt(d.get("grade"), 10) || 0, 0, 6);
      if (!name) return;
      if (roster.players.some((p) => p.name === name && p.school === school)) {
        toast("同じ名前・同じ学校の人がもういます");
        return;
      }
      roster.players.push({
        id: uid(),
        name,
        school,
        grade,
        level: ui.rsLevel || 3,
        photo: "",
        note: "",
        active: true,
        createdAt: Date.now(),
      });
      if (school) roster.school = school;
      ui.rsGrade = grade;
      Roster.save();
      render();
      const n = $("#rs-name");
      if (n) n.focus();
      toast(`${name} を登録しました`);
    },
    "rs-edit": (f) => {
      const p = rp(f.dataset.id);
      if (!p) return;
      const d = new FormData(f);
      p.name = String(d.get("name") || "").trim() || p.name;
      p.school = String(d.get("school") || "").trim();
      p.grade = clamp(parseInt(d.get("grade"), 10) || 0, 0, 6);
      p.note = String(d.get("note") || "");
      ui.rsEdit = false;
      Roster.save();
      render();
      toast("保存しました");
    },
    "rs-item-add": (f) => {
      const d = new FormData(f),
        name = String(d.get("name") || "").trim();
      if (!name) return;
      roster.testItems.push({
        id: uid(),
        name,
        unit: String(d.get("unit") || "").trim(),
        better: d.get("better") === "low" ? "low" : "high",
      });
      Roster.save();
      render();
    },
  });
  App.views.roster = rosterHTML;
})();
