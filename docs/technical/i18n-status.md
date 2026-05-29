# StoryForge — i18n Status Audit

**Audit Date**: 2026-05-28

## Approach

| Aspect | Value |
|--------|-------|
| Pattern | `next-intl` (different from cross-project Context pattern) |
| Config | `i18n/routing.ts` + `i18n/request.ts` |
| Provider | `next-intl` `NextIntlClientProvider` |
| Translation format | JSON messages (`messages/*.json`) |
| Locale resolution | Path prefix (as-needed) + `next-intl` routing |

## Locale Configuration

| Setting | Value |
|---------|-------|
| Default locale | `en` (INCORRECT — should be `fr`) |
| Supported locales | en, fr |
| Locale prefix | `as-needed` |

## Translation Key Counts

| Locale | Keys | Status |
|--------|------|--------|
| EN | 219 | Baseline |
| FR | 219 | Fully synced |

## Quebec French Conventions

| Convention | Count | Notes |
|------------|-------|-------|
| "connexion" (vs "login") | 2 occurrences | Weak |
| "courriel" (vs "email") | 0 occurrences | Missing |
| "mot de passe" (vs "password") | 2 occurrences | Weak |
| "email" in FR | 2 occurrences | Needs cleanup |
| "password" in FR | 1 occurrence | Needs cleanup |
| Hardcoded locale arguments | N/A (next-intl pattern) | |

## Missing Keys / Issues

- Default locale is `en` instead of required `fr` — needs fix in `i18n/routing.ts`
- Quebec French conventions are weak (0 "courriel", only 2 "connexion", 2 "mot de passe")
- Uses `next-intl` instead of the cross-project Context pattern — migration recommended for consistency

## Assessment

- FR key parity is complete (219/219)
- Default locale `en` violates cross-project rule (must be `fr`)
- Uses `next-intl` pattern instead of the cross-project Context pattern defined in root AGENTS.md
- Quebec French vocabulary is poorly adopted; most FR strings appear to be direct translations without Quebec-specific conventions
- Recommended: migrate default locale to `fr` and adopt Quebec French conventions
