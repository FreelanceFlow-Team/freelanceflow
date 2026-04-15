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
# Use --legacy-peer-deps to avoid npm 10.x exit handler bug
RUN npm ci --legacy-peer-deps --no-audit --prefer-offline

# Generate Prisma client (dummy URL just for codegen)
RUN cd apps/api && \
    DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    npx prisma generate

# Compile with SWC (avoids @nestjs/cli / ora / wcwidth issues entirely)
RUN cd apps/api && npm run build

# ─── Stage 2: production ───────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

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

# Copy Prisma schema (needed for db push at runtime)
COPY apps/api/prisma ./apps/api/prisma

# Copy startup script
COPY scripts/start.sh ./scripts/start.sh

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set proper permissions for the entire app directory
RUN chmod +x ./scripts/start.sh && \
    chown -R appuser:appgroup /app

USER appuser

WORKDIR /app/apps/api
EXPOSE 3010

CMD ["/app/scripts/start.sh"]