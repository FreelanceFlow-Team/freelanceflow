FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV RAILWAY_ENVIRONMENT=true

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY packages/types ./packages/types
COPY apps/api ./apps/api

# Remove prepare script to avoid husky running during npm ci
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json'));delete p.scripts.prepare;fs.writeFileSync('package.json',JSON.stringify(p,null,2));"

RUN npm ci

# Generate Prisma client
RUN cd apps/api && DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Build NestJS using local nest binary
RUN cd apps/api && ./node_modules/.bin/nest build

RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser
WORKDIR /app/apps/api

EXPOSE 3001
CMD ["node", "dist/main"]
