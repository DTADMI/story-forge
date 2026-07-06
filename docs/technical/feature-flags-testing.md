<!-- CLUSTER-C CANONICAL: NF-root rules. Project-specific delta below. -->
> **Canonical rules/process**: `../../../docs/technical/feature-flags-testing.md` (NF root). This doc keeps project-specific values/catalog only.
# StoryForge — Feature Flags Testing Guide

> Last updated: May 30, 2026

## Overview

StoryForge uses a Redis-backed feature flag system with env-var fallback. Flags are defined in `lib/flags.ts` (client-safe) with server-side DB-backed loading in `lib/flags-server.ts`.

## Flag Architecture

| Layer | File | Role |
|---|---|---|
| Definition | `lib/flags.ts` | Flag types, defaults, client-safe `isEnabledSync()` |
| Server loading | `lib/flags-server.ts` | DB layer via Prisma + Redis cache |
| Rate limiting | `lib/rate-limit.ts` | Token-bucket via Upstash Redis |
| Caching | `lib/cache.ts` | `getCached`, `setCached`, `invalidateCache` |

## Current Flags (20 total)

| ID | Name | Type | Category | Default | Gated |
|---|---|---|---|---|---|
| `payments` | Payments | boolean | monetization | **false** | ✅ Client: pricing page subscribe button |
| `ai_assist` | AI Writing Assistant | boolean | ai | **true** | ✅ Server: 5 AI API routes. Client: 6 AI components |
| `ai_writing_suggestions` | AI Writing Suggestions | boolean | ai | **true** | ✅ Server: suggest route. Client: ai-writing component |
| `ai_character_development` | AI Character Development | boolean | ai | **true** | ✅ Server: character route. Client: ai-character component |
| `ai_plot_analysis` | AI Plot Analysis | boolean | ai | **true** | ✅ Server: plot route. Client: ai-plot component |
| `ai_style_consistency` | AI Style Consistency | boolean | ai | **true** | ✅ Server: style route. Client: ai-style component |
| `ai_research_assistant` | AI Research Assistant | boolean | ai | **true** | ✅ Server: research route. Client: ai-research component |
| `projects_v2` | Projects V2 | boolean | core | **true** | ✅ Client: project-editor fallback when disabled |
| `wellbeing` | Writing Wellbeing | boolean | wellbeing | **true** | ✅ Client: project-editor break reminder timer |
| `design_system_v2` | Design System V2 | boolean | core | **false** | None — acknowledged dead code, no V1/V2 split |
| `real_time_collaboration` | Real-time Collaboration | boolean | core | **true** | ✅ Client: Yjs provider, collaboration hook, presence avatars, editor sync, sync indicators |
| `groups_feature` | Writing Groups | boolean | social | **true** | ✅ Server: groups/join/leave API routes. Client: sidebar filter, dashboard card |
| `public_feed` | Public Story Feed | boolean | social | **true** | ✅ Server: public projects API. Client: feed page |
| `activity_feed` | Activity Feed | boolean | social | **true** | ✅ Server: activity feed API. Client: dashboard card |
| `writing_stats` | Writing Statistics | boolean | core | **true** | ✅ Server: stats overview API. Client: sidebar filter, dashboard card |
| `comments` | Project Comments | boolean | social | **true** | ✅ Server: comments API (GET+POST). Client: project detail page |
| `export` | Project Export | boolean | core | **true** | ✅ Server: export API. Client: export dropdown component |
| `oauth` | OAuth Providers | boolean | core | **true** | ✅ Client: signin page OAuth buttons |
| `version_history` | Version History | boolean | core | **true** | ✅ Server: versions API (GET+POST). Client: project detail page |
| `search` | Search | boolean | core | **true** | ✅ Server: search API. Client: search page, sidebar filter |

## Testing Flags Locally

### Environment Variable Override

Set in `.env.local`:
```
NEXT_PUBLIC_FEATURE_PAYMENTS=true
NEXT_PUBLIC_FEATURE_AI_ASSIST=true
```

### Admin Dashboard

Visit `/admin/flags` to toggle flags via the UI. Changes are persisted to Redis + DB.

## Flag Key Normalization

`isEnabledSync()` and `isEnabled()` normalize keys via:
```ts
key.toLowerCase().replace(/[^a-z0-9_]/g, "_")
```

**Always use snake_case** keys matching the flag ID exactly (e.g., `"ai_assist"`, not `"aiAssist"`).

## Architecture Notes

- `isEnabled(key)` — server-only async. Uses Prisma DB fallback.
- `isEnabledSync(key)` — client-safe sync. Reads cached flags or defaults.
- `loadFlags()` — async loader from Redis with env-var fallback.
- `initFlags()` — server-side init that loads from DB + Redis.
