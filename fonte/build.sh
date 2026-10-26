#!/bin/sh
# Gera as duas saídas a partir de fonte/: index.html (página do Claude) e docs/ (app instalável, GitHub Pages).
# Uso: sh fonte/build.sh   (na raiz do repositório)
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
python3 - "$ROOT" <<'PY'
import sys, hashlib, re
R = sys.argv[1]
t = open(f"{R}/fonte/app.html", encoding="utf-8").read()
core = open(f"{R}/fonte/core.js", encoding="utf-8").read()
foods = open(f"{R}/fonte/foods.json", encoding="utf-8").read().replace("</", "<\\/")
page = t.replace("__FOODS__", foods).replace("<script>__CORE__</script>", "<script>\n" + core + "\n</script>")
assert "__CORE__" not in page and "__FOODS__" not in page
open(f"{R}/index.html", "w", encoding="utf-8").write(page)

cut = page.index('<div class="app" id="app"></div>')
head, body = page[:cut], page[cut:]
ver = hashlib.sha1(page.encode()).hexdigest()[:10]
pwa_head = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="#0A0908">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<style>
:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
body{margin:0}
img{max-width:100%}
[hidden]{display:none!important}
html{-webkit-text-size-adjust:100%}
</style>
"""
pwa_tail = """
<script>
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
</script>
</body>
</html>
"""
open(f"{R}/docs/index.html", "w", encoding="utf-8").write(pwa_head + head + "</head>\n<body>\n" + body + pwa_tail)
sw = open(f"{R}/docs/sw.js", encoding="utf-8").read()
sw = re.sub(r'const VERSION = "[^"]*";', f'const VERSION = "{ver}";', sw)
open(f"{R}/docs/sw.js", "w", encoding="utf-8").write(sw)
print("versão", ver)
PY
sed -n '/^<script>$/,/^<\/script>$/p' "$ROOT/index.html" > /dev/null
node -e '
const fs=require("fs"); const html=fs.readFileSync(process.argv[1],"utf8");
const re=/<script>([\s\S]*?)<\/script>/g; let m, n=0;
while((m=re.exec(html))){ new Function(m[1]); n++; }
console.log("scripts sem erro de sintaxe:", n);' "$ROOT/index.html"
