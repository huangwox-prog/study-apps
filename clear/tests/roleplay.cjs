// 先生1人・選手2人が同じサーバー(mock-server.cjs)を使う通しのテスト。ロールプレイで見つかったバグがもどっていないかを見る
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const { spawn } = require("child_process"), path = require("path");
const PORT = 8795, BASE = `http://localhost:${PORT}/clear/remote.html`;
const ok = (c, m) => { console.log((c ? "OK  " : "NG  ") + m); if (!c) process.exitCode = 1; };
const api = (p) => fetch(`http://localhost:${PORT}${p}`).then((r) => r.json());
(async () => {
  const srv = spawn(process.execPath, [path.join(__dirname, "mock-server.cjs"), String(PORT)], { stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 600));
  const br = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--no-sandbox"] });
  const errs = [];
  const ctx = async (ip, w = 390) => { const c = await br.newContext({ viewport: { width: w, height: 900 }, extraHTTPHeaders: { "x-test-ip": ip } }); const p = await c.newPage(); p.on("pageerror", (e) => errs.push(ip + ": " + e.message)); p.on("dialog", (d) => (p._dlg ? p._dlg(d) : d.accept())); return { c, p }; };
  try {
    // 先生
    const { p: T } = await ctx("teacher", 1280);
    await T.goto(BASE); await T.waitForSelector("#auth-form");
    await T.fill("input[name=email]", "t@example.com"); await T.fill("input[name=password]", "password1"); await T.click("button[type=submit]");
    await T.waitForSelector(".make-grid");
    await T.click('[data-action="sample"][data-type="practice"]'); await T.waitForSelector("#new-name");
    await T.evaluate(() => { App.ui.tab = "rounds"; App.render(); });
    for (const a of ["auto-pairs", "all-single", "first-round", "pround", "ask-create", "ask-go"]) { const b = await T.$(`[data-action="${a}"]:not([disabled])`); if (b) { await b.click({ timeout: 3000 }).catch(() => {}); await T.waitForTimeout(700); } }
    await T.waitForTimeout(1500);
    await T.click('[data-action="share-open"]'); await T.click('[data-action="share-new"]'); await T.waitForSelector(".share-code");
    const code = (await T.textContent(".share-code")).replace(/\D/g, "");
    await T.click('[data-action="share-close"]');
    const M = await T.evaluate(() => App.ev().practice.rounds[0].matches.map((m) => ({ r: App.ev().practice.rounds[0].id, m: m.id })));
    const G = await T.evaluate(() => ({ games: App.ev().games, points: App.ev().points }));
    ok(M.length >= 8 && G.games === 3, `準備: 試合 ${M.length}・${G.points}点${G.games}ゲーム・コード ${code}`);
    const srvG = async (i) => { const db = await api("/api/db"); for (const e of db.events) for (const r of e.data.practice ? e.data.practice.rounds : []) for (const m of r.matches) if (m.id === M[i].m) return m; };

    // 選手A・B
    const { c: CA, p: A } = await ctx("sa"), { p: B } = await ctx("sb");
    await A.goto(BASE + "?code=" + code); await A.waitForSelector(".pmatch");
    await B.goto(BASE + "#join"); await B.waitForSelector("#sh-form");
    await B.type("#sh-form input[name=code]", code, { delay: 30 }); await B.waitForSelector(".pmatch");
    ok(true, "選手B: 8けた打つと、ボタンを押さなくても入れる");
    await B.reload(); await B.waitForSelector(".pmatch", { timeout: 8000 }).catch(() => {});
    ok(!!(await B.$(".pmatch")), "選手B: コードで入ったあと開き直しても、試合の画面のまま");

    const openM = async (P, i) => { await P.click(`.pm-mid[data-m="${M[i].m}"]`); await P.waitForSelector(".pm-extra .score"); };
    const boxes = (P) => P.$$(".pm-extra .score");
    const typeIn = async (P, i, s) => { const b = await boxes(P); await b[i].click(); await P.keyboard.type(s, { delay: 60 }); };
    const save = async (P, yes = true) => { await P.click('[data-sh="save"]'); await P.waitForSelector(".sh-confirm"); if (yes) { await P.click('[data-sh="yes"]'); await P.waitForFunction(() => !document.querySelector(".sh-confirm")); } };

    // 1けたで次の欄へ・押すと中身が選ばれる
    await openM(A, 0);
    await typeIn(A, 0, "9");
    ok(await A.evaluate(() => document.activeElement === document.querySelectorAll(".pm-extra .score")[1]), "選手A: 1けた(9)でも次の欄へ移る(15点ゲーム)");
    await A.keyboard.type("15", { delay: 60 });
    ok(await A.evaluate(() => document.activeElement === document.querySelectorAll(".pm-extra .score")[2]), "選手A: 2けたで次の欄へ移る");
    await typeIn(A, 0, "7"); await A.waitForTimeout(100);
    ok((await (await boxes(A))[0].inputValue()) === "7", "選手A: 入っている欄を押して打つと、置きかわる(後ろに付け足さない)");
    // 打ちかけを残して別の試合へ → もどる
    await openM(A, 1); await openM(A, 0);
    const v0 = await A.$$eval(".pm-extra .score", (a) => a.slice(0, 2).map((x) => x.value).join("-"));
    ok(v0 === "7-15", "選手A: 別の試合を開いてもどっても、打ちかけが残る " + v0);
    // 勝負がついたあとの第3ゲームは止める
    { const b = await boxes(A); await b[0].fill("15"); await b[1].fill("10"); await b[2].fill("15"); await b[3].fill("12"); await b[4].fill("15"); await b[5].fill("3"); }
    await A.click('[data-sh="save"]'); await A.waitForTimeout(150);
    ok(!(await A.$(".sh-confirm")) && (await A.textContent(".pm-extra .note.err")).includes("勝負がついている"), "選手A: 2-0 のあとの第3ゲームは止める");
    { const b = await boxes(A); await b[4].fill(""); await b[5].fill(""); }
    await A.click('[data-sh="save"]'); await A.waitForSelector(".sh-confirm");
    ok(!(await A.textContent(".sh-confirm")).includes("書きかわります"), "選手A: 初めての記録では「書きかわります」を出さない");
    await A.click('[data-sh="yes"]'); await A.waitForFunction(() => !document.querySelector(".sh-confirm"));
    ok(JSON.stringify((await srvG(0)).g) === "[[15,10],[15,12]]", "選手A: 記録できる");

    // 先生の保存で、選手の点数・コートが消えない(先生が別の試合を打っている最中に、選手が記録)
    await T.waitForTimeout(1500);
    await T.evaluate((id) => document.getElementById("pm-" + id).scrollIntoView({ block: "center" }), M[7].m);
    await T.click(`#pm-${M[7].m} .pm-mid`); await T.waitForTimeout(200);
    await T.click(`#ps-${M[7].m}-0-0`); await T.keyboard.type("1");
    await openM(B, 2); { const b = await boxes(B); await b[0].fill("15"); await b[1].fill("8"); await b[2].fill("15"); await b[3].fill("9"); }
    await save(B);
    await B.fill(`#sc-${M[2].m}`, "a3"); await B.press(`#sc-${M[2].m}`, "Enter"); await B.waitForTimeout(300);
    await T.keyboard.type("3"); await T.waitForTimeout(3500);
    const m2 = await srvG(2), m7 = await srvG(7);
    ok(JSON.stringify(m2.g) === "[[15,8],[15,9]]" && m2.ct === "A3", "先生が保存しても、選手が入れた点数・コートが残る " + JSON.stringify(m2.g) + " " + m2.ct);
    ok(JSON.stringify(m7.g[0]) === "[13,null]", "先生の点数も残る " + JSON.stringify(m7.g));
    ok(await T.evaluate((id) => { for (const r of App.ev().practice.rounds) for (const m of r.matches) if (m.id === id) return JSON.stringify(m.g) === "[[15,8],[15,9]]"; }, M[2].m), "先生の画面にも選手の点数が出る");

    // ぶつかり:Aが開いたまま、Bが先に記録 → Aは知らされる
    await A.click('[data-sh="reload"]'); await A.waitForTimeout(500);
    await openM(A, 3); await openM(B, 3);
    { const b = await boxes(B); await b[0].fill("15"); await b[1].fill("11"); await b[2].fill("15"); await b[3].fill("13"); } await save(B);
    { const b = await boxes(A); await b[0].fill("11"); await b[1].fill("15"); await b[2].fill("9"); await b[3].fill("15"); }
    await A.click('[data-sh="save"]'); await A.waitForSelector(".sh-confirm"); await A.click('[data-sh="yes"]');
    await A.waitForFunction(() => document.querySelector(".sh-confirm") && document.querySelector(".sh-confirm").textContent.includes("先に"));
    ok((await A.textContent(".sh-confirm")).includes("15-11"), "選手A: ほかの人が先に記録したら、いまの点数を見せて聞く");
    ok(JSON.stringify((await srvG(3)).g) === "[[15,11],[15,13]]", "選手A: 聞かれているあいだは、上書きしない");
    await A.click('[data-sh="force"]'); await A.waitForFunction(() => !document.querySelector(".sh-confirm"));
    ok(JSON.stringify((await srvG(3)).g) === "[[11,15],[9,15]]", "選手A: 「上書きする」を選べば上書きできる");

    // 電波が切れても固まらない
    await openM(A, 4); { const b = await boxes(A); await b[0].fill("15"); await b[1].fill("6"); await b[2].fill("15"); await b[3].fill("7"); }
    await CA.setOffline(true);
    await A.click('[data-sh="save"]'); await A.waitForSelector(".sh-confirm"); await A.click('[data-sh="yes"]'); await A.waitForTimeout(800);
    ok((await A.textContent(".sh-confirm")).includes("送れませんでした") && !(await A.$('[data-sh="yes"][disabled]')), "選手A: 電波が切れたら案内が出て、もう一度押せる");
    await CA.setOffline(false); await A.click('[data-sh="yes"]'); await A.waitForFunction(() => !document.querySelector(".sh-confirm"));
    ok(JSON.stringify((await srvG(4)).g) === "[[15,6],[15,7]]", "選手A: 電波がもどったら記録できる");

    // 直すときは前の点数を見せる・閉じるときは確かめる
    await openM(A, 4); { const b = await boxes(A); await b[3].click(); await A.keyboard.type("9"); }
    await A.click('[data-sh="save"]'); await A.waitForSelector(".sh-confirm");
    ok((await A.textContent(".sh-confirm")).includes("前の点数") && (await A.textContent(".sh-confirm")).includes("15-6"), "選手A: 直すときは前の点数を見せる");
    await A.click('[data-sh="no"]');
    let asked = false; A._dlg = (d) => { asked = true; d.dismiss(); };
    await A.click('[data-sh="cancel"]'); await A.waitForTimeout(200);
    ok(asked && !!(await A.$(".pm-extra")), "選手A: 記録していない点数があるときの「閉じる」は確かめる");
    A._dlg = null;

    // 日本語入力(変換中)で「１５」→確定 → 次の欄へ移り、続けて打った数字も入る
    await A.click('[data-sh="cancel"]').catch(() => {}); A._dlg = null; await A.waitForTimeout(200);
    await openM(A, 5);
    { const b = await boxes(A); await b[0].click(); const cdp = await A.context().newCDPSession(A);
      await cdp.send("Input.imeSetComposition", { text: "１", selectionStart: 1, selectionEnd: 1 });
      await cdp.send("Input.imeSetComposition", { text: "１５", selectionStart: 2, selectionEnd: 2 });
      await cdp.send("Input.insertText", { text: "１５" }); await A.waitForTimeout(200);
      await A.keyboard.type("8"); await A.waitForTimeout(200); }
    const ime = await A.$$eval(".pm-extra .score", (a) => a.slice(0, 2).map((x) => x.value).join("-"));
    ok(ime === "15-8", "選手A: 日本語入力で「１５」と打っても、次の欄へ移って続きが入る " + ime);

    // 名前検索:打っている最中に自動更新が来ても外れない
    await A.click('[data-sh="cancel"]').catch(() => {}); await A.waitForTimeout(200);
    await A.click("#sh-q"); await A.keyboard.type("佐");
    await A.evaluate(() => window.dispatchEvent(new Event("x"))); await A.waitForTimeout(21500);
    ok(await A.evaluate(() => document.activeElement && document.activeElement.id === "sh-q"), "選手A: 名前検索の欄は、自動更新のあとも打てるまま");

    ok(!errs.length, "画面のエラーなし " + errs.join(" | "));
  } catch (e) { ok(false, "止まった: " + e.message); }
  await br.close(); srv.kill();
})();
