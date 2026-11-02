#!/usr/bin/env bash
# Builds a static, non-indexed copy of the site for sharing previews (e.g. Cloudflare Pages).
# Usage: tools/export-static.sh   → writes ~/Documents/emfc-website-preview.zip
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="$(mktemp -d)/emfc-preview"
rm -rf .output
NITRO_PRESET=node-server npx vite build
PORT=4789 node .output/server/index.mjs & SERVER=$!
trap 'kill $SERVER 2>/dev/null; rm -rf .output' EXIT
sleep 3
cp -R .output/public "$OUT"
python3 -I - "$OUT" <<'PY'
import os, re, sys, urllib.request
out, seen, todo = sys.argv[1], set(), ["/"]
while todo:
    p = todo.pop()
    if p in seen:
        continue
    seen.add(p)
    html = urllib.request.urlopen("http://localhost:4789" + p).read().decode()
    html = html.replace("<head>", '<head><meta name="robots" content="noindex, nofollow">', 1)
    d = os.path.join(out, p.strip("/"))
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w").write(html)
    todo += [h for h in re.findall(r'href="(/[a-z\-]*)"', html) if h not in seen]
print("pages:", sorted(seen))
PY
printf 'User-agent: *\nDisallow: /\n' > "$OUT/robots.txt"
printf '/*\n  X-Robots-Tag: noindex, nofollow\n' > "$OUT/_headers"
rm -f ~/Documents/emfc-website-preview.zip
(cd "$OUT" && zip -qr ~/Documents/emfc-website-preview.zip .)
echo "Wrote ~/Documents/emfc-website-preview.zip"
