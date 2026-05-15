# Discord Integration — Phase 2 Plan

> May 14, 2026 | Status: Planning

## Rationale

Writing communities thrive on Discord. NaNoWriMo's Discord server has 50K+ members. Genre-specific writing groups (fantasy writers, romance authors, screenwriters) use Discord for critique circles, writing sprints, and accountability. Discord OAuth + bot integration would bridge StoryForge with these existing communities.

## Feature Set

### D1 — Discord OAuth Sign-In

**Priority:** P2 | **Effort:** 1h

Supabase Auth supports Discord OAuth natively. Same pattern as Google OAuth already implemented.

- `supabase.auth.signInWithOAuth({ provider: "discord" })`
- Discord Developer Portal: register application, get client ID/secret
- Add to Supabase Auth dashboard
- Add "Continue with Discord" button alongside Google

### D2 — Discord Bot: Writing Sprints

**Priority:** P2 | **Effort:** 8h

A Discord bot that runs timed writing sprints in Discord servers. Users join a sprint, write for 15/30/60 minutes, and the bot posts results.

**Architecture:**
```
Discord Server → Bot (Node.js) → StoryForge API
                                     │
                              POST /api/gamification/progress
                              (records word count from sprint)
```

**Commands:**
- `/sprint start [duration]` — Start a writing sprint (15m, 30m, 60m)
- `/sprint join` — Join active sprint
- `/sprint status` — Time remaining, participant count
- `/sprint result` — Post results (words written, winner)

**Technical:**
- Discord.js or Discordeno bot framework
- Bot hosted as Supabase Edge Function or separate service
- WebSocket connection for real-time sprint timer updates
- Links Discord user ID to StoryForge user via OAuth

### D3 — Discord Bot: Word Count Sharing

**Priority:** P2 | **Effort:** 4h

Share StoryForge writing progress to Discord channels.

- `/share progress` — Post daily word count, streak, badges
- `/share project` — Share project preview card (title, word count, genre)
- Automatic daily summary (opt-in): posts yesterday's word count at 9 AM

### D4 — Discord Bot: Community Challenges

**Priority:** P3 | **Effort:** 6h

Server-wide writing challenges managed by Discord bot.

- `/challenge create [name] [target] [deadline]` — Create writing challenge
- `/challenge join` — Join challenge
- `/challenge leaderboard` — Show challenge progress
- `/challenge complete` — Mark challenge as done

### D5 — Discord Webhooks: Activity Notifications

**Priority:** P3 | **Effort:** 3h

Push StoryForge activity to Discord channels via webhooks.

- User earns badge → Discord notification
- Friend publishes project → Discord notification
- User reaches streak milestone → Discord notification

## Architecture

```
┌──────────────────────────────────────────────────┐
│                 StoryForge (Next.js)              │
│                                                   │
│  /api/discord/callback     ← OAuth callback      │
│  /api/discord/webhook      ← Bot → API bridge     │
│  /api/discord/bot/events   ← Interaction endpoint │
└──────────────────┬────────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌────────┐  ┌──────────┐  ┌──────────────┐
│Discord │  │ Supabase │  │ Discord Bot   │
│ OAuth  │  │ Edge Fn  │  │ (Node.js)     │
└────────┘  └──────────┘  └──────────────┘
```

## Prerequisites

1. Discord Developer Portal: create application, enable OAuth2 + Bot
2. Supabase Auth: add Discord provider
3. Bot hosting: Supabase Edge Functions (free tier sufficient)
4. Discord server for testing

## Feature Flags

All Discord features gated behind:
- `discord_oauth` — OAuth sign-in
- `discord_bot_sprints` — Writing sprint bot
- `discord_bot_sharing` — Word count sharing
- `discord_bot_challenges` — Community challenges

## Implementation Order

| Phase | Features | Effort | Dependencies |
|---|---|---|---|
| 2a | D1 (OAuth) | 1h | Discord app registration |
| 2b | D2 (Sprints) | 8h | D1, Supabase Edge Functions |
| 2c | D5 (Notifications) | 3h | D2 |
| 2d | D3 (Sharing) | 4h | D1 |
| 2e | D4 (Challenges) | 6h | D3 |
