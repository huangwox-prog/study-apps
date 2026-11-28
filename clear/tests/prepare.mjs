// テスト用のページを tests/site/clear/ に作る(node tests/prepare.mjs)
// - cloud.html : ログインあり(偽の Supabase = mock-supabase.js)
// - plain.html / new.html / xss.html : ログインなし(今までどおり)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url)), root = join(here, ".."), out = join(here, "site", "clear");
mkdirSync(out, { recursive: true });
const cloudPath = join(root, "src", "cloud.js"), real = readFileSync(cloudPath, "utf8");
const build = () => { execSync("node build.mjs", { cwd: root }); return readFileSync(join(root, "clear-new", "index.html"), "utf8"); };
try {
  writeFileSync(cloudPath, real.replace(/const SUPABASE_URL = "[^"]*";/, 'const SUPABASE_URL = "https://x.supabase.co";').replace(/const SUPABASE_ANON_KEY = "[^"]*";/, 'const SUPABASE_ANON_KEY = "test";'));
  const cloudHtml = build();
  writeFileSync(join(out, "cloud.html"), cloudHtml.replace('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>', '<script src="/mock-supabase.js"></script>'));
  // remote.html: mock-server.cjs につなぐ版(何台のブラウザからでも同じデータ)
  writeFileSync(join(out, "remote.html"), cloudHtml.replace('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>', '<script src="/mock-supabase-remote.js"></script>'));
  writeFileSync(cloudPath, real.replace(/const SUPABASE_URL = "[^"]*";/, 'const SUPABASE_URL = "";'));
  const plain = build();
  for (const n of ["plain", "new", "xss"]) writeFileSync(join(out, n + ".html"), plain);
} finally { writeFileSync(cloudPath, real); execSync("node build.mjs", { cwd: root }); }
copyFileSync(join(here, "mock-supabase.js"), join(here, "site", "mock-supabase.js"));
copyFileSync(join(here, "mock-supabase-remote.js"), join(here, "site", "mock-supabase-remote.js"));
console.log("テスト用のページを作りました");
