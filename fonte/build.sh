# Gera duas saídas: a página do Claude (index.html) e o app instalável (site/)
B=/tmp/claude-0/-home-user/1deeec01-ea79-57e4-9def-c57450e8f0d6/scratchpad/build
O=/home/user/nutri-pratico
python3 - "$B" "$O" <<'PY'
import sys, hashlib
B, O = sys.argv[1], sys.argv[2]
t = open(f"{B}/app.html").read(); d = open(f"{B}/foods.json").read().replace("</", "<\\/")
page = t.replace("__FOODS__", d)
open(f"{O}/index.html", "w").write(page)

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
open(f"{O}/docs/index.html", "w").write(pwa_head + head + "</head>\n<body>\n" + body + pwa_tail)
sw = open(f"{O}/docs/sw.js").read()
import re
sw = re.sub(r'const VERSION = "[^"]*";', f'const VERSION = "{ver}";', sw)
open(f"{O}/docs/sw.js", "w").write(sw)
print("version", ver)
PY
sed -n '/<script>/,/<\/script>/p' $O/index.html | sed '1d;$d' > $B/app.js && node --check $B/app.js && echo SYNTAX_OK
