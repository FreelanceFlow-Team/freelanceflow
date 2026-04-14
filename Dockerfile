# ─── Stage 1: builder ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Copy manifests first (layer cache)
COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

# Remove prepare script so husky never runs during npm ci
RUN node -e "\
  const fs=require('fs');\
  const p=JSON.parse(fs.readFileSync('package.json'));\
  delete p.scripts.prepare;\
  fs.writeFileSync('package.json',JSON.stringify(p,null,2));"

# Copy source
COPY packages/types ./packages/types
COPY apps/api ./apps/api

# Stub for apps/web so npm workspaces resolves all dependencies correctly
RUN mkdir -p apps/web/src && echo '{}' > apps/web/tsconfig.json

# Install all deps (dev included — needed for SWC + Prisma CLI)
RUN npm ci

# Generate Prisma client (dummy URL just for codegen)
RUN cd apps/api && \
    DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    npx prisma generate

# Compile with SWC (avoids @nestjs/cli / ora / wcwidth issues entirely)
RUN cd apps/api && npm run build

# ─── Stage 2: production ───────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

# Cache buster - change to force rebuild
ARG CACHE_BUST=v2
ENV NODE_ENV=production

# Copy manifests
COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

# Remove prepare script so husky never runs during npm ci
RUN node -e "\
  const fs=require('fs');\
  const p=JSON.parse(fs.readFileSync('package.json'));\
  delete p.scripts.prepare;\
  fs.writeFileSync('package.json',JSON.stringify(p,null,2));"

# Stub for apps/web so npm workspaces resolves all dependencies correctly
RUN mkdir -p apps/web/src && echo '{}' > apps/web/tsconfig.json

# Install production deps only
RUN npm ci --omit=dev

# Copy compiled output + Prisma client from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/generated ./apps/api/generated
COPY --from=builder /app/packages/types ./packages/types

# Copy Prisma schema (needed for migrate deploy at runtime)
COPY apps/api/prisma ./apps/api/prisma

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

WORKDIR /app/apps/api
EXPOSE 3001

# v2: Sync schema to DB then start
CMD ["sh", "-c", "echo 'Running prisma db push...' && npx prisma db push --skip-generate --accept-data-loss 2>&1 && echo 'DB sync done' && node dist/main"]
