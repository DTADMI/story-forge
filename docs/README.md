# Story Forge — Documentation

> **Owner**: Nebula Forge Digital Studio  
> **Last Updated**: 2026-08-20  

## Overview

Story Forge is a collaborative writing platform with AI-powered assistance, world-building tools, and real-time co-authoring. Next.js 16 App Router on Vercel with Supabase (Auth, DB, Storage, Realtime), Prisma ORM (30 models), Upstash Redis, and Neo4j graph database.

## Quick Links

| Document | Content |
|---|---|
| [Action Plan](action-plan.md) | Gap tracking, priorities, roadmap |
| [StoryForge Documentation](story-forge-documentation.md) | Product overview and feature guide |
| [Architecture & Security](architecture-security.md) | Threat model, RBAC, data flow |
| [Database Architecture](database-architecture-analysis.md) | Prisma + Supabase + Neo4j hybrid analysis |
| [Realtime Collaboration](realtime-collaboration-research.md) | Yjs + Supabase Realtime architecture |
| [Feature Recommendations](feature-recommendations.md) | Prioritized feature backlog |
| [Dependency Audit](dependency-audit.md) | Package inventory and upgrade status |
| [Technical Docs](technical/) | Performance, encoding, feature flags, i18n |

## Architecture

```
story-forge/
├── app/                    ← Next.js 16 App Router
│   ├── (admin)/            ← Admin dashboard, flags, moderation
│   ├── (auth)/             ← Sign in, sign up, reset password
│   └── (main)/             ← Dashboard, projects, groups, competitions, messages
├── components/             ← UI components (editor, AI, world-building, social)
├── hooks/                  ← Custom React hooks
├── lib/                    ← Core logic
│   ├── flags.ts            ← Feature flags (21 flags, Redis + DB-backed)
│   ├── flags-server.ts     ← Server-side flag loading with Prisma
│   ├── ai.ts               ← Multi-provider AI adapter (OpenRouter, DeepSeek, OpenAI)
│   ├── yjs-collaboration.ts ← Real-time collaborative editing (Yjs)
│   ├── neo4j.ts            ← Graph database connection
│   ├── stripe.ts           ← Subscription payments
│   └── i18n/               ← React Context i18n (config, server, provider, EN/FR)
├── prisma/                 ← Prisma schema (30 models) + migrations
├── supabase/               ← SQL migrations + RLS policies
├── __tests__/              ← Vitest tests (AI, API, components)
├── scripts/                ← Build, migration, rollout/rollback utilities
└── docs/                   ← Technical documentation
```

## Feature Flags

21 feature flags defined in `libfile:///flags.ts`, Redis-backed with DB fallback. Categories: core, social, monetization, experimental, wellbeing, ai.

Only 2 disabled: `payments` (Stripe not yet configured) and `design_system_v2` (in progress).

## Getting Started

```bash
pnpm install
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm type-check       # TypeScript check
pnpm test             # Vitest suite
pnpm db:migrate:local # Apply migrations
pnpm db:seed          # Seed database
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| ORM | Prisma (PostgreSQL adapter) |
| Database | Supabase Postgres |
| Auth | Supabase Auth + NextAuth.js |
| AI | OpenRouter / DeepSeek / OpenAI |
| Cache | Upstash Redis |
| Graph | Neo4j (world-building relationships) |
| Realtime | Yjs + Supabase Realtime |
| Payments | Stripe |
| Email | Resend |
| Hosting | Vercel |

---

*Document maintained by Nebula Forge Digital Studio — August 2026*