#!/usr/bin/env bash
# Build único na Vercel: site (Vite) + API (Express) como função serverless.
# Gera .vercel/output no formato Build Output API v3.
set -euo pipefail

FRONT="$(cd "$(dirname "$0")/.." && pwd)"
BACK="$(cd "$FRONT/../backend" && pwd)"
OUT="$FRONT/.vercel/output"
FUNC="$OUT/functions/api.func"

command -v bun >/dev/null 2>&1 || npm install -g bun >/dev/null

echo "▶ Site (Vite)"
cd "$FRONT"
npm run build

echo "▶ API: dependências + Prisma"
cd "$BACK"
bun install --frozen-lockfile
# o generate não precisa de banco de verdade, só de uma URL qualquer
DATABASE_URL="${DATABASE_URL:-postgresql://u:p@localhost:5432/db}" bunx prisma generate

if [ -n "${DATABASE_URL:-}" ]; then
  echo "▶ Aplicando migrations no banco"
  bunx prisma migrate deploy
else
  echo "⚠ DATABASE_URL não definida: migrations não aplicadas"
fi

echo "▶ Montando .vercel/output"
rm -rf "$OUT"
mkdir -p "$OUT/static" "$FUNC"
cp -R "$FRONT/dist/." "$OUT/static/"

bun build "$BACK/src/vercel.ts" \
  --target=node --format=esm \
  --external sharp \
  --outfile "$FUNC/index.mjs"

# sharp (nativo) instalado à parte para o Linux x64 da Vercel.
# Se falhar, a API funciona do mesmo jeito (só não reotimiza a imagem).
SHARP_VERSION="$(node -p "require('$BACK/node_modules/sharp/package.json').version")"
(
  cd "$FUNC"
  echo '{"type":"module","private":true}' > package.json
  npm install --no-save --no-package-lock --omit=dev --no-audit --no-fund \
    --os=linux --cpu=x64 --libc=glibc "sharp@$SHARP_VERSION" >/dev/null
) || echo "⚠ sharp não instalado na função (seguindo sem ele)"

cat > "$FUNC/.vc-config.json" <<'JSON'
{
  "runtime": "nodejs22.x",
  "handler": "index.mjs",
  "launcherType": "Nodejs",
  "shouldAddHelpers": false,
  "maxDuration": 30
}
JSON

cat > "$OUT/config.json" <<'JSON'
{
  "version": 3,
  "routes": [
    { "src": "^/api/(.*)$", "dest": "/api?__p=$1" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
JSON

echo "✅ Build pronto"
