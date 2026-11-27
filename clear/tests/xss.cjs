const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const srv = http.createServer((q, r) => { fs.readFile(path.join(__dirname, "site", q.url.split("?")[0]), (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": "text/html; charset=utf-8" }); r.end(d); }); }).listen(8767);
(async () => {
  const br = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--no-sandbox"] });
  const p = await (await br.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await p.route(/jsdelivr/, (r) => r.abort());
  const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto("http://localhost:8767/clear/xss.html"); await p.waitForSelector(".home-title");
  for (const [type, mode] of [["practice", "practice"], ["league", "league"], ["tournament", "tournament"]]) {
    const tabs = await p.evaluate(([type, mode]) => {
      const P = (t) => `<img src=x onerror="window.__x=(window.__x||[]).concat('${t}')">"'><svg onload="window.__x=(window.__x||[]).concat('${t}')"></svg>`;
      let s; try { s = App.makeSample(type); } catch (e) { s = null; }
      if (!s) return null;
      s.mode = mode; s.name = P("event"); s.players.forEach((x, i) => { x.name = P("name"); x.school = P("school" + (i % 3)); x.pref = P("pref"); x.block = P("block"); });
      App.events()[s.id] = s; App.setCurrent(s.id); App.ui.view = "event"; App.render();
      return [...document.querySelectorAll('[data-action="tab"]')].map((b) => b.dataset.tab);
    }, [type, mode]);
    if (!tabs) { console.log("no sample", type); continue; }
    for (const t of tabs) { await p.click(`[data-action="tab"][data-tab="${t}"]`).catch(() => {}); await p.waitForTimeout(300);
      for (const a of ["auto-pairs", "auto", "auto-yes", "build", "build-yes", "first-round", "ask-create", "pround", "ask-create", "pround", "ask-create"]) { const b = await p.$(`[data-action="${a}"]`); if (b) { await b.click().catch(() => {}); await p.waitForTimeout(300); } } }
    await p.click('[data-action="home"]').catch(() => {}); await p.waitForTimeout(300);
    await (async()=>{})(); console.log(type, "tabs:", tabs.join(","), "rounds/matches:", await p.evaluate(() => { const e = App.ev() || {}; return JSON.stringify([ (e.rounds||[]).length, (e.leagues||[]).length, !!e.bracket ]); })); await p.click('[data-action="home"]').catch(() => {}); await p.waitForTimeout(300);
  }
  await p.evaluate(() => { try { App.doPrint && document.querySelector("#print-area"); } catch (e) {} });
  console.log("XSS fired:", JSON.stringify(await p.evaluate(() => [...new Set(window.__x || [])])));
  console.log("errors:", errs.slice(0, 5));
  await br.close(); srv.close();
})();
