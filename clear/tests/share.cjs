// 選手用コード(先生がコードを出す → 選手がコードで入って点数を入れる)
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const srv = http.createServer((q, r) => { const f = path.join(__dirname, "site", q.url.split("?")[0]); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": f.endsWith(".js") ? "text/javascript" : "text/html; charset=utf-8" }); r.end(d); }); }).listen(8771);
const U = "http://localhost:8771/clear/cloud.html";
(async () => {
  const br = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--no-sandbox"] });
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 } });
  const errs = [];
  const ok = (c, m) => console.log((c ? "OK  " : "NG  ") + m);
  const T = await ctx.newPage(); T.on("pageerror", (e) => errs.push(e.message)); T.on("dialog", (d) => d.accept());
  // 先生: ログインして、見本の練習試合に回転を作る
  await T.goto(U); await T.waitForSelector("#auth-form");
  await T.fill("input[name=email]", "t@example.com"); await T.fill("input[name=password]", "password1"); await T.click("button[type=submit]");
  await T.waitForSelector(".make-grid");
  await T.click('[data-action="sample"][data-type="practice"]'); await T.waitForSelector("#new-name");
  await T.evaluate(() => { App.ui.tab = "rounds"; App.render(); }); await T.waitForTimeout(200);
  for (const a of ["auto-pairs", "all-single", "first-round", "pround", "ask-create", "ask-go"]) { const b = await T.$(`[data-action="${a}"]:not([disabled])`); if (b) { await b.click({ timeout: 3000 }).catch(() => {}); await T.waitForTimeout(800); } }
  const rounds = await T.evaluate(() => App.ev().practice.rounds.length);
  ok(rounds > 0, "先生: 回転がある " + rounds);
  ok(await T.isVisible('[data-action="share-open"]'), "先生: 「選手用コード」ボタンが出る");
  await T.click('[data-action="share-open"]'); await T.waitForSelector('[data-action="share-new"]');
  await T.click('[data-action="share-new"]'); await T.waitForSelector(".share-code");
  const code = (await T.textContent(".share-code")).replace(/\D/g, "");
  ok(/^\d{8}$/.test(code), "先生: 8桁のコードが出る " + code);
  ok((await T.textContent(".share-url")).includes("?code=" + code), "先生: 参加用URLが出る");
  await T.screenshot({ path: "share-teacher-390.png" });
  const first = await T.evaluate(() => { const r = App.ev().practice.rounds[0], m = r.matches[0]; return { r: r.id, m: m.id }; });

  // 選手: コード入りURLで開く(ログインなし)
  const S = await ctx.newPage(); S.on("pageerror", (e) => errs.push(e.message));
  await S.goto(U + "?code=" + code); await S.waitForSelector(".pmatch");
  ok(!(await S.$("#auth-form")), "選手: ログイン画面を出さずに入れる");
  ok((await S.$$(".pmatch")).length > 0, "選手: 対戦が見える");
  ok(!/ランク|レベル/.test(await S.innerText("body")), "選手: ランクの文字が出ない");
  const got = await S.evaluate((c) => window.Cloud.client.rpc("share_get", { p_code: c }).then((r) => JSON.stringify(r.data)), code);
  ok(!/level|note|rank/i.test(got) && /"name"/.test(got), "選手: ランク・メモのデータが届いていない");
  await S.screenshot({ path: "share-student-390.png", fullPage: true });
  // 点数を入れる → いいえ → 何も変わらない
  await S.click(`.pm-mid[data-m="${first.m}"]`); await S.waitForSelector(".pm-extra .score");
  const ins = await S.$$(".pm-extra .score");
  // ありえない点数は止める
  for (const [x, y, w] of [["22", "20", "21点より多く"], ["20", "10", "20-10"], ["21", "21", "21-21"]]) {
    const ii = await S.$$(".pm-extra .score"); await ii[0].fill(x); await ii[1].fill(y); await S.click('[data-sh="save"]'); await S.waitForTimeout(150);
    const em = await S.$(".pm-extra .note.err"); const et = em ? await em.textContent() : "(なし)";
    ok(!(await S.$(".sh-confirm")) && et.includes(w), "選手: " + x + "-" + y + " は止める: " + et);
  }
  const ng = await S.evaluate(() => document.querySelectorAll(".pm-extra .score").length);
  { const ii = await S.$$(".pm-extra .score"); await ii[0].fill("15"); await ii[1].fill("10"); }
  // 2けた入れたら次の欄へ・もう一度押しても消えない
  { const ii = await S.$$(".pm-extra .score"); await ii[0].fill(""); await ii[1].fill(""); await ii[0].focus(); await S.keyboard.type("15");
    ok(await S.evaluate(() => document.activeElement === document.querySelectorAll(".pm-extra .score")[1]), "選手: 2けた入れると次の欄へ移る");
    await S.keyboard.type("10"); await S.click(`.pm-mid[data-m="${first.m}"]`); await S.waitForTimeout(150);
    const v = await S.$$eval(".pm-extra .score", (a) => a.slice(0, 2).map((x) => x.value).join("-"));
    ok(v === "15-10", "選手: 「点数を入れる」をもう一度押しても数字が消えない " + v); }
  await S.click('[data-sh="save"]'); await S.waitForSelector(".sh-confirm");
  ok((await S.textContent(".sh-confirm")).includes("この記録を更新します。よろしいですか？"), "選手: 「この記録を更新します。よろしいですか？」が出る");
  await S.screenshot({ path: "share-confirm-390.png" });
  await S.click('[data-sh="no"]'); await S.waitForTimeout(200);
  const g0 = await S.evaluate(([r, m]) => __mockdb.events.flatMap((e) => e.data.practice ? e.data.practice.rounds : []).find((x) => x.id === r).matches.find((x) => x.id === m).g, [first.r, first.m]);
  ok(!(g0 || []).some((g) => g && g[0] === 15), "選手: 「いいえ」なら記録しない");
  ok(await S.isVisible(".pm-extra .score"), "選手: 「いいえ」で入力に戻る");
  // はい → 記録される
  await S.click('[data-sh="save"]'); await S.waitForSelector(".sh-confirm"); await S.click('[data-sh="yes"]');
  await S.waitForFunction(() => !document.querySelector(".modal-bg"));
  const g1 = await S.evaluate(([r, m]) => __mockdb.events.flatMap((e) => e.data.practice ? e.data.practice.rounds : []).find((x) => x.id === r).matches.find((x) => x.id === m).g, [first.r, first.m]);
  ok(JSON.stringify(g1[0]) === "[15,10]" && (await S.evaluate(() => 1)), "選手: 「はい」で記録される " + JSON.stringify(g1));
  ok((await S.textContent("#toast")).includes("記録しました"), "選手: 記録しましたと出る");
  ok((await S.textContent(`.pm-mid[data-m="${first.m}"]`)).replace(/\s/g, "").includes("15-10"), "選手: 画面に点数が出る");
  // 片方だけの点数も入れられる
  await S.click(`.pm-mid[data-m="${first.m}"]`); await S.waitForSelector(".pm-extra .score");
  const ins2 = await S.$$(".pm-extra .score"); await ins2[1].fill("");
  await S.click('[data-sh="save"]'); await S.waitForTimeout(200);
  ok(!!(await S.$(".sh-confirm")), "選手: 片方だけの点数でも記録できる(試合中)");
  await S.click('[data-sh="yes"]'); await S.waitForFunction(() => !document.querySelector(".modal-bg"));
  ok(await S.$eval(`.pm-mid[data-m="${first.m}"]`, (b) => b.closest(".pmatch").classList.contains("is-live")), "選手: 途中の試合は黄色(試合中)になる");
  // 名前で探す
  const nm = await S.evaluate(() => document.querySelector(".pmatch .pname").textContent);
  await S.fill("#sh-q", nm); await S.waitForTimeout(200);
  ok((await S.$$(".pmatch")).length >= 1 && (await S.$$eval(".pmatch", (a, n) => a.every((x) => x.textContent.includes(n)), nm)), "選手: 名前で探せる");

  // まちがったコード(ログイン画面から)
  const W = await ctx.newPage(); W.on("pageerror", (e) => errs.push(e.message));
  await W.goto(U + "#join"); await W.waitForSelector("#sh-form");
  await W.fill("#sh-form input[name=code]", "123"); await W.click("#sh-form button[type=submit]");
  ok((await W.textContent(".auth-msg")).includes("8桁"), "まちがい: 桁が足りないと案内");
  await W.fill("#sh-form input[name=code]", ""); await W.type("#sh-form input[name=code]", "12ab345678901"); ok((await W.inputValue("#sh-form input[name=code]")) === "12345678", "まちがい: 数字以外は入らない・8桁まで");
  await W.click("#sh-form button[type=submit]"); await W.waitForSelector(".auth-msg.err");
  ok((await W.textContent(".auth-msg")).includes("使えない"), "まちがい: ちがうコードでは入れない");
  for (let i = 0; i < 10; i++) { await W.click("#sh-form button[type=submit]"); await W.waitForTimeout(60); }
  ok((await W.textContent(".auth-msg")).includes("10分"), "まちがい: 何度もまちがえると止まる");
  // ログイン画面のボタンから入れる
  const L = await ctx.newPage(); await L.goto(U); await L.waitForSelector(".make-grid, #auth-form");
  await L.evaluate(() => localStorage.removeItem("__mocksess")); await L.goto(U); await L.waitForSelector("#auth-form");
  ok(await L.isVisible("[data-auth-join]"), "ログイン画面に「試合コードで参加」がある");
  await L.click("[data-auth-join]"); await L.waitForSelector("#sh-form"); ok(true, "ログイン画面から入れる");

  // 先生が止める → 選手は入れなくなる
  await T.click('[data-action="share-toggle"]'); await T.waitForSelector(".share-code.off");
  ok(true, "先生: 止められる");
  const S2 = await ctx.newPage(); await S2.goto(U + "?code=" + code); await S2.waitForSelector("#sh-form .auth-msg.err");
  ok(true, "止めたコードでは入れない");
  // 新しいコード → 前のは使えない
  await T.click('[data-action="share-new"]'); await T.waitForFunction((c) => { const n = document.querySelector(".share-code"); return n && n.textContent.replace(/\D/g, "") !== c; }, code);
  const code2 = (await T.textContent(".share-code")).replace(/\D/g, "");
  ok(code2 !== code && /^\d{8}$/.test(code2), "先生: 新しいコードにできる");
  console.log(errs.length ? "ERR " + errs.join(" | ") : "エラーなし"); await br.close(); srv.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
