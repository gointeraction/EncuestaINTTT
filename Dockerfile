# syntax=docker/dockerfile:1
# =============================================================================
# EncuestaINTTT — imagen autocontenida (Next.js 16 standalone + Prisma 6)
# Targets: base -> deps -> builder -> runner (app) | migrator (one-shot schema)
# =============================================================================

# ---------- base ----------
FROM node:24-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# ---------- deps (full install: Prisma CLI + tsx are needed at runtime by migrate) ----------
FROM base AS deps
# The schema is not present yet in this stage; skip the postinstall generate.
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
COPY package.json package-lock.json ./
RUN npm ci

# ---------- builder ----------
FROM base AS builder
# NEXT_PUBLIC_* are inlined into the client bundle at BUILD time.
ARG NEXT_PUBLIC_APP_URL="https://encuesta.intt.gob.ve"
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY \
    NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- runner (the application) ----------
FROM base AS runner
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma runtime engine + client (the standalone trace can miss the binary)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
# Local fallback store (resilience path reads/writes db/*.json)
COPY --from=builder --chown=nextjs:nodejs /app/db ./db
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

# ---------- migrator (one-shot: schema sync + optional seed/backup import) ----------
FROM deps AS migrator
ENV NODE_ENV=production
COPY prisma ./prisma
COPY scripts ./scripts
COPY src/lib ./src/lib
COPY db ./db
COPY package.json ./
COPY deploy/migrate-entrypoint.sh /usr/local/bin/migrate-entrypoint.sh
RUN chmod +x /usr/local/bin/migrate-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/migrate-entrypoint.sh"]
