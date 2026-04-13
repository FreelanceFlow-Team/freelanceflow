# ─── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY packages/types ./packages/types
COPY apps/api ./apps/api

RUN HUSKY=0 npm ci

# Generate Prisma client into apps/api/node_modules/.prisma/client
RUN cd apps/api && DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Build with nest from root node_modules
RUN cd apps/api && node /app/node_modules/@nestjs/cli/bin/nest.js build

# ─── Stage 2: production ──────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/package.json
COPY packages/types ./packages/types
COPY apps/api/package.json ./apps/api/package.json

RUN npm ci --omit=dev --ignore-scripts

# Copy built app
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY apps/api/prisma ./apps/api/prisma

# Copy Prisma generated client (overwrites any empty .prisma from npm ci)
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app/apps/api

USER appuser

EXPOSE 3001
CMD ["node", "dist/main"]
