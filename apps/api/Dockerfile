# ─── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY packages/types ./packages/types
COPY apps/api ./apps/api

RUN HUSKY=0 npm ci

# Generate Prisma client
RUN cd apps/api && DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Compile with SWC directly (bypasses @nestjs/cli wcwidth issue)
RUN cd apps/api && npx swc src -d dist --copy-files --strip-leading-paths

# ─── Stage 2: production ──────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/package.json
COPY packages/types ./packages/types
COPY apps/api/package.json ./apps/api/package.json

RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/generated ./apps/api/generated
COPY apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3001
CMD ["node", "dist/main"]
