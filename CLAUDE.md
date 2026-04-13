# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FreelanceFlow is a French-language freelance activity management app (invoicing, clients, services). It's a **Turborepo monorepo** with:

- `apps/api` — NestJS 11 backend (port 3001)
- `apps/web` — Next.js 16 frontend (port 3000)
- `packages/types` — Shared TypeScript types (`@freelanceflow/types`)

**Requirements:** Node >=22.11.0, npm >=10.0.0

## Commands

### Root (monorepo-wide via Turborepo)

```bash
npm install          # Install all dependencies
npm run dev          # Start all apps in watch mode
npm run build        # Build all apps
npm run lint         # ESLint + TypeScript check across all packages
npm run format:check # Prettier validation
npm run test         # Unit tests (Vitest)
```

### Development startup

```bash
# Option A: Full Docker
docker compose up

# Option B: Manual (3 terminals)
docker compose up db                        # Terminal 1: PostgreSQL only
cd apps/api && npm run dev                  # Terminal 2: API (after DB is up)
cd apps/web && npm run dev                  # Terminal 3: Frontend
```

### API-specific (`apps/api`)

```bash
npm run typecheck    # TypeScript verification
npm run test:cov     # Tests with coverage
npm run test:load    # Load testing via autocannon
```

### Database

```bash
npx prisma migrate dev --name <name>  # Create and apply migration
npx prisma generate                   # Regenerate Prisma client after schema change
npx prisma studio                     # GUI database explorer
```

### Environment setup (first time)

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

## Architecture

### Data model

```
User → Client (many)
User → Service (many)
User → Invoice (many) → InvoiceLine (many)
```

All resources are user-scoped. Every API endpoint (except auth) requires a JWT bearer token, and queries filter by the authenticated user's ID.

### API (`apps/api/src/`)

NestJS modules, one per domain:

- `auth/` — JWT register/login, returns token
- `clients/` — Client CRUD
- `services/` — Service (work packages) CRUD; unit: `hour | day | flat`
- `invoices/` — Invoice CRUD + auto-numbering (`FF-YYYY-NNN`) + status transitions (`draft → sent → paid | overdue | cancelled`)
- `pdf/` — Invoice PDF generation via `@react-pdf/renderer`
- `prisma/` — Global `PrismaService` / `PrismaModule` (imported everywhere that needs DB)
- `common/` — JWT guard, `@CurrentUser()` decorator, global exception filter

Global API prefix: `/api`. Swagger docs: `http://localhost:3001/api/docs`.

### Frontend (`apps/web/src/`)

- `app/` — Next.js App Router pages
- `features/` — Feature modules (auth, clients, services, invoices) with co-located components and hooks
- `lib/` — API client and utilities
- `providers/` — TanStack Query and other React context providers

### Shared types (`packages/types/src/`)

Exported as `@freelanceflow/types`. Contains interfaces for `auth`, `client`, `service`, and `invoice` consumed by both apps. Modify these when changing API contracts.

## Conventions

### Commits (enforced by commitlint + Husky)

```
<type>: <lowercase subject>
```

Types: `feat`, `fix`, `chore`, `test`, `docs`, `ci`, `refactor`, `style`, `perf`, `revert`

### Branch naming

- `feature/<name>` — new features
- `fix/<name>` — bug fixes
- `hotfix/<name>` — urgent production fixes
- PRs must target `main` and come from one of the above or `develop`

### API conventions

- All protected routes use `@UseGuards(JwtAuthGuard)` and `@CurrentUser()` to extract the user
- DTOs live alongside their module and use `class-validator` decorators
- Prisma queries always include `where: { userId }` for data isolation

## Docker & Deployment

### Dockerfiles

- `Dockerfile` (racine) — image API, utilisée par Railway (`railway.json`)
- `apps/api/Dockerfile` — image API, utilisée par CI/CD GitHub Actions et `docker-compose`
- `apps/web/Dockerfile` — image Web (Next.js standalone), utilisée par CI/CD et `docker-compose`

Les deux Dockerfiles API sont identiques (même contenu, contexte build = racine du monorepo).

### Prisma

Le client Prisma est généré dans `apps/api/generated/prisma/`. Il doit être généré avant tout build :

```bash
cd apps/api && npx prisma generate
```

En Docker, le builder génère le client avec une `DATABASE_URL` factice, puis le copie dans le stage production.

### Variables d'environnement de production

- **API** : `DATABASE_URL`, `JWT_SECRET`, `PORT`, `FRONTEND_URL`, `NODE_ENV`
- **Web** : `NEXT_PUBLIC_API_URL` — doit être passée en `--build-arg` lors du build Docker car Next.js l'inline au build-time

## CI/CD

- **CI** (PRs to main): commitlint → lint → API tests (avec service PostgreSQL) → build Docker (sans push)
- **CD** (push to main): semver release → images Docker pushées sur GHCR → deploy Railway (API) + Vercel (Web)
