// build.ps1 と同じ作り方を Node で行う(PowerShell が無い環境用)
// 使い方: node build.mjs        → clear-new/index.html と clear-new/artifact.html を作る
//         node build.mjs --root → このフォルダの index.html を直接上書きする(artifact.html は clear-new/ に作る)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, "src"), out = join(root, "clear-new");
mkdirSync(out, { recursive: true });
const rd = (n) => readFileSync(join(src, n), "utf8");
const css = rd("style.css"), core = rd("core.js"), a = rd("app-base.js"), b = rd("app-league.js"), c = rd("app-practice.js"), st = rd("app-stats.js"), d = rd("app-roster.js"), cloud = rd("cloud.js"), share = rd("share.js"), qr = rd("vendor-qrcode.js"), ash = rd("app-share.js"), head = rd("head.html").trim();

// 公開ページ用:ログイン(Supabase)の部品を入れる。claude.ai 版には入れない
const page = (withCloud) => `<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
${head}
<style>
${css}
</style></head>
<body>
<div class="bg-glow"></div><div class="bg-ring"></div>
<div id="app"></div><div id="toast" class="toast" role="status" aria-live="polite"></div><div id="print-area"></div>
<script>
${core}
</script>
${withCloud ? `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
${cloud}
${share}
</script>
<script>
${qr}
</script>
` : ""}<script>
${a}
${b}
${c}
${st}
${d}
${ash}
App.boot();
</script>
</body></html>`;

const html = page(true);
const target = process.argv.includes("--root") ? join(root, "index.html") : join(out, "index.html");
writeFileSync(target, html);
console.log("built " + Buffer.byteLength(html) + " bytes -> " + target);
const art = page(false)
  .replace("<!doctype html>", "")
  .replace('<html lang="ja"><head><meta charset="utf-8">', "")
  .replace('<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">', '<meta name="claude:viewport-fit-sides" content="cover">')
  .replace("</style></head>", "</style>")
  .replace("<body>", "")
  .replace("</body></html>", "")
  .trim();
writeFileSync(join(out, "artifact.html"), art);
// claude.ai に出し直すとき用:<!DOCTYPE html> から始まる形(Artifact の publish はこの形でないと受け付けない)
writeFileSync(join(out, "artifact-doc.html"), '<!DOCTYPE html>\n<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n' + art.replace('<div class="bg-glow">', '</head><body>\n<div class="bg-glow">') + "\n</body></html>\n");
console.log("artifact " + Buffer.byteLength(art) + " bytes");
