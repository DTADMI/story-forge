# StoryForge — Feature Recommendations & Implementation Plan

> Generated: May 14, 2026 | Status: Living document

---

## Priority Legend

| Icon | Priority | Criteria |
|---|---|---|
| 🔴 **P0** | Critical | Blocks launch quality. User-facing gap. No workaround. |
| 🟡 **P1** | High | High user value. Differentiator vs competitors. |
| 🔵 **P2** | Medium | Nice-to-have. Complements core experience. |
| ⚪ **P3** | Low | Future roadmap. Nice but not urgent. |

---

## F1 — Activity Feed

**Priority:** 🟡 P1 | **Effort:** 6 hours | **Status:** Planned

### Rationale
Users need to see what their friends are doing — writing streaks, new projects, badge unlocks. This is the #1 retention mechanism for social writing platforms (Wattpad, Royal Road, NaNoWriMo all have feeds). StoryForge already has follows, projects, badges — the data exists, just needs aggregation and display.

### Pros
- Uses existing data (follows, projects, badges, progress)
- Drives daily engagement and return visits
- Low implementation complexity — mostly a read query
- Can be cached aggressively (Redis, 5-min TTL)
- Creates social accountability for writing goals

### Cons
- Adds a new page and navigation item
- Privacy concerns — needs scope-aware filtering (friends-only projects shouldn't appear in public feed)
- Can feel empty at launch with few users

### Alternatives
- **Simple "Recent Activity" sidebar on dashboard** — less engaging, but simpler
- **Email digest** — weekly summary of friends' activity (complementary, not alternative)
- **No feed** — rely solely on project discovery page (current state)

### Requirements

**Technical:**
- New `Activity` model in Prisma: `{ id, userId, type, entityId, entityType, metadata, createdAt }`
- Database trigger or application code to create activities on: project create/publish, badge earn, streak milestone, goal complete, follow
- API route: `GET /api/activity/feed` with cursor pagination, scoped to followed users
- Redis caching with 5-min TTL, invalidated on new activity

**Functional:**
- Filter by activity type (projects, badges, streaks)
- Cursor-based infinite scroll pagination
- Rich previews: project title + excerpt, badge name + icon
- Empty state: "Follow writers to see their activity"

**UI/UX:**
- Card-style feed with user avatar, timestamp, action text
- Click-through to project page, user profile, or badge showcase
- Mobile-responsive single column
- Loading skeletons matching card height

**Design/Assets:**
- Activity type icons (pencil for project, trophy for badge, flame for streak)
- Consistent with existing Card component style

---

## F2 — Export (Markdown + PDF)

**Priority:** 🔴 P0 | **Effort:** 8 hours | **Status:** Planned

### Rationale
Writers need to get their work OUT of the platform. This is a trust and lock-in concern — if users can't export, they won't invest serious content. Every writing platform (Scrivener, Ulysses, Google Docs, Notion) supports export. Markdown is the universal interchange format. PDF is what agents/publishers expect.

### Pros
- Builds trust — users know their data is portable
- Markdown is simple to implement (TipTap can export to HTML → convert to MD)
- PDF via `pdf-lib` or browser print API
- Competitive necessity — without export, serious writers won't use the platform
- Low ongoing maintenance

### Cons
- PDF generation with complex formatting (dialogue scripts, tables) is non-trivial
- Image embedding in exports adds complexity
- Large projects (100K+ words) may hit memory/time limits in serverless functions

### Alternatives
- **Markdown only** — simpler, covers 80% of use case. PDF left to user's own tools.
- **DOCX export** — higher fidelity but requires complex library (mammoth, docx)
- **Plain text only** — too basic for a writing platform
- **Export via TipTap's built-in HTML** — simplest, let user convert

### Requirements

**Technical:**
- API route: `POST /api/projects/[id]/export?format=md|pdf`
- TipTap editor already stores HTML — convert HTML → Markdown via `turndown` or `rehype-remark`
- PDF: Use `pdf-lib` (already in QH deps) or server-side Puppeteer/Playwright
- Stream response for large files
- Rate limit: 10 exports per hour per user

**Functional:**
- Export entire project or selected chapters
- Include metadata: title, author, date, word count
- Markdown: clean, readable, preserves headings/bold/italic/lists
- PDF: formatted with title page, page numbers, consistent font

**UI/UX:**
- Export button in project editor toolbar
- Format selector: Markdown / PDF
- Progress indicator for large exports
- Download triggers browser save dialog
- Success toast: "Project exported as [format]"

**Design/Assets:**
- Download icon in toolbar
- Loading spinner during export generation
- No new assets needed

---

## F3 — Writing Statistics Dashboard

**Priority:** 🟡 P1 | **Effort:** 6 hours | **Status:** Planned

### Rationale
Writers are motivated by visible progress. Word count trends, streak calendars, and genre breakdowns give users concrete evidence of their writing habit. This is the core gamification loop — Duolingo, Strava, and GitHub all prove that personal statistics drive daily engagement.

### Pros
- Data already exists (ProgressLog, Project.wordCount, Goal, streak calculation)
- Highly motivating for habit-building users
- Visual, shareable, screenshot-worthy
- Low API complexity — mostly aggregation queries

### Cons
- Requires charting library (Recharts already available via QH deps)
- Calendar heatmap needs custom component or library
- Empty state for new users needs good design
- "Cold start" problem — stats are uninteresting with < 7 days of data

### Alternatives
- **Simple stats cards on dashboard** (current state) — already done, but not engaging
- **Weekly email report** — complementary, not alternative
- **No dashboard** — misses core gamification opportunity

### Requirements

**Technical:**
- API route: `GET /api/stats/overview` — totals, averages, streaks
- API route: `GET /api/stats/trends?days=30` — daily word counts for chart
- API route: `GET /api/stats/genres` — word count by genre
- Recharts for line/bar charts
- Custom calendar heatmap component (or `react-activity-calendar`)

**Functional:**
- Total words written (all-time)
- Daily word count trend (30-day line chart)
- Current streak + longest streak
- Genre distribution (bar or donut chart)
- Projects count + average words per project
- Calendar heatmap (GitHub-style contribution graph)

**UI/UX:**
- Dedicated page: `/stats`
- Responsive grid layout: 2-column on desktop, stacked on mobile
- Animated number counters on load
- Empty state with encouragement: "Start writing to see your stats!"
- Share button (generates image/card for social)

**Design/Assets:**
- Stats icons (pencil, flame, calendar, book)
- Color palette for charts matching brand colors

---

## F4 — Comments on Projects

**Priority:** 🟡 P1 | **Effort:** 5 hours | **Status:** Planned

### Rationale
Writing is inherently social. Writers want feedback. Current StoryForge has follows and cheers but no way to leave substantive feedback on someone's writing. Comments are the #1 engagement feature on every content platform.

### Pros
- Drives social engagement and platform stickiness
- Creates notification opportunities (you got a comment → return to platform)
- Simple data model (1 table)
- Can be feature-flagged and rolled out gradually

### Cons
- Requires moderation tooling (already partially built in admin/moderation)
- Spam/abuse risk — needs content filtering
- Notification system prerequisite (or use toast-only initially)
- Nested/threaded comments add complexity

### Alternatives
- **Flat comments only** — simpler, good enough for MVP
- **Inline annotations** (like Google Docs suggesting mode) — higher fidelity but much more complex
- **Reactions only** (like/heart/star) — simpler, less useful for feedback
- **No comments** — writers go to Discord/Reddit for feedback, platform loses engagement

### Requirements

**Technical:**
- Prisma model: `Comment { id, projectId, userId, content, parentId?, createdAt, updatedAt }`
- API: `GET /api/projects/[id]/comments`, `POST /api/projects/[id]/comments`, `DELETE /api/comments/[id]`
- Flat comments with optional `parentId` for threading (max 1 level)
- Rate limit: 30 comments per hour

**Functional:**
- View comments on project page (below content)
- Post comment as authenticated user
- Delete own comments
- Author notifications (toast for now, email later)
- Project author can delete any comment on their project

**UI/UX:**
- Comment section at bottom of project page
- Avatar + username + timestamp + content
- Text input with submit button
- Empty state: "No comments yet. Be the first to share feedback!"
- Optimistic insert (comment appears immediately, rolls back on error)

**Design/Assets:**
- Comment icon
- User avatar placeholder
- Consistent with project page card style

---

## F5 — Version History

**Priority:** 🔵 P2 | **Effort:** 6 hours | **Status:** Planned

### Rationale
Writers experiment. They delete paragraphs, restructure chapters, try different openings. Without version history, every edit is a gamble. Version history is table-stakes for any serious writing tool (Google Docs, Notion, Scrivener all have it).

### Pros
- Builds trust — users know they can't lose work
- Differentiator vs simpler writing tools
- Low storage cost (diffs are small)
- Can be implemented incrementally (snapshots first, diffs later)

### Cons
- Increases write load (every save creates a version row)
- Restore UX is complex (preview old version, confirm restore)
- Large projects may create many versions → storage/TTL strategy needed
- TipTap's built-in history is client-only (lost on page refresh)

### Alternatives
- **Manual snapshots** — user clicks "Save Version" explicitly. Simpler, less automatic.
- **Full content storage per version** — simpler but more storage. Acceptable for text.
- **Git-based backend** — overkill for a writing app
- **No version history** — rely on user's own backups

### Requirements

**Technical:**
- Prisma model: `ProjectVersion { id, projectId, content, wordCount, label?, createdAt }`
- Auto-snapshot on every Ctrl+S save (debounced, max 1 per 5 minutes)
- Manual snapshot: "Save Version" button with optional label
- API: `GET /api/projects/[id]/versions`, `POST /api/projects/[id]/versions`, `POST /api/projects/[id]/restore`
- Retention: keep last 50 versions per project, delete older

**Functional:**
- View version list with timestamp, word count, optional label
- Click version to preview content (read-only)
- "Restore this version" button with confirmation dialog
- Current version indicator ("You're viewing an old version — [Restore] [Back to current]")

**UI/UX:**
- Version history drawer/panel in project editor
- Timeline-style list with labels
- Diff view (green additions, red deletions) — stretch goal
- Confirmation dialog for restore: "This will replace your current content. Continue?"

**Design/Assets:**
- History/clock icon
- Version list with dates

---

## F6 — OAuth Providers (Google, GitHub)

**Priority:** 🔵 P2 | **Effort:** 2 hours | **Status:** Planned

### Rationale
Email/password is friction. OAuth reduces sign-up abandonment. Supabase Auth supports Google, GitHub, Discord, and more out of the box — enabling them is configuration, not code.

### Pros
- Supabase Auth supports OAuth natively — minimal code
- Reduces sign-up friction
- No password management for users
- GitHub OAuth is popular with developer/writer crossover audience

### Cons
- Requires OAuth app registration (Google Cloud Console, GitHub Developer Settings)
- Slight brand dilution (users see "Sign in with Google" not StoryForge logo)
- Email may not be verified by provider

### Alternatives
- **Magic link only** — simpler than OAuth + password, but not as familiar
- **Web3 / wallet auth** — niche, not relevant for writing platform
- **No OAuth** — current state, acceptable for MVP

### Requirements

**Technical:**
- Supabase Auth configuration in dashboard (add Google + GitHub providers)
- Client-side: `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Callback route: existing `/api/auth/callback` already handles `exchangeCodeForSession`
- Update sign-in page with OAuth buttons

**Functional:**
- "Continue with Google" and "Continue with GitHub" buttons on sign-in/sign-up pages
- Seamless redirect flow (no extra steps for user)
- Link OAuth to existing account if email matches

**UI/UX:**
- OAuth buttons below email/password form with divider "or"
- Google: "Continue with Google" + Google logo
- GitHub: "Continue with GitHub" + GitHub logo
- Consistent button style (outline variant)

**Design/Assets:**
- Google and GitHub logo SVGs (available in simple-icons)

---

## F7 — Real-time Collaboration

**Priority:** 🔵 P2 | **Effort:** 12 hours | **Status:** Planned

### Rationale
Co-authoring is a growing use case. Google Docs proved real-time collaboration is table-stakes for document editing. Supabase Realtime provides the WebSocket infrastructure. StoryForge already has group/shared project concepts.

### Pros
- Supabase Realtime is built-in — no additional infrastructure
- Major differentiator vs other writing platforms
- Enables beta reading, co-authoring, writing groups
- Presence indicators ("X is typing...") create social connection

### Cons
- Operational Transform / CRDT is complex — conflicts, cursor positions, undo
- Requires significant architectural changes to the editor
- TipTap has collaboration extensions but they're complex and require a backend
- High implementation effort for reliability
- Can degrade UX if sync is buggy

### Alternatives
- **Turn-based collaboration** — one user edits, then "hands off" to another. Simpler.
- **Comment-only collaboration** — already covered by F4
- **No collaboration** — current state. Acceptable for solo writing platform.

### Requirements

**Technical:**
- Supabase Realtime channel per project: `supabase.channel('project-${id}')`
- Broadcast presence: user joins/leaves, cursor position
- Broadcast changes: document delta patches (not full content sync)
- TipTap Collaboration extension or custom CRDT implementation (Yjs)
- Rate limit broadcasts: max 10/sec per user

**Functional:**
- See who's currently viewing/editing the project (presence avatars)
- Real-time content sync between collaborators
- Cursor position indicators (colored carets)
- Lock mechanism for sections (optional)
- Feature-flagged: `real_time_collaboration`

**UI/UX:**
- Collaborator avatars in editor toolbar
- Colored cursors with usernames
- "X is typing..." indicator
- Connection status indicator (green/yellow/red dot)

**Design/Assets:**
- Presence avatar stack component
- Connection status dot
- Cursor color palette (6 colors for up to 6 simultaneous editors)

---

## F8 — Search

**Priority:** 🔵 P2 | **Effort:** 4 hours | **Status:** Planned

### Rationale
As projects grow, users need to find their own content and discover others'. Current implementation has no search. Supabase supports full-text search via `tsvector` columns.

### Pros
- Supabase full-text search is built-in (no external service)
- Low implementation complexity for basic search
- Enables project discovery (public feed search)
- Users expect search in any content platform

### Cons
- Supabase FTS is basic (no typo tolerance, no relevance tuning)
- MeiliSearch/Algolia would be better but adds cost + infra
- Cold start — no content to search at launch
- Privacy — must scope to user's own projects + public projects only

### Alternatives
- **Supabase FTS** — built-in, free, good enough for MVP
- **MeiliSearch** — self-hosted, better relevance, typo tolerance. Higher ops cost.
- **Algolia** — best UX but expensive for indie platform
- **No search** — current state

### Requirements

**Technical:**
- Add `search_vector tsvector` column to Project model, updated via trigger
- GIN index on search_vector
- Prisma raw query or Supabase client for FTS queries
- API: `GET /api/search?q=term&scope=my|public`
- Debounced input (300ms) to avoid excessive queries

**Functional:**
- Search own projects by title + content
- Search public projects by title + content
- Results ranked by relevance (ts_rank)
- Result preview: title + content excerpt with highlighted match

**UI/UX:**
- Search bar in header
- Results page with cards
- Empty state: "No results for '[query]'"
- Keyboard shortcut: Ctrl+K / Cmd+K to focus search

**Design/Assets:**
- Search icon (magnifying glass)
- Command palette component (stretch goal)

---

## F9 — Image Gallery for Characters/Locations

**Priority:** 🔵 P2 | **Effort:** 4 hours | **Status:** Planned

### Rationale
Visual writers (comic creators, screenwriters, RPG worldbuilders) need reference images. Characters have `imageUrl` field. Locations have `mapUrl`. Both exist in the schema but have no upload UI. Supabase Storage is already configured — just needs the upload component.

### Pros
- Schema fields already exist (imageUrl, mapUrl)
- Supabase Storage already configured (media bucket)
- `useStorageUpload()` hook already written
- High visual appeal — makes world-building feel real

### Cons
- Image moderation complexity (NSFW content)
- Storage costs at scale
- EXIF data privacy (strip GPS/metadata on upload)

### Alternatives
- **URL paste only** — user provides external image URL. Simpler but less integrated.
- **No images** — current state, text-only world-building
- **AI-generated images** — could use OpenRouter + DALL-E/Stable Diffusion. Interesting but complex.

### Requirements

**Technical:**
- Image upload component with drag-and-drop + paste support
- Client-side resize/compress before upload (max 1200px, JPEG quality 80%)
- EXIF stripping on client-side (canvas-based)
- Upload to Supabase `media` bucket, path: `users/{userId}/characters/{id}.webp`
- Update Prisma record with public URL after upload

**Functional:**
- Upload character portrait
- Upload location map/image
- Gallery view: browse all character/location images
- Delete/replace images

**UI/UX:**
- Drop zone with click-to-browse
- Image preview with crop (optional)
- Upload progress bar
- Error states (file too large, wrong type)
- Empty state: "Add an image to bring your character to life"

**Design/Assets:**
- Upload icon (camera/cloud-upload)
- Image placeholder
- Progress bar component

---

## F10 — Leaderboards

**Priority:** ⚪ P3 | **Effort:** 3 hours | **Status:** Planned

### Rationale
Competitive motivation works for some writers. NaNoWriMo's word count leaderboard drives massive engagement. Opt-in only (privacy-respecting). Friends-only scope.

### Pros
- Gamification that drives writing volume
- Opt-in respects privacy
- Friends-only scope avoids global spam
- Simple implementation (aggregate query + cache)

### Cons
- Can incentivize quantity over quality
- Competitive pressure may stress some users
- Small user base → empty leaderboard looks bad
- Needs abuse prevention (fake progress logging)

### Alternatives
- **Personal bests only** — compare against yourself. Less social, less motivating.
- **Group leaderboards** — within writing groups only. More intimate, harder to game.
- **No leaderboards** — current state

### Requirements

**Technical:**
- API: `GET /api/leaderboard?scope=friends&period=weekly|monthly|alltime`
- Redis cached, refreshed every 15 minutes
- Rank by word count in period
- Only show users who opted in (`settings.leaderboard_opt_in`)

**Functional:**
- Weekly, monthly, all-time periods
- Friends-only and group scopes
- User rank + total words + streak
- Opt-in/opt-out in profile settings

**UI/UX:**
- Leaderboard page: `/leaderboard`
- Ranked list with avatar, username, word count, streak
- Current user highlighted
- Empty state for new users
- Tabs: Weekly / Monthly / All-Time

---

## F11 — Multi-format Goals

**Priority:** ⚪ P3 | **Effort:** 3 hours | **Status:** Planned

### Rationale
Not all writers count words. Comic creators count panels. Screenwriters count pages. The current `words_per_day` goal type excludes significant user segments. The Goal model already has a flexible `type` field — just needs UI and validation.

### Pros
- Schema already supports it (Goal.type is a free string)
- Expands addressable audience (comic creators, screenwriters, RPG writers)
- Low implementation complexity
- Clear differentiator vs word-count-only platforms

### Cons
- Panel/page count relies on user honesty (no automated verification)
- Different goal types need different progress tracking
- UI complexity (goal creation needs type selector)

### Alternatives
- **Words only** — current state, excludes non-prose writers
- **Time-based goals** (minutes_per_day) — harder to track automatically

### Requirements

**Technical:**
- Extend Goal.type enum: `words_per_day`, `panels_per_day`, `pages_per_week`, `scenes_completed`
- ProgressLog.value is already generic (number) — works for all types
- Progress logging UI adapts to goal type (word count input vs panel count input)
- Streak calculation works the same regardless of type

**Functional:**
- Select goal type when creating goal
- Progress logging form adapts to type (label changes)
- Stats dashboard shows progress by type
- Streaks work across types (any progress counts)

**UI/UX:**
- Goal type selector (radio or select)
- Type-specific icons and labels
- Progress form: "Words written today" / "Panels drawn today" / "Pages written this week"

---

## Implementation Priority Order

| Order | Feature | Priority | Effort | Why First |
|---|---|---|---|---|
| 1 | **F2 — Export** | 🔴 P0 | 8h | Trust/prerequisite. Without export, serious writers won't commit content. |
| 2 | **F1 — Activity Feed** | 🟡 P1 | 6h | Social retention. Users need a reason to come back daily. |
| 3 | **F3 — Writing Stats** | 🟡 P1 | 6h | Personal motivation. Gamification loop completion. |
| 4 | **F4 — Comments** | 🟡 P1 | 5h | Social engagement. Feedback loop between writers and readers. |
| 5 | **F6 — OAuth** | 🔵 P2 | 2h | Quick win. Reduces sign-up friction immediately. |
| 6 | **F5 — Version History** | 🔵 P2 | 6h | Writer trust. Safety net for experimentation. |
| 7 | **F9 — Image Gallery** | 🔵 P2 | 4h | Visual world-building. Schema fields already exist. |
| 8 | **F8 — Search** | 🔵 P2 | 4h | Discovery. Becomes useful as content grows. |
| 9 | **F7 — Real-time Collab** | 🔵 P2 | 12h | Ambitious. Major differentiator but high complexity. |
| 10 | **F11 — Multi-format Goals** | ⚪ P3 | 3h | Audience expansion. Schema already supports it. |
| 11 | **F10 — Leaderboards** | ⚪ P3 | 3h | Social gamification. Opt-in only. |

---

## Notes

- All features should be **feature-flagged** behind the existing Redis-backed flag system (`lib/flags.ts`)
- API routes should use the standardized `error-response.ts` helpers
- All pages should follow the 3-state pattern (loading → error → loaded)
- Mutations should use optimistic updates with rollback
- Each feature needs a corresponding flag in the admin dashboard at `/admin/flags`
