# AI-Powered Education ERP & LMS

## Monorepo Structure

```
ai-lms/
├── apps/
│   ├── web/          ← Next.js 14 frontend
│   └── api/          ← Express.js backend
├── packages/
│   ├── database/     ← Prisma schema + migrations
│   ├── shared/       ← Shared types, Zod schemas
│   └── config/       ← Shared tooling configs
├── infra/
│   ├── docker/       ← Dockerfiles
│   └── nginx/        ← Nginx config
└── .github/
    └── workflows/    ← GitHub Actions CI/CD
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Start all services (requires Docker for DB)
docker-compose up -d
pnpm dev

# API runs at:  http://localhost:5000
# Web runs at:  http://localhost:3000
# pgAdmin at:   http://localhost:5050
```

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Node.js, Express, TypeScript, Clean Architecture
- **Database**: PostgreSQL + pgvector, Prisma ORM, Redis
- **AI**: OpenAI, LangChain, RAG, Embeddings
- **DevOps**: Docker, Turborepo, GitHub Actions

## Development

```bash
pnpm dev          # Run all apps in dev mode
pnpm build        # Build all apps
pnpm lint         # Lint all packages
pnpm typecheck    # Type-check all packages
pnpm test         # Run all tests
```
