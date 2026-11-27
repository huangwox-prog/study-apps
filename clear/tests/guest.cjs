const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const srv = http.createServer((q, r) => { const f = path.join(__dirname, "site", q.url.split("?")[0]); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": f.endsWith(".js") ? "text/javascript" : "text/html; charset=utf-8" }); r.end(d); }); }).listen(8769);
(async () => {
  const br = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--no-sandbox"] });
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", (e) => errs.push(e.message)); p.on("dialog", (d) => d.accept());
  const ok = (c, m) => console.log((c ? "OK  " : "NG  ") + m);
  const players = () => p.evaluate(() => App.ev().players.length);
  const add = async (n) => { await p.fill("#new-name", n); await p.click('form[data-form="add-player"] button[type=submit]'); await p.waitForTimeout(200); };
  // 前のデータ(1件)を用意して、ログインせずに使う
  await p.goto("http://localhost:8769/clear/plain.html"); await p.waitForSelector(".home-title");
  await p.click('[data-type="practice"]'); await p.waitForTimeout(300);
  await p.goto("http://localhost:8769/clear/cloud.html"); await p.waitForSelector("#auth-form");
  await p.click("[data-auth-guest]"); await p.waitForSelector(".home-title");
  ok(!(await p.$(".make-grid")), "ゲスト: 新しく作るボタンが出ない"); await p.screenshot({ path: "guest-home.png", fullPage: true });
  ok(await p.isVisible('[data-action="sample"]'), "ゲスト: 見本は出る");
  ok((await p.$$(".event-card")).length === 1, "ゲスト: 前のデータが開ける");
  // 前のデータに追加
  await p.click(".event-open"); await p.waitForSelector("#new-name");
  const b0 = await players(); await add("あ1"); await add("あ2"); await add("あ3");
  ok((await players()) === b0 + 3, "前のデータ: 3人まで追加できる");
  await add("あ4"); ok((await players()) === b0 + 3, "前のデータ: 4人目は追加できない");
  ok((await p.textContent("#toast")).includes("3人まで"), "4人目で案内が出る: " + (await p.textContent("#toast")));
  // 見本
  await p.click('[data-action="home"]'); await p.click('[data-action="sample"][data-type="practice"]'); await p.waitForSelector("#new-name");
  const s0 = await players(); await add("い1"); await add("い2");
  // 貼り付けで2人(残り1人)→断る
  const r = await p.evaluate(() => { App.ui.addMode = "paste"; App.render(); return !!document.querySelector('[data-input="paste"]'); });
  if (r) { await p.fill('[data-input="paste"]', "う1\nう2"); await p.waitForTimeout(200); const g = await p.$('[data-action="imp-go"]'); if (g) { await g.click(); await p.waitForTimeout(200); } ok((await players()) === s0 + 2, "見本: 残り1人のとき貼り付け2人は断る"); }
  else ok(false, "貼り付け欄が見つからない");
  await p.evaluate(() => { App.ui.addMode = "one"; App.ui.imp = null; App.render(); });
  await add("い3"); await add("い4"); ok((await players()) === s0 + 3, "見本: 3人まで");
  // 新しく作る操作を直接呼んでも断る
  await p.click('[data-action="home"]'); await p.evaluate(() => App.A["pick-mode"]({ dataset: { mode: "practice" } }));
  ok(!(await p.$('form[data-form="create"]')), "ゲスト: 作る画面に入れない");
  // ログインしたら制限なし
  await p.click('[data-action="go-login"]'); await p.waitForSelector("#auth-form");
  await p.fill("input[name=email]", "t@example.com"); await p.fill("input[name=password]", "password1"); await p.click("button[type=submit]");
  await p.waitForSelector(".make-grid"); ok(true, "ログイン後: 作るボタンが出る");
  await p.click('[data-action="sample"][data-type="practice"]'); await p.waitForSelector("#new-name");
  const l0 = await players(); for (const n of ["え1", "え2", "え3", "え4", "え5"]) await add(n);
  ok((await players()) === l0 + 5, "ログイン後: 4人以上追加できる");
  ok(!(await p.$(".note.warn")) , "ログイン後: 残り人数の表示なし");
  console.log(errs.length ? "ERR " + errs.join(" | ") : "エラーなし"); await br.close(); srv.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
