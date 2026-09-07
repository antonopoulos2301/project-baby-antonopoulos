FROM oven/bun:1-slim

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY prisma ./prisma
COPY prisma.config.ts ./

COPY src ./src
COPY tsconfig.json ./

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    bunx prisma generate

COPY docker-entrypoint.sh ./

RUN chmod +x /app/docker-entrypoint.sh

ENV NODE_ENV=production

EXPOSE 3000

CMD ["/bin/sh", "/app/docker-entrypoint.sh"]