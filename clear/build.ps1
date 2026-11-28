# build: src/* -> clear-new/index.html (ASCII comments only; PS 5.1 reads UTF-8 without BOM as ANSI)
param([string]$root = (Get-Location).Path)
$src = Join-Path $root "src"
$out = Join-Path $root "clear-new"
New-Item -ItemType Directory -Force $out | Out-Null
$rd = { param($n) [IO.File]::ReadAllText((Join-Path $src $n), [Text.Encoding]::UTF8) }
$css = & $rd "style.css"; $core = & $rd "core.js"; $a = & $rd "app-base.js"; $b = & $rd "app-league.js"; $c = & $rd "app-practice.js"; $st = & $rd "app-stats.js"; $d = & $rd "app-roster.js"; $cloud = & $rd "cloud.js"; $share = & $rd "share.js"; $qr = & $rd "vendor-qrcode.js"; $ash = & $rd "app-share.js"; $head = (& $rd "head.html").Trim()
$page = @"
<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
$head
<style>
$css
</style></head>
<body>
<div class="bg-glow"></div><div class="bg-ring"></div>
<div id="app"></div><div id="toast" class="toast" role="status" aria-live="polite"></div><div id="print-area"></div>
<script>
$core
</script>
<!--CLOUD-->
<script>
$a
$b
$c
$st
$d
$ash
App.boot();
</script>
</body></html>
"@
# public page: login (Supabase) parts. claude.ai version does not get them
$cloudTags = "<script src=`"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`"></script>`n<script>`n" + $cloud + "`n" + $share + "`n</script>`n<script>`n" + $qr + "`n</script>"
$html = $page.Replace("<!--CLOUD-->", $cloudTags)
$plain = $page.Replace("<!--CLOUD-->`n", "").Replace("<!--CLOUD-->`r`n", "")
[IO.File]::WriteAllText((Join-Path $out "index.html"), $html, (New-Object Text.UTF8Encoding $false))
"built " + (Get-Item (Join-Path $out "index.html")).Length + " bytes"
# artifact variant: no doctype/html/head/body, title + style first
$art = $plain.Replace("<!doctype html>", "").Replace('<html lang="ja"><head><meta charset="utf-8">', "").Replace('<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">', '<meta name="claude:viewport-fit-sides" content="cover">').Replace("</style></head>", "</style>").Replace("<body>", "").Replace("</body></html>", "")
[IO.File]::WriteAllText((Join-Path $out "artifact.html"), $art.Trim(), (New-Object Text.UTF8Encoding $false))
"artifact " + (Get-Item (Join-Path $out "artifact.html")).Length + " bytes"
