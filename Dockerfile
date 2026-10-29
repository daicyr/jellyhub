FROM oven/bun:1.4.4 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN bun run build
RUN bun build src/lib/db/migrate.ts --target bun --outdir ./.output

FROM oven/bun:1.4.4-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/drizzle/postgresql ./drizzle/postgresql

USER bun
EXPOSE 3000/tcp

ENTRYPOINT [ "sh", "-c", "bun .output/migrate.js && exec bun --bun .output/server/index.mjs" ]
