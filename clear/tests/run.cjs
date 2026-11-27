const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const srv = http.createServer((q, r) => { const f = path.join(__dirname, "site", decodeURIComponent(q.url.split("?")[0].split("#")[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": f.endsWith(".js") ? "text/javascript" : "text/html; charset=utf-8" }); r.end(d); }); }).listen(8765);
(async () => {
  const br = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--no-sandbox"] });
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/jsdelivr/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", (e) => errs.push("pageerror " + e.message)); p.on("console", (m) => { if (m.type() === "error" && !/ERR_FAILED|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  const ok = (c, m) => console.log((c ? "OK  " : "NG  ") + m);
  // 1) 設定なし:今までどおり
  await p.goto("http://localhost:8765/clear/plain.html"); await p.waitForSelector(".home-title");
  ok(!(await p.$("#auth-form")), "設定なし: ログイン画面は出ない");
  await p.click('[data-type="practice"]'); await p.waitForTimeout(300);
  await p.reload(); await p.waitForSelector(".home-title, .tabs, .page");
  const ls = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("arca-league-v1") || "{}")).length);
  ok(ls === 1, "設定なし: 見本が arca-league-v1 に保存 (" + ls + ")");
  // 2) 設定あり:ログインが要る
  await p.goto("http://localhost:8765/clear/cloud.html"); await p.waitForSelector("#auth-form");
  ok(true, "設定あり: ログイン画面が出る");
  // 抜け穴:ログインせずに使う → 前のデータがそのまま見える
  await p.click("[data-auth-guest]"); await p.waitForSelector(".home-title");
  ok((await p.$$eval(".event-card", (x) => x.length)) === 1, "ログインせずに使う: 前のデータが見える");
  ok(await p.isVisible('[data-action="go-login"]'), "ログインせずに使う: ホームにログインへの入口");
  await p.reload(); await p.waitForSelector(".home-title");
  ok(!(await p.$("#auth-form")), "ログインせずに使う: 開き直してもログイン画面を出さない");
  await p.click('[data-action="go-login"]'); await p.waitForSelector("#auth-form");
  ok(true, "ホームの入口からログイン画面へ");
  await p.fill("input[name=email]", "t@example.com"); await p.fill("input[name=password]", "wrongpass"); await p.click("button[type=submit]");
  await p.waitForSelector(".auth-msg.err"); ok((await p.textContent(".auth-msg")).includes("違います"), "まちがったパスワード: 日本語のエラー");
  await p.click('[data-auth-go="signup"]'); await p.fill("input[name=password]", "password1"); await p.click("button[type=submit]");
  await p.waitForSelector(".auth-msg"); ok((await p.textContent(".auth-msg")).includes("もう登録"), "登録済みメールで新規登録: 案内が出る");
  await p.click('[data-auth-go="login"]'); await p.fill("input[name=password]", "password1"); await p.click("button[type=submit]");
  await p.waitForSelector(".home-title"); ok(true, "ログインできた");
  ok(await p.isVisible('[data-action="import-local"]'), "ログイン前のデータの取り込みボタンが出る");
  ok((await p.textContent(".account-box")).includes("t@example.com"), "ログイン中のメールが出る");
  await p.click('[data-action="import-local"]'); await p.waitForTimeout(1500);
  const n = await p.evaluate(() => window.__mockdb.events.filter((r) => r.user_id === "u-1").length);
  ok(n === 1, "取り込んだデータがクラウドに保存 (" + n + ")");
  ok(!(await p.$('[data-action="import-local"]')), "取り込んだら、ボタンが消える");
  // 新しく作る→クラウドへ
  await p.click('[data-action="pick-mode"][data-mode="practice"]'); await p.fill("input[name=name]", "テスト練習"); await p.click("button[type=submit]"); await p.waitForTimeout(1500);
  const n2 = await p.evaluate(() => window.__mockdb.events.length); ok(n2 === 2, "新しく作ったものもクラウドへ (" + n2 + ")");
  // 別の端末のつもりで:この端末のデータを消しても、クラウドから読める
  await p.evaluate(() => { localStorage.removeItem("arca-league-v1:u-1"); });
  await p.reload(); await p.waitForSelector(".page");
  await p.click('[data-action="home"]'); await p.waitForSelector(".event-grid");
  const cards = await p.$$eval(".event-card", (x) => x.length); ok(cards === 2, "読み込み直しでクラウドから2件 (" + cards + ")");
  ok((await p.evaluate(() => localStorage.getItem("arca-league-v1") !== null)), "ログイン前の元データは残っている");
  // ログアウト
  await p.click('[data-action="logout"]'); await p.waitForSelector("#auth-form"); ok(true, "ログアウトでログイン画面に戻る");
  // パスワード再設定
  await p.click('[data-auth-go="reset"]'); await p.fill("input[name=email]", "t@example.com"); await p.click("button[type=submit]");
  await p.waitForSelector(".auth-msg.ok"); ok(true, "再設定メールの案内が出る");
  await p.screenshot({ path: "/home/claude/e2e/login.png" });
  await p.goto("http://localhost:8765/clear/cloud.html"); await p.waitForSelector("#auth-form");
  await p.evaluate(() => { document.documentElement.dataset.theme = "dark"; }); await p.screenshot({ path: "/home/claude/e2e/login-dark.png" });
  console.log(errs.length ? "ERRORS:\n" + errs.join("\n") : "エラーなし");
  await br.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
