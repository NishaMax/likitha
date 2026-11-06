# Likitha — Product and Implementation Plan

## 1. Product identity

- **Product name:** Likitha
- **Original concept/reference name:** Nor Akuru
- **Future primary domain:** `likitha.lk`
- **Current domain status:** Not required for local development or the first deployment. Purchase and connect it during the launch phase.
- **Meaning and positioning:** Likitha is a Sinhala-language publishing platform for Sri Lankan writers and readers.
- **Short description:** A free, moderated platform for publishing, discovering, reading, and discussing Sinhala short stories and serialised novels.
- **Comparable product:** Wattpad-style publishing and reading, adapted for Sri Lankan Sinhala content.
- **Suggested primary tagline:** `ලියන්න. බෙදාගන්න. හඳුනාගන්න.`
- **English translation:** Write. Share. Discover.
- **Alternative taglines:**
  - `ඔබේ කතාව ශ්‍රී ලංකාව කියයි.` — Your story, Sri Lanka speaks.
  - Where Sri Lanka's stories live.

All user-facing branding, metadata, emails, page titles, prompts, seed data, and deployment documentation must use **Likitha**. Do not use Akuru as the live product name or `akuru.lk` as a deployment target.

## 2. Goals and non-goals

### Goals

1. Let Sinhala-language writers create accounts and publish stories, poetry, songs, or serialised novels.
2. Let readers browse, search, follow writers, read chapters, like stories, and comment.
3. Require administrator approval before any story or chapter becomes public.
4. Provide writer engagement metrics and an automatic tier system.
5. Deliver a responsive, accessible, dark-first reading experience.
6. Launch with a manageable free infrastructure stack and a clear path to `likitha.lk`.

### Non-goals for MVP

- Paid content, subscriptions, tips, or paywalls.
- Native mobile applications.
- Nested comment threads.
- Chapter-level comments.
- Automatic admin account applications.
- Automatic tier downgrades.
- Light mode.
- Full social login implementation (leave OAuth as a future extension).
- Complex editorial scheduling. Manual publishing is sufficient for MVP even though scheduled releases may be added later.

## 3. Product rules

| Rule | Required behavior |
| --- | --- |
| Approval first | Stories, chapters, and profile updates must be reviewed before public publication where applicable. No unapproved content is visible publicly. |
| Separate chapter approval | Each chapter has its own draft, pending, approved, and rejected lifecycle. |
| Serialised stories | A story may contain any number of chapters and may be released one chapter at a time or in full. |
| Chapter identifiers | Store internal identifiers such as `story_001_chapter_001`; display friendly labels such as `Chapter 1`. |
| Language | Sinhala Unicode is the primary content language. UI may combine Sinhala and English. |
| Free access | Reading and writing are free during MVP. |
| Moderation | Admins may approve, reject, suspend, ban, or delete content/accounts according to platform policy. |
| Public visibility | Only published stories and approved chapters may appear in public pages, search, recommendations, or counters. |
| Account defaults | New accounts start as `READER`; an admin must grant the `WRITER` role. |

## 4. Users and primary journeys

### Reader journey

1. Visit the homepage without signing in.
2. Browse featured, trending, new, and genre-filtered stories.
3. Open a story page and read approved chapters.
4. Register or sign in to like, comment, and follow writers.
5. Receive future notifications when followed writers publish chapters.

### Writer journey

1. Register as a reader.
2. Request or receive writer access from an admin.
3. Create a story with title, Sinhala title, synopsis, genre, type, tags, and cover.
4. Add chapters in Sinhala and submit each chapter for review.
5. Review pending/rejected status and admin feedback.
6. Track views, likes, comments, followers, and tier progress.
7. Improve engagement and receive automatic tier upgrades.

### Admin journey

1. Sign in with an account whose role is `ADMIN`.
2. Review pending stories and chapters in oldest-first order.
3. Read the full submission and approve or reject it with a reason.
4. Manage users, roles, bans, verification, tiers, stories, and platform statistics.
5. Suspend or delete content that violates the platform policy.

## 5. Brand and design system

### Visual direction

Use a deep ink-and-parchment literary aesthetic: dark backgrounds, warm gold accents, comfortable Sinhala typography, and inviting story cards. Launch as dark-only; consider light mode in a later release.

### Color palette

| Token | Value | Use |
| --- | --- | --- |
| Page background | `#0F1117` | Application background |
| Card background | `#171B26` | Cards and panels |
| Elevated surface | `#1E2335` | Modals, menus, elevated controls |
| Gold accent | `#C8A96E` | Primary actions, branding, highlights |
| Body text | `#E8ECF4` | Main readable text |
| Muted text | `#9BA5C0` | Secondary labels and metadata |
| Success | `#4ADE80` | Approved/success states |
| Error | `#F87171` | Rejected/error states |
| Warning | `#FBBF24` | Pending/warning states |
| Info | `#60A5FA` | Informational states |

### Typography

- `Playfair Display`: hero text, story titles, section headings, and the Likitha wordmark.
- `Inter`: navigation, labels, descriptions, and general UI.
- `Noto Sans Sinhala`: all Sinhala content and Sinhala UI text.
- `JetBrains Mono`: codes, IDs, and admin/statistical values.
- Load `Noto Sans Sinhala` with weights 400 and 700. Validate rendering on Windows, Android, and iOS.

### UI rules

- Content card radius: 12–14px.
- Small controls: 8px radius.
- Badges: 20px or greater pill radius.
- Reading content: max-width `68ch`.
- Primary button: gold background with dark text.
- Secondary button: transparent with gold border.
- Danger button: red semantic color.
- Minimum touch target: 44px.
- Provide visible focus states, keyboard navigation, labels, and sufficient color contrast.

## 6. Recommended technical architecture

### Frontend and application

| Technology | Target | Reason |
| --- | --- | --- |
| Next.js | 14+ with App Router | SSR/SEO for public story pages and file-based routing |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 3.4+ | Consistent responsive styling |
| shadcn/ui | Current compatible release | Accessible base UI primitives |
| React Query | 5+ | Data fetching, caching, and optimistic interactions |
| Zustand | 4+ | Small client-side global state |

### Backend and data

| Technology | Target | Reason |
| --- | --- | --- |
| Next.js Route Handlers/API routes | MVP | One deployable application |
| Prisma ORM | 5+ | Type-safe PostgreSQL queries and migrations |
| PostgreSQL | 15+ | Relational stories, users, chapters, and interactions |
| NextAuth.js | v5 | Session and credentials authentication |
| bcrypt | Current compatible release | Password hashing |
| Zod | 3+ | Request and form validation |

### Hosted services

| Service | Purpose | MVP approach |
| --- | --- | --- |
| Vercel | Application hosting | Deploy the Next.js app |
| Supabase | PostgreSQL hosting | Use a managed database and pooled connection |
| Cloudflare R2 | Covers and profile images | Store media outside the application filesystem |
| Resend | Transactional email | Add during polish/launch |
| Upstash Redis | Rate limiting and cache | Add before public launch or when traffic requires it |

Do not hard-code credentials. Keep secrets in local environment files excluded from Git and in deployment environment variables.

## 7. Proposed repository structure

```text
likitha/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── browse/
│   │   ├── genre/[genre]/
│   │   ├── story/[id]/
│   │   └── writer/[username]/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-email/
│   │   └── forgot-password/
│   ├── (writer)/
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       ├── stories/
│   │       ├── story/new/
│   │       ├── story/[id]/
│   │       ├── story/[id]/chapter/new/
│   │       ├── story/[id]/chapter/[n]/edit/
│   │       ├── analytics/
│   │       └── profile/
│   └── (admin)/
│       └── admin/
│           ├── page.tsx
│           ├── queue/
│           ├── stories/
│           ├── users/
│           └── tiers/
├── components/
│   ├── ui/
│   ├── story/
│   ├── writer/
│   └── admin/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── tier.ts
│   └── validations/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── fonts/
├── middleware.ts
├── .env.example
└── README.md
```

## 8. Database design

The following schema is the MVP baseline. Add indexes and audit fields during implementation where query patterns require them.

```prisma
model User {
  id            String     @id @default(cuid())
  email         String     @unique
  username      String     @unique
  displayName   String
  passwordHash  String
  bio           String?
  avatarUrl     String?
  role          Role       @default(READER)
  tier          WriterTier @default(BRONZE)
  tierScore     Int        @default(0)
  isVerified    Boolean    @default(false)
  isBanned      Boolean    @default(false)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  stories       Story[]
  comments      Comment[]
  likes         Like[]
  followers     Follow[]   @relation("following")
  following     Follow[]   @relation("follower")
}

model Story {
  id            String      @id @default(cuid())
  storyCode     String      @unique
  title         String
  titleSinhala  String?
  synopsis      String
  coverUrl      String?
  genre         Genre
  tags          String[]
  storyType     StoryType   @default(SERIAL)
  status        StoryStatus @default(DRAFT)
  authorId      String
  author        User        @relation(fields: [authorId], references: [id])
  totalChapters Int         @default(0)
  viewCount     Int         @default(0)
  likeCount     Int         @default(0)
  commentCount  Int         @default(0)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  chapters      Chapter[]
  likes         Like[]
  comments      Comment[]
}

model Chapter {
  id            String        @id @default(cuid())
  chapterCode   String
  chapterNumber Int
  title         String
  content       String
  wordCount     Int           @default(0)
  status        ContentStatus @default(PENDING)
  adminNote     String?
  storyId       String
  story         Story         @relation(fields: [storyId], references: [id])
  publishedAt   DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@unique([storyId, chapterNumber])
  @@index([status, createdAt])
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  storyId   String
  story     Story    @relation(fields: [storyId], references: [id])
  createdAt DateTime @default(now())
}

model Like {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  storyId   String
  story     Story    @relation(fields: [storyId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, storyId])
}

model Follow {
  id          String @id @default(cuid())
  followerId  String
  follower    User   @relation("follower", fields: [followerId], references: [id])
  followingId String
  following   User   @relation("following", fields: [followingId], references: [id])

  @@unique([followerId, followingId])
}

enum Role {
  READER
  WRITER
  ADMIN
}

enum WriterTier {
  BRONZE
  SILVER
  GOLD
  DIAMOND
  FEATURED
}

enum Genre {
  ROMANCE
  FANTASY
  HORROR
  THRILLER
  DRAMA
  COMEDY
  HISTORICAL
  SCIFI
  FOLKLORE
  OTHER
}

enum StoryType {
  SERIAL
  ONESHOT
}

enum StoryStatus {
  DRAFT
  PENDING
  PUBLISHED
  REJECTED
  SUSPENDED
}

enum ContentStatus {
  DRAFT
  PENDING
  APPROVED
  REJECTED
}
```

### Data integrity requirements

- Enforce one like per user/story and one follow per follower/following pair with unique constraints.
- Enforce one chapter number per story.
- Use transactions when approving a chapter, updating the story chapter count, and awarding tier points.
- Never trust client-provided author IDs, roles, statuses, counts, or tier values.
- Recalculate or validate denormalized counters when needed.
- Add moderation/audit history before broad public launch if admin accountability is required.

## 9. Routes and access control

### Public routes

| Route | Purpose |
| --- | --- |
| `/` | Hero, featured stories, trending stories, genres, and new arrivals |
| `/browse` | Search, genre filter, and trending/new/top-rated sorting |
| `/story/[id]` | Story cover, synopsis, author, approved chapter list, likes, and comments |
| `/story/[id]/chapter/[n]` | Sinhala reading view, navigation, like, and comment |
| `/writer/[username]` | Public writer profile, tier badge, stories, and followers |
| `/genre/[genre]` | Genre-filtered public stories |

### Authentication routes

| Route | Purpose |
| --- | --- |
| `/login` | Email/password sign-in |
| `/register` | Account creation as `READER` |
| `/verify-email` | Verify email address |
| `/forgot-password` | Password reset flow |

### Writer routes

All `/dashboard/*` routes require an authenticated `WRITER` or `ADMIN` user. Writer-owned records must be checked on every mutation.

| Route | Purpose |
| --- | --- |
| `/dashboard` | Stats, tier progress, and recent activity |
| `/dashboard/stories` | Story list and status badges |
| `/dashboard/story/new` | Create story |
| `/dashboard/story/[id]` | Manage story and chapters |
| `/dashboard/story/[id]/chapter/new` | Create and submit a chapter |
| `/dashboard/story/[id]/chapter/[n]/edit` | Edit draft/rejected chapter |
| `/dashboard/analytics` | Views, likes, comments, followers, and tier score |
| `/dashboard/profile` | Edit bio, avatar, and social links |

### Admin routes

Every `/admin/*` route requires `role === ADMIN` in middleware and server-side authorization.

| Route | Purpose |
| --- | --- |
| `/admin` | Pending counts, approvals, flagged items, and platform stats |
| `/admin/queue` | Oldest-first approval queue |
| `/admin/queue/[id]` | Full submission review |
| `/admin/stories` | All stories with status filters |
| `/admin/users` | View, ban, verify, and change roles |
| `/admin/tiers` | Configure/inspect thresholds and manual tier overrides |

## 10. API behavior

Implement route handlers with Zod validation, authentication checks, ownership checks, explicit error responses, and consistent response shapes.

### Authentication

- `POST /api/auth/register`
  - Validate email, username, display name, and password.
  - Hash the password with bcrypt.
  - Create the user with `role=READER`.
  - Reject duplicate email/username with a clear client-safe error.
- NextAuth credentials login must reject banned or unverified users according to the final account policy.

### Stories and chapters

- `POST /api/stories`
  - Requires writer authorization.
  - Create a draft story and generate a unique `story_XXX` code.
- `GET /api/stories/[id]`
  - Return only public story fields and approved chapters.
  - Do not expose rejected notes or unpublished content to unauthorised users.
- `POST /api/stories/[id]/chapters`
  - Requires story ownership.
  - Validate title/content, calculate word count, generate chapter code, and set status to `PENDING` only when explicitly submitted.
- `PATCH /api/admin/chapters/[id]/approve`
  - Requires admin authorization.
  - Transactionally set `APPROVED`, set `publishedAt=now()`, increment `totalChapters` only once, and award +2 points.
- `PATCH /api/admin/chapters/[id]/reject`
  - Requires admin authorization.
  - Require a non-empty `adminNote`, set `REJECTED`, and notify the writer when email is enabled.

### Engagement

- Like toggles must be authenticated and idempotent.
- Comment creation must validate length and sanitize/render as text, not executable HTML.
- Follow toggles must prevent self-follow unless explicitly supported.
- Chapter view tracking must deduplicate by session and use rate limiting.

## 11. Feature specifications

### Story and chapter state machine

```text
DRAFT -> (writer submits) -> PENDING
PENDING -> (admin approves) -> APPROVED -> publishedAt = now()
PENDING -> (admin rejects) -> REJECTED + adminNote
REJECTED -> (writer edits) -> DRAFT
```

Chapter codes use `story_001_chapter_001` format internally. Readers see `Chapter 1` and optional page/word metadata, not internal IDs.

### Moderation workflow

1. Writer submits a story or chapter.
2. System changes status to `PENDING` and shows an under-review badge.
3. Admin opens the queue and reads the full content.
4. Admin approves it, making it public, or rejects it with a written reason.
5. Writer receives the result and may edit/re-submit rejected content.

### Likes, comments, views, and follows

- One like per user per story; toggling unlike removes its tier points.
- Comments are basic text in MVP, attached to stories rather than chapters.
- Writers may reply only if a reply model is added; otherwise defer replies until the model is designed.
- Views are tracked per session to avoid requiring authentication and feed the trending algorithm.
- Readers follow writers; follower counts appear on public profiles.

### Notifications

Phase 2 email events:

- New approved chapter from a followed writer.
- Story/chapter approval or rejection.
- New comment for a writer.
- Tier upgrade.

## 12. Writer tier system

### Tier thresholds

| Tier | Rule |
| --- | --- |
| Bronze | Default; 0–99 points |
| Silver | 100+ points |
| Gold | 500+ points |
| Diamond | 2,000+ points and top 10% over the last 90 days |
| Featured | Admin nomination only |

### Points

| Action | Points | Constraint |
| --- | ---: | --- |
| Unique story view | +1 | Maximum 50 points per story per day |
| Like received | +5 | Remove when undone |
| Comment received | +3 | Per unique commenter |
| New follower | +10 | Remove when unfollowed |
| Story completed | +50 | One-time bonus |
| Chapter approved | +2 | Once per approved chapter |

Implement `calculateTier(score)` and `addTierScore(userId, points)` in `lib/tier.ts`. `FEATURED` must never be replaced by automatic calculation. Use a transaction or atomic update for score changes. Tier upgrades are automatic and downgrades are not automatic; administrators may override a tier.

Tier benefits:

- Bronze: basic profile, publishing access, standard queue.
- Silver: badge and priority browse placement.
- Gold: badge, Rising Writers placement, analytics.
- Diamond: badge, faster queue treatment, genre featuring.
- Featured: homepage hero placement, promotion, special profile frame.

## 13. Build phases

### Phase 0 — Decisions and setup

**Exit criteria**

- Confirm product name is Likitha and reserve the future domain plan for `likitha.lk`.
- Decide the initial admin owner and moderation policy.
- Create the Next.js/TypeScript project and environment-variable template.
- Define privacy, community, copyright, and content policies before public beta.

### Phase 1 — Foundation (weeks 1–2)

- Configure Next.js App Router, TypeScript, Tailwind, shadcn/ui, fonts, and dark theme.
- Configure Supabase PostgreSQL and Prisma.
- Add schema, migrations, seed script, 2–3 sample stories, and a development admin account.
- Implement NextAuth v5 credentials authentication.
- Implement registration, login, verification placeholder, password reset placeholder, and protected middleware.
- Add role-aware server authorization utilities.

**Exit criteria:** A new user can register/login, a seeded admin can log in, migrations run cleanly, and protected routes reject unauthorised access.

### Phase 2 — Writer dashboard (weeks 3–4)

- Story list and dashboard stats.
- New story form with title, Sinhala title, synopsis, genre, type, tags, and cover upload.
- Story manager and chapter editor with Sinhala support.
- Draft/pending/rejected/approved status badges.
- Admin rejection note display.
- Writer ownership checks and validation.

**Exit criteria:** A writer can create a story, create a chapter, submit it, and see its status without exposing it publicly.

### Phase 3 — Admin panel (week 5)

- Oldest-first approval queue for stories and chapters.
- Full content review screen.
- Approve/reject actions with required rejection note.
- User management, role changes, bans, verification, and tier override.
- Basic platform statistics.

**Exit criteria:** An admin can approve a submission exactly once, reject it with feedback, and see the correct public/private result.

### Phase 4 — Public reading (week 6)

- Homepage, browse, genre pages, story details, and writer profile.
- Approved-only chapter list and reading route.
- Noto Sans Sinhala reading typography: 18px baseline, 1.8 line-height, max-width 68ch.
- Likes, comments, follows, and session-deduplicated views.
- Responsive navigation and mobile reading layout.

**Exit criteria:** An unauthenticated reader can discover and read approved content; authenticated readers can engage without duplicate records.

### Phase 5 — Tier system (week 7)

- Tier calculation and atomic score updates.
- Point awarding/removal for likes, comments, follows, views, completions, and approvals.
- Tier badge component and progress display.
- Tier placement in profiles, cards, and dashboard.

**Exit criteria:** Automated tests prove threshold behavior, idempotency, and protection of admin-set Featured status.

### Phase 6 — Polish and launch (week 8)

- Resend notifications.
- SEO titles, descriptions, canonical URLs, Open Graph images, and sitemap.
- Rate limiting on auth, comments, likes, follows, and view endpoints.
- Accessibility and mobile audit.
- Error logging, backups, monitoring, and moderation runbook.
- Seed 10–15 real beta stories with permission from writers.
- Deploy to Vercel.
- Purchase/configure `likitha.lk`, add DNS, TLS, redirects, and canonical host settings.

**Exit criteria:** Production smoke tests pass, backups and admin recovery are documented, and all public content is approved.

## 14. Testing and quality gates

### Automated tests

- Zod schemas reject invalid and oversized inputs.
- Authentication rejects invalid credentials and banned users.
- Role middleware blocks readers from writer/admin routes.
- Ownership checks block cross-user story/chapter edits.
- Chapter state transitions reject invalid transitions.
- Approval is idempotent and updates related counters/points transactionally.
- Unique like/follow constraints hold under concurrent requests.
- Tier boundaries are correct at 99/100, 499/500, and 1,999/2,000.
- Featured tier is not overwritten.
- Public queries exclude drafts, pending, rejected, and suspended content.

### Manual checks

- Sinhala text renders correctly on supported browsers and mobile devices.
- Reading layout remains comfortable at narrow and wide widths.
- Keyboard navigation and visible focus states work.
- Error, loading, empty, and permission-denied states are clear.
- Admin cannot accidentally approve the same submission twice.
- Image upload rejects unsupported types and unsafe sizes.

### Pre-launch operational checks

- Environment variables are present and secrets are not committed.
- Database migrations and rollback/recovery procedure are documented.
- Email sender domain and bounce handling are configured when notifications launch.
- Rate limits are enabled before public promotion.
- Content reporting and account-ban procedures are documented.

## 15. Domain and deployment plan

1. Develop locally without requiring a purchased domain.
2. Deploy an early private/staging build on a Vercel preview URL.
3. Purchase `likitha.lk` through the LK Domain Registry or an authorised local registrar when the brand is ready.
4. Configure DNS records required by Vercel and verify TLS.
5. Set the canonical production URL to `https://likitha.lk`.
6. Configure `www.likitha.lk` redirect behavior consistently.
7. Update Next.js metadata, sitemap, robots, email links, OAuth callback URLs, and CORS/origin allowlists.
8. Retain the deployment URL for operational access, but do not expose it as the canonical public URL.

`akuru.lk`, `akuru.com.lk`, and other former Akuru options are out of scope unless the owner later requests a separate redirect or defensive registration.

## 16. Security, privacy, and moderation controls

- Hash passwords with bcrypt; never log passwords or tokens.
- Use secure, HTTP-only cookies and appropriate production session settings.
- Validate all request bodies with Zod and enforce server-side authorization.
- Sanitize comment/content rendering and do not render untrusted HTML.
- Restrict image uploads by MIME type, size, extension, and storage key.
- Rate-limit login, registration, password reset, comments, likes, follows, and view tracking.
- Prevent enumeration through duplicate-account and password-reset responses where appropriate.
- Keep admin actions auditable.
- Provide report, takedown, copyright, privacy, and community policy pages before public launch.
- Back up PostgreSQL and test restoration.

## 17. Copilot implementation prompts

Use these prompts after the repository and environment are initialized. Each prompt must say **Likitha**, never Akuru.

### Prompt 1 — Bootstrap

```text
I am building "Likitha", a Sinhala-language story and novel publishing platform for Sri Lanka, based on the Nor Akuru concept. Use Next.js 14+ App Router, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL/Supabase, NextAuth v5, and shadcn/ui.

Create the initial project structure with:
- next.config configured for Cloudflare R2 image URLs
- Tailwind dark-mode class strategy using #0f1117 and #c8a96e
- Prisma schema for User, Story, Chapter, Comment, Like, and Follow
- enums Role, WriterTier, Genre, StoryType, StoryStatus, and ContentStatus
- lib/prisma.ts singleton
- middleware protecting /dashboard/* and /admin/*
- .env.example with placeholders only

New users must default to READER. Admin must explicitly grant WRITER access.
```

### Prompt 2 — Authentication

```text
In the Likitha project, implement NextAuth v5 credentials authentication:
- POST /api/auth/register with Zod validation and bcrypt hashing
- login, register, verify-email, and forgot-password pages
- new accounts created with role=READER
- banned users rejected
- protected server-side route authorization for dashboard and admin pages
- dark Likitha styling with #0f1117 background and #c8a96e accent

Do not expose password hashes, tokens, or secrets in responses or logs.
```

### Prompt 3 — Story and chapter submission

```text
In the Likitha project, build the writer submission flow:
- story creation form with title, titleSinhala, synopsis, genre, storyType, tags, and cover upload
- POST /api/stories creates an owned DRAFT story with unique story_XXX code
- chapter editor with Sinhala text support
- POST /api/stories/[id]/chapters validates ownership and creates a chapter with a unique chapter code
- submitted content becomes PENDING and is never public before admin approval
- show DRAFT, PENDING, APPROVED, and REJECTED badges
- show adminNote on rejected chapters

Validate all input with Zod and never trust client-provided author IDs or statuses.
```

### Prompt 4 — Admin approval

```text
In the Likitha project, build the admin approval queue:
- /admin/queue lists pending chapters oldest first
- each row shows story title, chapter number, writer, tier, word count, and submitted time
- review page shows full content
- PATCH /api/admin/chapters/[id]/approve transactionally sets APPROVED, sets publishedAt, increments totalChapters once, and awards +2 tier points
- PATCH /api/admin/chapters/[id]/reject requires a non-empty adminNote and sets REJECTED
- enforce ADMIN authorization in middleware and in every server handler
- make approval idempotent and return explicit errors for invalid state transitions
```

### Prompt 5 — Public reading

```text
In the Likitha project, build public reading pages:
- homepage, browse, genre, story detail, chapter reading, and writer profile pages
- only published stories and APPROVED chapters may be returned publicly
- chapter text uses Noto Sans Sinhala, 18px font size, 1.8 line-height, and max-width 68ch
- include previous/next chapter navigation
- add authenticated story likes and comments
- add writer follows
- track chapter/story views per deduplicated session
- include SEO metadata and canonical URLs prepared for https://likitha.lk
```

### Prompt 6 — Tier scoring

```text
In the Likitha project, implement lib/tier.ts:
- calculateTier(score): 0-99 BRONZE, 100-499 SILVER, 500-1999 GOLD, 2000+ DIAMOND
- FEATURED is admin-only and must never be overwritten automatically
- addTierScore uses an atomic or transactional update
- award/remove points for likes, comments, follows, views, story completion, and approved chapters
- enforce the 50 points per story per day view cap
- add TierBadge and writer dashboard progress
- add tests for all threshold boundaries, duplicate events, and Featured protection
```

## 18. Definition of done

The MVP is complete when:

1. Likitha branding is used everywhere and no live configuration points to Akuru.
2. Registration, login, roles, bans, and protected routes work.
3. Writers can create stories and submit chapters.
4. Admins can approve/reject with notes and invalid transitions are blocked.
5. Readers can browse and read approved Sinhala content.
6. Likes, comments, follows, and deduplicated views work without duplicate records.
7. Tier scoring and badges work at every threshold.
8. Responsive, accessible, dark-first UI passes manual review.
9. Security, backup, moderation, and error-handling checks pass.
10. Production deployment is ready for `likitha.lk`, with DNS/TLS/canonical URL configuration documented.
