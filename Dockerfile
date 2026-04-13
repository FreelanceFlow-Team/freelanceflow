FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production

# Install dependencies (ignore scripts to skip husky)
COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY packages/types ./packages/types
COPY apps/api ./apps/api

RUN npm ci --ignore-scripts

# Generate Prisma client into apps/api/generated/prisma
RUN cd apps/api && DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Build NestJS app
RUN cd apps/api && node /app/node_modules/@nestjs/cli/bin/nest.js build

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser
WORKDIR /app/apps/api

EXPOSE 3001
CMD ["node", "dist/main"]
