#!/bin/sh

set -e

echo "🔄 Aplicando migrations do Prisma..."

bunx prisma migrate deploy

echo "✅ Migrations aplicadas."

echo "🚀 Iniciando API..."

exec bun run start