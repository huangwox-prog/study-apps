const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const srv = http.createServer((q, r) => { const f = path.join(__dirname, "site", q.url.split("?")[0]); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": f.endsWith(".js") ? "text/javascript" : "text/html; charset=utf-8" }); r.end(d); }); }).listen(8776);
(async () => {
  const br = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--no-sandbox"] });
  const W = Number(process.argv[2] || 1200);
  const p = await (await br.newContext({ viewport: { width: W, height: 900 } })).newPage(); const errs = [];
  p.on("pageerror", (e) => errs.push(e.message)); p.on("dialog", (d) => d.accept());
  const ok = (c, m) => console.log((c ? "OK  " : "NG  ") + m);
  await p.goto("http://localhost:8776/clear/cloud.html"); await p.waitForSelector("#auth-form");
  await p.click("[data-auth-guest]"); await p.waitForSelector(".home-title");
  ok((await p.textContent(".rs-home")).includes("ログインすると"), "ゲスト: 名簿はログインの案内");
  await p.click('[data-action="go-login"]'); await p.waitForSelector("#auth-form");
  await p.fill("input[name=email]", "t@example.com"); await p.fill("input[name=password]", "password1"); await p.click("button[type=submit]");
  await p.waitForSelector(".rs-home-btn"); await p.click(".rs-home-btn"); await p.waitForSelector("#rs-name");
  for (const [n, g] of [["山田 太郎", "5"], ["佐藤 花子", "5"], ["鈴木 一郎", "4"], ["高橋 次郎", "4"]]) { await p.fill("#rs-name", n); await p.fill('form[data-form="rs-add"] input[name=school]', "新庄高"); await p.selectOption('form[data-form="rs-add"] select[name=grade]', g); await p.click('form[data-form="rs-add"] button[type=submit]'); await p.waitForTimeout(150); }
  ok((await p.$$(".rs-card")).length === 4, "部員を4人登録");
  await p.click('.rs-card'); await p.waitForSelector(".rs-modal");
  await p.setInputFiles('input[data-change="rs-photo"]', "face.png"); await p.waitForTimeout(600);
  ok(!!(await p.$(".rs-modal img.rs-ava")), "顔写真が入る");
  const plen = await p.evaluate(() => App.Roster.get().players.find((x) => x.photo).photo.length); ok(plen < 30000, "写真は小さくして保存(" + plen + "文字)");
  await p.click(".rs-modal summary"); await p.fill('form[data-form="rs-edit"] textarea', "スマッシュが得意"); await p.click('form[data-form="rs-edit"] button[type=submit]'); await p.waitForTimeout(200);
  ok((await p.textContent(".rs-note")).includes("スマッシュ"), "メモを保存");
  await p.click('[data-action="rs-close"]');
  // スポーツテスト
  await p.click('[data-action="rs-tab"][data-k="tests"]');
  await p.fill('form[data-form="rs-item-add"] input[name=name]', "50m走"); await p.fill('form[data-form="rs-item-add"] input[name=unit]', "秒"); await p.selectOption('form[data-form="rs-item-add"] select[name=better]', "low"); await p.click('form[data-form="rs-item-add"] button[type=submit]'); await p.waitForTimeout(150);
  await p.fill('form[data-form="rs-item-add"] input[name=name]', "握力"); await p.fill('form[data-form="rs-item-add"] input[name=unit]', "kg"); await p.click('form[data-form="rs-item-add"] button[type=submit]'); await p.waitForTimeout(150);
  await p.click('[data-action="rs-test-add"]'); await p.waitForTimeout(200);
  const inputs = await p.$$(".rs-num"); ok(inputs.length === 8, "4人×2項目の入力欄");
  const vals = ["7.2", "35", "6.9", "28", "7.8", "40", "8.1", "33"];
  for (let i = 0; i < vals.length; i++) { await (await p.$$(".rs-num"))[i].click(); await p.keyboard.type(vals[i]); await p.keyboard.press("Tab"); await p.waitForTimeout(80); if (i < vals.length - 1) ok(await p.evaluate(() => document.activeElement && document.activeElement !== document.body), "Tabのあともカーソルが残る " + i); }
  const best = await p.$$eval(".rs-num.is-best", (x) => x.map((n) => n.value)); ok(best.includes("6.9") && best.includes("40"), "いちばん良い記録に色(小さいほど良い/大きいほど良い) " + best);
  // 練習試合に名簿から入れる
  await p.click('[data-action="home"]'); await p.click('[data-action="pick-mode"][data-mode="practice"]'); await p.fill("input[name=name]", "合同練習"); await p.click('form[data-form="create"] button[type=submit]'); await p.waitForTimeout(300);
  await p.click('[data-action="rs-pick-open"]'); await p.click('[data-action="rs-pick-all"]'); await p.click('[data-action="rs-pick-go"]'); await p.waitForTimeout(300);
  const ev = await p.evaluate(() => App.ev().players.map((x) => [x.name, x.rid ? 1 : 0, x.level, x.grade])); ok(ev.length === 4 && ev.every((x) => x[1]), "名簿の4人が入る " + JSON.stringify(ev));
  await p.click('[data-action="rs-pick-open"]'); ok((await p.$$(".rs-pick.is-in")).length === 4, "入った人は選べない"); await p.click('[data-action="rs-pick-close"]');
  // 回転を作って点数
  await p.click('[data-action="tab"][data-tab="rounds"]'); const s1 = await p.$('[data-action="all-single"]:not([disabled])'); if (s1) { await s1.click(); await p.waitForTimeout(300); }
  for (const a of ["first-round", "ask-create", "ask-go"]) { const b = await p.$(`[data-action="${a}"]:not([disabled])`); if (b) { await b.click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(700); } }
  await p.evaluate(() => { const e = App.ev(); e.practice.rounds.forEach((r) => r.matches.forEach((m) => (m.g = [[15, 3], [15, 5], [null, null]]))); App.commit(); });
  await p.click('[data-action="home"]'); await p.click(".rs-home-btn"); await p.waitForSelector(".rs-card");
  const txt = await p.$$eval(".rs-card", (x) => x.map((n) => n.textContent)); ok(txt.some((t) => t.includes("1回出場") && /1勝0敗|0勝1敗/.test(t)), "名簿に出場履歴と勝敗 " + txt[0]);
  await p.click(".rs-card"); await p.waitForSelector(".rs-hrow"); ok((await p.textContent(".rs-last")).includes("合同練習"), "カルテに「前回」の結果"); ok((await p.$$(".rs-modal .rs-ttable tbody tr")).length === 1, "カルテにスポーツテストの記録");
  await p.screenshot({ path: `roster-card-${W}.png`, fullPage: true });
  await p.click('[data-action="rs-close"]'); await p.screenshot({ path: `roster-list-${W}.png`, fullPage: true });
  await p.click('[data-action="rs-tab"][data-k="tests"]'); await p.screenshot({ path: `roster-tests-${W}.png`, fullPage: true });
  await p.waitForTimeout(1200);
  const saved = await p.evaluate(() => (window.__mockdb.roster || []).length); ok(saved === 1, "名簿がクラウドに保存");
  // 読み込み直しても残る(端末の控えを消してクラウドから)
  await p.evaluate(() => { Object.keys(localStorage).filter((k) => k.includes("#roster")).forEach((k) => localStorage.removeItem(k)); });
  await p.reload(); await p.waitForSelector(".rs-home-btn"); ok((await p.textContent(".rs-home-btn")).includes("4人"), "クラウドから名簿を読み直せる");
  console.log(errs.length ? "ERR " + errs.join(" | ") : "エラーなし"); await br.close(); srv.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
