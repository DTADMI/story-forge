# Email Integration Plan

## Recommended Provider: Resend

Resend matches the existing QuestHunt email stack and provides a simple REST API with React-friendly templating.

## Setup

1. **Resend API Key** — Obtain from [resend.com](https://resend.com). Store as `RESEND_API_KEY` in Vercel env vars and `.env.local`.
2. **Domain Verification** — Add DNS records (SPF, DKIM, DMARC) for the sending domain (`mail.storyforge.app`).
3. **Email Templates** — Create React Email templates in `web/src/emails/` using `@react-email/components`.

## Architecture

```
Next.js API Route → Resend SDK → Email
```

- Server-side only. Never expose the API key.
- Each email type gets a dedicated API endpoint: `POST /api/emails/{type}`.
- Templates rendered via `@react-email/render`, sent via `resend.emails.send()`.

## Email Types

| Type | Trigger | Priority |
| --- | --- | --- |
| Email Verification | User signs up | P0 |
| Password Reset | User requests reset | P0 |
| Welcome | After first login | P1 |
| Comment Notification | Someone comments on your project | P2 |
| Message Notification | New direct message received | P2 |
| Weekly Digest | Weekly summary of activity | P3 |

## Templates

Simple HTML with StoryForge branding (logo, colors, off-white background). All templates must be:

- Responsive (320px minimum)
- Accessible (semantic HTML, alt text)
- Plain-text fallback included

## Feature Flags

| Flag | Purpose |
| --- | --- |
| `email_verification` | Require email verification on signup |
| `email_notifications` | Enable notification emails globally |

## Implementation Estimate

**4 hours** for setup + templates:

- 30 min: Resend account + domain setup
- 1 hr: React Email templates (verification, reset, welcome)
- 1 hr: API routes + SDK integration
- 1 hr: Feature flags + notification triggers
- 30 min: Testing + docs

## Dependencies

```json
{
  "resend": "^4.0.0",
  "@react-email/components": "^0.0.25",
  "@react-email/render": "^1.0.0"
}
```
