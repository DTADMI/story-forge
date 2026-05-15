# OAuth Analysis for StoryForge

> May 14, 2026

## Current State

Google and GitHub OAuth buttons are implemented on `/signin` and `/signup` pages via Supabase Auth's `signInWithOAuth()`.

## Pertinence Analysis

### Google OAuth — 🟢 Pertinent

**Use case:** A writer discovers StoryForge via a friend's shared project link. They want to leave a comment. Without an account, they can't. With Google OAuth, it's one click. No password to remember, no email verification. This is the dominant sign-up path for consumer SaaS — 60-80% of sign-ups use Google on platforms that offer it.

**Added value:**
- Eliminates password fatigue (writers already have too many accounts)
- Zero-friction sign-up from shared project links
- Pre-verified email (no confirmation flow needed)
- Familiar trust signal ("Sign in with Google" = legitimate platform)

**Recommendation:** Keep. It's table-stakes for any consumer web app in 2026.

### GitHub OAuth — 🔴 Not Pertinent

**Use case:** A technical writer or developer who wants to write documentation, code-heavy tutorials, or developer-focused content. They use GitHub daily and prefer it over Google.

**Problem:** This is a niche within a niche. StoryForge targets creative writers (novelists, screenwriters, comic creators), not technical writers. The GitHub audience overlap is minimal (<5% of target users). The GitHub button:
- Adds visual clutter to the sign-in form
- Creates confusion ("Is this for developers?")
- Requires maintaining a GitHub OAuth app registration
- Serves almost no users

**Recommendation:** Remove. Replace with nothing — keep the form clean with email + Google only.

### Discord OAuth — 🟡 Potentially Pertinent (Future)

**Use case:** Writing communities on Discord (NaNoWriMo servers, genre-specific writing groups, critique circles). A writer who is active in a writing Discord discovers StoryForge through the community. Discord OAuth lets them sign in with their existing community identity, and potentially bridges their Discord presence with their StoryForge activity.

**Added value:**
- Taps into existing writing communities (high-quality user acquisition channel)
- Social proof ("Join the same way you joined your writing group")
- Future integration: Discord bot for writing sprint notifications, word count sharing

**Problem:** Adds another button. Discord's OAuth scope is broader than Google's. Implementation is the same as Google (Supabase supports it natively).

**Recommendation:** Consider for Phase 2, alongside community/social features. Not urgent.

### Email-Only — 🟢 Baseline (Current, Keep)

**Use case:** Writers who prefer not to link accounts, or who use email aliases for their writing identity (pen names). Email is the universal fallback that works for everyone.

**Recommendation:** Keep as the primary option. Email/password is always available, even when third-party providers are down.

## Recommended Configuration

```
┌─────────────────────────────────┐
│         Sign In / Sign Up        │
│                                 │
│  [Continue with Google]  ← Only │
│                                 │
│  ─────── or ───────             │
│                                 │
│  Email:    [____________]       │
│  Password: [____________]       │
│  [Sign In]                      │
└─────────────────────────────────┘
```

Single OAuth button (Google). Clean, focused, no decision fatigue.

## Implementation Changes Needed

1. Remove GitHub button from `signin/page.tsx` and `signup/page.tsx`
2. Remove GitHub SVG from the JSX
3. Keep Google button and `handleOAuth("google")` logic
4. Optionally add Supabase Dashboard config for Google OAuth (client ID, secret) in production env

## Comparison with QuestHunt

QH has OAuth feature-flagged (`auth_oauth` flag, currently disabled). The QH architecture supports Google, GitHub, and Discord providers but gates them behind a flag. For SF, the simpler approach (Google only, no flag needed) is appropriate because:
- SF has a narrower audience (writers vs. general public for QH)
- Fewer providers = less maintenance, less UI clutter
- Google alone covers 80%+ of OAuth use cases
