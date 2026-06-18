# StoryForge — i18n Status Audit

**Audit Date**: 2026-05-29

## Approach

| Aspect | Value |
|--------|-------|
| Pattern | React Context pattern (`lib/i18n/`) — cross-project standard |
| Config | `lib/i18n/config.ts` |
| Server Resolver | `lib/i18n/server.ts` (`getServerLocale`, `getServerTranslations`) |
| Client Provider | `lib/i18n/provider.tsx` (`I18nProvider`, `useI18n`) |
| Server Bridge | `lib/i18n/server-provider.tsx` (`ServerI18nProvider`) |
| Translation format | TypeScript modules (`lib/i18n/translations/en.ts`, `fr.ts`) |
| Locale resolution | Cookie → Accept-Language header → default `fr` |

## Locale Configuration

| Setting | Value |
|---------|-------|
| Default locale | `fr` (Quebec French) |
| Supported locales | en, fr |
| Cookie key | `storyforge-locale` |
| Storage key | `storyforge-locale` |

## Translation Key Counts

| Locale | Keys | Status |
|--------|------|--------|
| EN | 220 | Baseline |
| FR | 220 | Fully synced |

## Quebec French Conventions

| Convention | Count | Notes |
|------------|-------|-------|
| "connexion" (vs "login") | 4 occurrences | Adequate |
| "courriel" (vs "email") | 1 occurrence | Present in auth section |
| "mot de passe" (vs "password") | 3 occurrences | Adequate |
| "téléverser" (vs "upload") | 2 occurrences | Present |
| "tableau de bord" (vs "dashboard") | 3 occurrences | Present |

## Historical Issues — Resolved

- [x] Default locale was `en` — now `fr`
- [x] Was using `next-intl` — migrated to cross-project Context pattern
- [x] Hardcoded `lang="en"` in `<html>` — now dynamic from `getServerLocale()`
- [x] Quebec French vocabulary was weak — "courriel", "téléverser" added
- [x] Hardcoded English "Viewers:" in presence-avatars — now uses `t("social.viewers")`

## Remaining Work

- [ ] Expand `useI18n()` usage beyond the 2 migrated components (Header User, Presence Avatars) — most pages still use hardcoded English strings
- [ ] Add i18n lint checks to pre-commit (hardcoded English string detection)

## Recent Changes (2026-06-18)

- [x] `next-intl` dependency removed from `package.json`
- [x] `next-intl` plugin wrapper removed from `next.config.mjs`
- [x] `messages/` directory removed (replaced by `lib/i18n/translations/`)
- [x] `i18n/routing.ts` and `i18n/request.ts` removed
- [x] `User.tsx` updated to use `next/link` instead of `@/i18n/routing`
- [x] `next.config.mjs` simplified, added `cacheComponents: true` for PPR

## Assessment

- FR key parity is complete (220/220)
- Default locale `fr` respects Quebec language laws
- Now uses the cross-project React Context pattern from root AGENTS.md
- Quebec French vocabulary has been improved with proper terms
- Migration from next-intl to Context pattern is structurally complete — routing and plugin removed
- Hardcoded English strings remain in the majority of pages/components — this is a deferred P1 task
