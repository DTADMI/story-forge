# StoryForge — Local Development Setup

## Prerequisites

- Node.js >= 24.12.0
- pnpm >= 10.26.0
- Docker Desktop (for local Supabase + Redis)
- Supabase CLI (`npm install -g supabase`)

## Quick Start

```bash
# Clone and enter the project
cd story-forge

# Install dependencies
pnpm install

# Start local services (Supabase + Redis via Docker)
pnpm docker:up
pnpm supabase:start

# Copy and configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase URL + keys from `pnpm supabase:status`

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed sample data (optional)
pnpm seed

# Start dev server
pnpm dev
```

Or use the combined command:
```bash
pnpm dev:local    # starts Docker, Supabase, and Next.js dev server
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `pnpm supabase:status` → API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `pnpm supabase:status` → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `pnpm supabase:status` → service_role key |
| `DATABASE_URL` | Supabase Postgres connection string |
| `UPSTASH_REDIS_URL` | Upstash console (or leave empty for no-op fallback) |
| `UPSTASH_REDIS_TOKEN` | Upstash console |
| `OPENROUTER_API_KEY` | OpenRouter (optional, for AI features) |
| `STRIPE_SECRET_KEY` | Stripe dashboard (optional, for payments) |

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript compiler check |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |
| `pnpm format` | Format code with Prettier |
| `pnpm format:check` | Check formatting |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm seed` | Seed database with sample data |
| `pnpm docker:up` | Start local Supabase + Redis containers |
| `pnpm docker:down` | Stop Docker containers |
| `pnpm supabase:start` | Start Supabase local |
| `pnpm supabase:status` | Show Supabase status |

## Architecture

- **Frontend**: Next.js 16 App Router + React 19.2 + Tailwind CSS 4
- **Auth**: Supabase Auth (email/password + OAuth)
- **Database**: PostgreSQL on Supabase, accessed via Prisma ORM
- **Cache**: Upstash Redis (feature flags, rate limiting)
- **Storage**: Supabase Storage (media + private-media buckets)
- **Feature flags**: `lib/flags.ts` — Redis-backed with DB fallback

## Project Structure

```
story-forge/
├── app/              ← Pages, layouts, API route handlers
│   ├── (main)/       ← Protected routes (requires auth)
│   ├── (admin)/      ← Admin dashboard routes
│   ├── api/          ← API route handlers (76 routes)
│   └── (auth)/       ← Auth pages (signin, signup)
├── components/       ← UI components (ui/, editor/, ai/, world/, social/)
├── lib/              ← Shared logic (prisma, supabase, redis, flags, cache, etc.)
├── packages/
│   └── ai-core/      ← Shared AI package (OpenRouter adapter)
├── prisma/           ← Prisma schema + migrations
├── supabase/         ← Supabase migrations (7 files)
│   └── migrations/   ← SQL migration files
├── scripts/          ← Build, migration, agent tools
├── messages/         ← i18n translations (en.json, fr.json)
├── public/           ← Static assets (PWA icons, service worker)
└── docs/             ← Technical documentation
```

## Running Tests

```bash
pnpm test:run        # Run all tests once
pnpm test            # Watch mode
pnpm test:all        # Typecheck + tests
```

Tests use Vitest with React Testing Library and jsdom.

## Database Migrations

Prisma Migrate manages schema evolution:
```bash
pnpm db:migrate      # Apply pending migrations
pnpm db:generate     # Regenerate Prisma client
```

Supabase SQL migrations handle RLS, triggers, and storage policies:
```bash
# Apply a Supabase migration manually:
psql "$DATABASE_URL" -f supabase/migrations/007_add_rls_for_prisma_tables.sql

# Rollback:
psql "$DATABASE_URL" -f scripts/007_add_rls_for_prisma_tables.rollback.sql
```

## Feature Flags

Flags are managed in `lib/flags.ts` and can be toggled via:
- Environment variables: `NEXT_PUBLIC_FEATURE_*` (prefix)
- Upstash Redis: key `storyforge:feature_flags`
- Admin dashboard: `/admin/flags`

See `docs/technical/feature-flags-testing.md` for details.
