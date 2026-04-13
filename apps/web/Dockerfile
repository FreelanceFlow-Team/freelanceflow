# ─── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN npm ci --workspace=@freelanceflow/web --include-workspace-root

# ─── Stage 2: development ─────────────────────────────────────────────────────
FROM deps AS development
WORKDIR /app

COPY packages/types ./packages/types
COPY apps/web ./apps/web

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ─── Stage 3: builder ─────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

COPY packages/types ./packages/types
COPY apps/web ./apps/web

WORKDIR /app/apps/web
RUN npm run build

# ─── Stage 4: production ──────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /app/apps/web/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=appuser:appgroup /app/apps/web/public ./apps/web/public

USER appuser

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
