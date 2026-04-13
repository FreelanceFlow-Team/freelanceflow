# FreelanceFlow

Application de gestion d'activité freelance — facturation, clients, services.

## Stack

| Couche          | Technologie                   |
| --------------- | ----------------------------- |
| Frontend        | Next.js 16, React, TypeScript |
| Backend         | NestJS 11, TypeScript         |
| Base de données | PostgreSQL 17, Prisma ORM     |
| Build           | Turborepo, npm workspaces     |
| Tests           | Vitest                        |
| CI/CD           | GitHub Actions                |
| Déploiement     | Vercel (web) · Railway (api)  |
| Conteneurs      | Docker, Docker Compose        |

## Équipe

| Rôle      | Responsabilité                                          |
| --------- | ------------------------------------------------------- |
| Fullstack | `apps/api` + `apps/web`                                 |
| DevOps    | `.github/workflows`, `docker-compose.yml`, `Dockerfile` |
| Shared    | `packages/types`                                        |

## URLs

| Environnement | Frontend                         | API                                      |
| ------------- | -------------------------------- | ---------------------------------------- |
| Production    | https://freelanceflow.vercel.app | https://api.freelanceflow.up.railway.app |
| Local         | http://localhost:3000            | http://localhost:3001                    |

## Démarrage local

### Prérequis

- Node.js >= 22
- npm >= 10
- Docker & Docker Compose

### Installation

```bash
git clone https://github.com/<org>/freelanceflow.git
cd freelanceflow
npm install
```

### Variables d'environnement

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

Éditer `apps/api/.env` : renseigner `JWT_SECRET` et `DATABASE_URL`.

### Démarrage avec Docker

```bash
docker compose up
```

Lance PostgreSQL, l'API (port 3001) et le frontend (port 3000).

### Démarrage sans Docker

```bash
# Terminal 1 — base de données
docker compose up db

# Terminal 2 — API
cd apps/api
npx prisma migrate dev
npm run dev

# Terminal 3 — Frontend
cd apps/web
npm run dev
```

### Commandes utiles

```bash
npm run build          # Build toutes les apps (Turborepo)
npm run lint           # ESLint sur tout le monorepo
npm run format:check   # Vérification Prettier
npm run test           # Tests Vitest (API)

# Prisma
npx prisma migrate dev   # Créer une migration
npx prisma studio        # Interface graphique base de données
```

## Structure du monorepo

```
freelanceflow/
├── apps/
│   ├── api/          # Backend NestJS
│   └── web/          # Frontend Next.js
├── packages/
│   └── types/        # Types TypeScript partagés
├── .github/
│   └── workflows/    # CI (ci.yml) + CD (cd.yml)
├── docker-compose.yml
└── turbo.json
```

## Conventions

- Commits : [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `chore`, `ci`, `docs`…)
- Branches : `feature/<nom>` et `fix/<nom>` → `develop` → `main`
- PRs : toujours vers `main` depuis `develop` ou une branche feature
