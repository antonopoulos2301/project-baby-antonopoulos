FROM oven/bun:1-slim

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY .env.example ./.env.example

COPY src ./src

# Caso seu Prisma Client seja gerado para ../generated/prisma
COPY tsconfig.json ./

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    bunx prisma generate

ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "run", "start"]