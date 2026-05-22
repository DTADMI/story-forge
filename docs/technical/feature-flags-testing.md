# StoryForge — Feature Flags Testing Guide

> Last updated: May 22, 2026

## Overview

StoryForge uses a Redis-backed feature flag system with env-var fallback. Flags are defined in `lib/flags.ts` (client-safe) with server-side DB-backed loading in `lib/flags-server.ts`.

## Flag Architecture

| Layer | File | Role |
|---|---|---|
| Definition | `lib/flags.ts` | Flag types, defaults, client-safe `isEnabledSync()` |
| Server loading | `lib/flags-server.ts` | DB layer via Prisma + Redis cache |
| Rate limiting | `lib/rate-limit.ts` | Token-bucket via Upstash Redis |
| Caching | `lib/cache.ts` | `getCached`, `setCached`, `invalidateCache` |

## Current Flags

| ID | Name | Type | Category | Default | Description |
|---|---|---|---|---|---|
| `payments` | Payments | boolean | monetization | false | Stripe subscription checkout and billing |
| `ai_assist` | AI Writing Assistant | boolean | ai | false | Master toggle for all AI features |
| `ai_writing_suggestions` | AI Writing Suggestions | boolean | ai | false | Inline writing suggestions in editor |
| `ai_character_development` | AI Character Development | boolean | ai | false | AI-generated character traits, backstories |
| `ai_plot_analysis` | AI Plot Analysis | boolean | ai | false | AI review of story structure |
| `ai_style_consistency` | AI Style Consistency | boolean | ai | false | AI analysis of writing style |
| `ai_research_assistant` | AI Research Assistant | boolean | ai | false | AI-powered research and fact-checking |
| `projects_v2` | Projects V2 | boolean | core | false | Next-generation project editor |
| `wellbeing` | Writing Wellbeing | boolean | wellbeing | true | Break reminders, anti-burnout |
| `design_system_v2` | Design System V2 | boolean | core | true | Updated design system |
| `real_time_collaboration` | Real-time Collaboration | boolean | core | true | Live co-authoring and presence |
| `groups_feature` | Writing Groups | boolean | social | true | Create and join writing groups |
| `public_feed` | Public Story Feed | boolean | social | true | Discover public stories |
| `activity_feed` | Activity Feed | boolean | social | true | Friends' writing activity |
| `writing_stats` | Writing Statistics | boolean | core | true | Personal writing statistics dashboard |
| `comments` | Project Comments | boolean | social | true | Comment on projects |
| `export` | Project Export | boolean | core | true | Export projects as Markdown/EPUB/PDF |
| `oauth` | OAuth Providers | boolean | core | true | Sign in with Google and GitHub |
| `version_history` | Version History | boolean | core | false | Save and restore project versions |
| `search` | Search | boolean | core | false | Full-text search across projects |

## Testing Flags Locally

### Environment Variable Override

Set in `.env.local`:
```
NEXT_PUBLIC_FEATURE_PAYMENTS=true
NEXT_PUBLIC_FEATURE_AI_ASSIST=true
NEXT_PUBLIC_FEATURE_SEARCH=true
```

### Redis Override

Set flag values directly in Upstash Redis:
```
SET storyforge:feature_flags '[{"id":"payments","enabled":true,...}]'
```

### Debug Endpoint (dev only)

`GET /api/debug/flags` — returns current flag state in development. Returns 404 in production.

### Admin Dashboard

Navigate to `/admin/flags` to view and toggle flags through the admin UI. Requires admin role.

## Adding a New Flag

1. Add to `DEFAULT_FLAGS` array in `lib/flags.ts`
2. Add to `WebEnvSchema` in `lib/env.ts` if env-var override needed
3. Document in this file (above table)
4. Add UI gating with `isEnabled("flag_id")` or `isEnabledSync("flag_id")`
5. Add to admin dashboard if applicable

## Flag Lifecycle

1. **Development**: Flag default is `enabled: false`
2. **Staging**: Enable via Redis or env var for testing
3. **Production**: Enable via admin dashboard (DB) or Redis, with rollback path
4. **Sunset**: After 30+ days of 100% rollout, remove flag code in a cleanup PR

## Categories

| Category | Purpose |
|---|---|
| `core` | Essential platform features |
| `social` | Social/community features |
| `monetization` | Billing and subscription features |
| `experimental` | Beta/experimental features |
| `wellbeing` | Mental wellness and break reminders |
| `ai` | AI-powered features |

## Testing Checklist

- [ ] Flag works with env var override (`NEXT_PUBLIC_FEATURE_*`)
- [ ] Flag works with Redis override
- [ ] Flag works with DB override (admin dashboard)
- [ ] Flag disabled state hides UI correctly
- [ ] Flag enabled state shows UI correctly
- [ ] Flag gating works on both server and client
- [ ] No errors when Redis is unavailable (graceful fallback)
- [ ] No errors when DB is unavailable (graceful fallback)
