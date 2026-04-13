# ─── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/package.json
COPY apps/api/package.json ./apps/api/package.json

RUN HUSKY=0 npm ci --workspace=@freelanceflow/api --include-workspace-root

# ─── Stage 2: development ─────────────────────────────────────────────────────
FROM deps AS development
WORKDIR /app

COPY packages/types ./packages/types
COPY apps/api ./apps/api

WORKDIR /app/apps/api
CMD ["npm", "run", "dev"]

# ─── Stage 3: builder ─────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

COPY packages/types ./packages/types
COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN npm run build

# ─── Stage 4: production ──────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/package.json
COPY apps/api/package.json ./apps/api/package.json

RUN HUSKY=0 npm ci --workspace=@freelanceflow/api --include-workspace-root --omit=dev

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/generated ./apps/api/generated
COPY apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3001
CMD ["node", "dist/main"]
