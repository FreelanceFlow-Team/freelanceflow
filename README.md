# FreelanceFlow

Application de gestion d'activité freelance — facturation, clients, services.

## Stack

| Couche          | Technologie                                      |
| --------------- | ------------------------------------------------ |
| Frontend        | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend         | NestJS 11, TypeScript, Passport JWT              |
| Base de données | PostgreSQL 17, Prisma ORM 6                      |
| Validation      | class-validator, class-transformer               |
| Types partagés  | `@freelanceflow/types` (packages/types)          |
| Build           | Turborepo, npm workspaces                        |
| Tests           | Vitest, autocannon (load)                        |
| Documentation   | Swagger / OpenAPI (`/api/docs`)                  |
| CI/CD           | GitHub Actions (ci.yml + cd.yml)                 |
| Déploiement     | Vercel (web) · Railway (api)                     |
| Conteneurs      | Docker, Docker Compose                           |

## URLs

| Environnement | Frontend                         | API                                      | Swagger                                           |
| ------------- | -------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| Production    | https://freelanceflow.vercel.app | https://api.freelanceflow.up.railway.app | https://api.freelanceflow.up.railway.app/api/docs |
| Local         | http://localhost:3000            | http://localhost:3010                    | http://localhost:3010/api/docs                    |

## API — Endpoints

| Méthode  | Route                      | Auth | Description                     |
| -------- | -------------------------- | ---- | ------------------------------- |
| `GET`    | `/api/health`              |      | Health check                    |
| `POST`   | `/api/auth/register`       |      | Inscription                     |
| `POST`   | `/api/auth/login`          |      | Connexion → JWT                 |
| `GET`    | `/api/clients`             | JWT  | Liste des clients               |
| `POST`   | `/api/clients`             | JWT  | Créer un client                 |
| `PATCH`  | `/api/clients/:id`         | JWT  | Modifier un client              |
| `DELETE` | `/api/clients/:id`         | JWT  | Supprimer un client             |
| `GET`    | `/api/services`            | JWT  | Liste des services              |
| `POST`   | `/api/services`            | JWT  | Créer un service                |
| `PATCH`  | `/api/services/:id`        | JWT  | Modifier un service             |
| `DELETE` | `/api/services/:id`        | JWT  | Supprimer un service            |
| `GET`    | `/api/invoices`            | JWT  | Liste des factures              |
| `POST`   | `/api/invoices`            | JWT  | Créer une facture (calcul auto) |
| `PATCH`  | `/api/invoices/:id/status` | JWT  | Changer le statut               |
| `DELETE` | `/api/invoices/:id`        | JWT  | Supprimer (draft uniquement)    |

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

Variables requises dans `apps/api/.env` :

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/freelanceflow_dev"
JWT_SECRET="<secret-long-et-aléatoire>"
PORT=3010
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

### Démarrage avec Docker

```bash
docker compose up
```

Lance PostgreSQL, l'API (port 3010) et le frontend (port 3000).

### Démarrage sans Docker

```bash
# Terminal 1 — base de données
docker compose up db

# Terminal 2 — API
cd apps/api
npx prisma migrate dev --name init
npm run dev

# Terminal 3 — Frontend
cd apps/web
npm run dev
```

### Commandes utiles

```bash
# Monorepo (racine)
npm run build          # Build toutes les apps via Turborepo
npm run lint           # ESLint sur tout le monorepo
npm run format:check   # Vérification Prettier
npm run test           # Tests unitaires Vitest

# API uniquement
cd apps/api
npm run typecheck      # Vérification TypeScript
npm run test:cov       # Tests + coverage
npm run test:load      # Tests de charge autocannon (serveur requis)

# Prisma
npx prisma migrate dev --name <nom>   # Créer une migration
npx prisma studio                     # Interface graphique DB
npx prisma generate                   # Régénérer le client Prisma
```

## Structure du monorepo

```
freelanceflow/
├── apps/
│   ├── api/                    # Backend NestJS 11
│   │   ├── src/
│   │   │   ├── auth/           # Register, Login, JWT strategy
│   │   │   ├── clients/        # CRUD clients
│   │   │   ├── services/       # CRUD services (prestations)
│   │   │   ├── invoices/       # CRUD factures + numérotation FF-YYYY-NNN
│   │   │   ├── pdf/            # Génération PDF (@react-pdf/renderer)
│   │   │   ├── prisma/         # PrismaService + PrismaModule (@Global)
│   │   │   └── common/         # Guards, decorators, filters
│   │   └── prisma/
│   │       └── schema.prisma   # User, Client, Service, Invoice, InvoiceLine
│   └── web/                    # Frontend Next.js 16
├── packages/
│   └── types/                  # Types TypeScript partagés (@freelanceflow/types)
│       └── src/
│           ├── auth.types.ts
│           ├── client.types.ts
│           ├── service.types.ts
│           └── invoice.types.ts
├── .github/
│   └── workflows/
│       ├── ci.yml              # check-branch, commitlint, lint, test, build
│       └── cd.yml              # release semver, GHCR, Railway, Vercel
├── docker-compose.yml          # db (postgres:17), api, web
└── turbo.json
```

## Conventions

### Commits

Format [Conventional Commits](https://www.conventionalcommits.org/) strict :

```
<type>: <sujet en minuscules>
```

Types autorisés : `feat`, `fix`, `chore`, `test`, `docs`, `ci`, `refactor`, `style`, `perf`, `revert`

### Branches

```
main          ← production (tags releases automatiques)
develop       ← branche de développement principale
feature/<nom> ← nouvelle fonctionnalité
fix/<nom>     ← correction de bug
hotfix/<nom>  ← correctif urgent sur prod
```

Les PRs vers `main` doivent venir de `develop`, `feature/*`, `fix/*` ou `hotfix/*`.

### Secrets GitHub requis

| Secret          | Usage                    |
| --------------- | ------------------------ |
| `RAILWAY_TOKEN` | Déploiement API          |
| `VERCEL_TOKEN`  | Déploiement Web          |
| `GITHUB_TOKEN`  | Automatique (GHCR, tags) |
