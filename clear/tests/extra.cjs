const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const srv = http.createServer((q, r) => { fs.readFile(path.join(__dirname, "site", q.url.split("?")[0]), (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": "text/html; charset=utf-8" }); r.end(d); }); }).listen(8775);
(async () => {
  const br = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--no-sandbox"] });
  const p = await (await br.newContext({ viewport: { width: 1200, height: 900 } })).newPage(); const errs = [];
  p.on("pageerror", (e) => errs.push(e.message)); await p.route(/jsdelivr/, (r) => r.abort()); p.on("dialog", (d) => d.accept());
  const ok = (c, m) => console.log((c ? "OK  " : "NG  ") + m);
  await p.goto("http://localhost:8775/clear/new.html"); await p.waitForSelector(".home-title");
  await p.click('[data-action="sample"][data-type="practice"]'); await p.click('[data-action="tab"][data-tab="rounds"]');
  for (const a of ["auto-pairs", "all-single"]) { const b = await p.$(`[data-action="${a}"]:not([disabled])`); if (b) { await b.click(); await p.waitForTimeout(400); } }
  for (let i = 0; i < 2; i++) for (const a of ["first-round", "pround", "ask-create", "ask-go"]) { const b = await p.$(`[data-action="${a}"]:not([disabled])`); if (b) { await b.click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(800); } }
  for (const a of ["pround", "ask-create", "ask-go"]) { const b = await p.$(`[data-action="${a}"]:not([disabled])`); if (b) { await b.click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(800); } }
  await p.evaluate(() => { const rs = App.ev().practice.rounds; rs[rs.length - 1].day = 2; App.commit(); App.render(); });
  const days = await p.evaluate(() => [...new Set(App.ev().practice.rounds.map((r) => r.day))]); ok(days.length === 2, "2日分の回転 " + JSON.stringify(days));
  await p.click('[data-action="tab"][data-tab="pstats"]'); await p.click('[data-action="pview"][data-view="sheet"]'); await p.waitForTimeout(300);
  const nAll = await p.$$eval(".st-card", (x) => x.length); ok(await p.$('[data-action="sday"][data-d="2"]'), "日のタブが出る");
  await p.click('[data-action="sday"][data-d="2"]'); await p.waitForTimeout(200); const n2 = await p.$$eval(".st-card", (x) => x.length);
  ok(n2 === 1 && nAll === 2, `日で絞れる(全${nAll} → 2日目${n2})`);
  await p.click('[data-action="sday"][data-d="all"]');
  const name = await p.evaluate(() => App.ev().players[0].name);
  await p.fill("#q", name); await p.waitForTimeout(300);
  const rows = await p.$$eval(".st-row", (x) => x.length); ok(rows >= 1 && rows <= 3, `検索で絞れる(${name}: ${rows}試合)`);
  await p.click(".st-row .plink"); await p.waitForTimeout(200); ok(!!(await p.$(".modal")), "名前を押すと選手のページ");
  await p.click('[data-action="pplayer-close"]'); await p.fill("#q", ""); await p.waitForTimeout(200);
  for (const v of ["list", "sheet", "merge"]) { await p.click(`[data-action="pview"][data-view="${v}"]`); await p.evaluate(() => { window.print = () => {}; }); await p.click('[data-action="print-practice"]'); await p.waitForTimeout(200); const h = await p.evaluate(() => document.querySelector("#print-area").innerHTML.length); ok(h > 1000, `PDF用(${v}) ${h}文字・紙の形のまま: ${await p.evaluate(() => !!document.querySelector("#print-area table"))}`); }
  console.log(errs.length ? "ERR " + errs.join(" | ") : "エラーなし"); await br.close(); srv.close();
})();
