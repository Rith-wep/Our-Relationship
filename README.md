# Our Little Universe

> A private, mobile-first Progressive Web App for two people to preserve memories, exchange letters, celebrate milestones, and plan their life together.

## Project status

**Frontend foundation implemented; product features remain planned.**

The repository contains a working React, Vite, and TypeScript application with Tailwind CSS, a responsive mobile app shell, five placeholder routes, reusable design-system components, strict static analysis, and formatting tools. Actual feature screens, Supabase integration, authentication, database schema, PWA behavior, and deployment are **planned functionality**, not completed features.

### Implemented now

- React 19 application built with Vite 8 and strict TypeScript 6
- Tailwind CSS 4 using its recommended Vite plugin
- React Router with placeholders for Home, Timeline, Memories, Love Letters, and Couple Profile
- Mobile-first tokens, safe-area spacing, accessible focus styles, and reduced-motion defaults
- Responsive `AppShell` with a centered 430 px desktop presentation and persistent bottom navigation
- Accessible five-item navigation using Lucide icons and route-aware active states
- Reusable `PageHeader`, `Button`, `IconButton`, `Card`, and `EmptyState` components
- Restrained Motion page transitions and button press feedback with reduced-motion support
- Interactive Relationship Timeline with typed memories, local demo data, add/edit/delete flows, photo preview, and accessible dialogs
- `@/` source import alias
- ESLint, Prettier, type-check, and production-build scripts
- Documented Supabase environment placeholders; Supabase itself is not connected

### Not implemented yet

- Home, Memories, Love Letters, and Couple Profile feature interfaces
- Supabase, authentication, couple pairing, database, Storage, or Realtime
- Media uploads, letters, memories, timeline behavior, and shared content
- PWA manifest, service worker, offline behavior, and deployment configuration

## Product vision

Our Little Universe is designed to feel like a thoughtful native couples app rather than a generic responsive website. Each partner has an individual account, while both belong to one invitation-linked, private relationship space. Shared content is collaborative and equally manageable by both partners.

The initial experience is optimized for a 390 px mobile viewport, with careful adaptation for larger phones, tablets, and desktop browsers. The product should remain intimate, calm, accessible, and visually polished without unnecessary visual effects or architectural complexity.

## Planned key features

### Home

- Couple names and photos
- Live relationship-duration counter
- Countdown to the next anniversary
- Daily love note
- Recent memories preview

### Timeline

- Chronological vertical timeline with connected milestone markers
- Photo and text memory cards
- Important relationship events
- Floating create-memory action
- Add, edit, soft-delete, restore, and permanently remove memories where appropriate

### Memories

- Shared photo and video gallery
- Albums, captions, dates, and metadata
- Full-screen media viewer
- Equal content-management permissions for both partners

### Love Letters

- Compose and privately send letters to a partner
- Read, save, and organize received letters
- Optional scheduled delivery for surprise letters

### Our Space / Profile

- Couple details and relationship start date
- Shared bucket list
- Important dates
- Personal account and application settings

## Technology stack

| Area           | Technology and status                                       |
| -------------- | ----------------------------------------------------------- |
| Frontend       | React 19, Vite 8, TypeScript 6 — implemented                |
| Styling        | Tailwind CSS 4 — implemented                                |
| Animation      | Motion for React — restrained shell motion implemented      |
| Routing        | React Router 8 — shell and placeholder routes implemented   |
| Icons          | Lucide React — navigation and empty-state icons implemented |
| Authentication | Supabase Auth                                               |
| Database       | Supabase PostgreSQL                                         |
| File storage   | Supabase Storage                                            |
| Live updates   | Supabase Realtime                                           |
| PWA            | Web app manifest, service worker, install support           |
| Hosting        | Vercel                                                      |

The intended architecture is a single React application backed by Supabase. No custom microservices are planned unless a later requirement cannot be handled securely by PostgreSQL, Supabase Edge Functions, or scheduled platform jobs.

## Design principles

- **Mobile first:** Design and validate at 390 px before progressively enhancing wider layouts.
- **Native-app feel:** Use a fixed bottom navigation, safe-area support, touch-friendly controls, predictable transitions, and focused screen layouts.
- **Warm restraint:** Favor white surfaces, coral-pink accents, elegant typography, rounded memory cards, subtle shadows, and deliberate spacing.
- **Human-designed hierarchy:** Give meaningful content priority; avoid template-like hero sections, dashboard clutter, excessive gradients, glassmorphism, and decorative noise.
- **Purposeful motion:** Use short, restrained animations for navigation, feedback, dialogs, and timeline changes. Respect `prefers-reduced-motion`.
- **Accessibility:** Target WCAG 2.2 AA practices, including semantic structure, keyboard support, visible focus states, sufficient contrast, text alternatives, accessible form errors, and minimum 44 × 44 px touch targets.
- **Responsive continuity:** Preserve the same information architecture across phone, tablet, and desktop rather than creating unrelated experiences.

## Architecture overview

The application will use a feature-oriented frontend structure. UI components will call typed feature services/hooks, while Supabase remains the system of record for authentication, relational data, media, and realtime events.

```text
React application
├── App shell, routes, and responsive navigation
├── Feature modules and shared design-system components
├── Authentication and couple-session providers
├── Typed Supabase client and data-access functions
└── PWA shell and bounded offline caching
        │
        ▼
Supabase
├── Auth: separate partner identities
├── PostgreSQL: couples, memberships, and shared content
├── Row Level Security: couple-scoped authorization
├── Storage: private couple media
└── Realtime: scoped change subscriptions
```

### Component architecture

- **App shell:** Route outlet, top-level loading/error states, fixed bottom navigation, safe-area layout, and authenticated session boundary.
- **Design system:** Buttons, inputs, cards, sheets, dialogs, avatars, badges, typography, empty states, skeletons, and feedback components.
- **Feature components:** Domain-specific views such as `RelationshipCounter`, `TimelineItem`, `MemoryCard`, `MediaViewer`, `LetterComposer`, and `BucketListItem`.
- **Providers:** Authentication session, active couple context, notifications/toasts, and reduced-motion preferences.
- **Data layer:** Typed queries and mutations grouped by feature. Server data should not be duplicated into global client state without a clear UI need.
- **Route screens:** Compose feature components and own page-level loading, empty, error, and permission states.

Business authorization will never rely on hidden buttons or client-side checks alone. Client guards improve navigation and user experience; PostgreSQL Row Level Security remains authoritative.

## Proposed frontend folder structure

The current implementation intentionally creates only folders that contain working setup code:

```text
src/
├── app/
│   ├── App.tsx
│   └── router/index.tsx
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── BottomNavigation.tsx
│   │   └── PageHeader.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── EmptyState.tsx
│       ├── IconButton.tsx
│       └── PagePlaceholder.tsx
├── features/
│   ├── couple/CouplePage.tsx
│   ├── home/HomePage.tsx
│   ├── letters/LettersPage.tsx
│   ├── memories/MemoriesPage.tsx
│   └── timeline/
│       ├── assets/*.svg
│       ├── components/
│       │   ├── MemoryCard.tsx
│       │   ├── MemoryDialog.tsx
│       │   ├── MemoryForm.tsx
│       │   ├── PhotoViewer.tsx
│       │   ├── TimelineItem.tsx
│       │   └── TimelineList.tsx
│       ├── data/demoMemories.ts
│       ├── TimelinePage.tsx
│       └── types.ts
├── styles/globals.css
├── main.tsx
└── vite-env.d.ts
```

The broader target structure below remains planned and will be introduced only as its features require it.

```text
src/
├── app/
│   ├── App.tsx
│   ├── providers/
│   ├── router/
│   └── styles/
├── assets/
├── components/
│   ├── layout/
│   └── ui/
├── features/
│   ├── auth/
│   ├── onboarding/
│   ├── home/
│   ├── timeline/
│   ├── memories/
│   ├── letters/
│   ├── bucket-list/
│   └── profile/
├── hooks/
├── lib/
│   ├── supabase/
│   ├── dates/
│   └── validation/
├── types/
├── test/
└── main.tsx

public/
├── icons/
├── manifest.webmanifest
└── static assets

supabase/                    # Planned once backend work begins
├── migrations/
├── functions/              # Only if secure server-side work is required
└── seed.sql                 # Local/test data only; never real private data
```

Feature directories may contain their own `components`, `hooks`, `api`, `schemas`, and `types` folders when justified. The structure should grow with the product rather than begin with empty abstractions.

## Implemented routing

| Path        | Current screen                |
| ----------- | ----------------------------- |
| `/`         | Home placeholder              |
| `/timeline` | Interactive Timeline frontend |
| `/memories` | Memories placeholder          |
| `/letters`  | Love Letters placeholder      |
| `/us`       | Couple Profile placeholder    |

Home, Memories, Love Letters, and Couple Profile intentionally contain only a page header and empty-state copy. Timeline is an interactive local-state frontend. Authentication guards and the expanded route plan below will be added in their corresponding phases.

## Implemented design system

- **App shell:** A single scrollable content region, modern viewport units, iOS/Android safe-area insets, horizontal-overflow prevention, and persistent bottom navigation.
- **Responsive presentation:** Edge-to-edge layout on phones and a centered, approximately 430 px application surface on larger screens without a decorative phone frame.
- **Navigation:** Five touch-friendly destinations with Lucide icons, route-aware active treatment, semantic navigation markup, and `aria-current` support from React Router.
- **Primitives:** Typed buttons, icon buttons, cards, page headers, and empty states with shared sizing, color, radius, shadow, focus, and disabled-state conventions.
- **Motion:** Short page fades/translations and press feedback only; system reduced-motion preferences disable nonessential movement.
- **Tokens:** Coral-pink accent, neutral surfaces and text, 12–16 px corner radii, subtle elevation, system typography, and consistent content widths.

## Implemented Timeline frontend

The `/timeline` route now provides a polished, responsive frontend prototype with:

- Chronological rendering, formatted dates, a connected vertical line, and milestone-specific Lucide icons
- Strongly typed memory and milestone models covering titles, descriptions, dates, photos, authorship, and audit timestamps
- Fictional demo memories kept in a separate data module with abstract local SVG artwork rather than photographs of real people
- Responsive memory cards, highlighted relationship/anniversary milestones, expandable descriptions, and full-screen photo viewing
- A shared mobile form for adding and editing memories with required-field validation and optional image selection
- Client-side image validation and preview using data URLs, avoiding unmanaged browser object URLs
- Delete confirmation plus an empty timeline state after all entries are removed
- Accessible modal semantics, focus trapping and restoration, Escape-key dismissal, background scroll locking, keyboard controls, and reduced-motion support

### Timeline limitations before Supabase

- Timeline state is held only in React memory. Added, edited, or deleted memories reset when the page is refreshed.
- Selected images remain only as in-memory data URLs and are not uploaded or persisted.
- The displayed author values are neutral demo/local labels; no authenticated user identity exists yet.
- Equal partner permissions are part of the planned Supabase authorization model and are not enforced by this frontend prototype.
- Deletion is immediate after confirmation; planned database-backed soft deletion and recovery are not implemented.

## Planned routing

```text
/
├── /sign-in
├── /sign-up
├── /auth/callback
├── /onboarding
│   ├── /profile
│   ├── /create-couple
│   └── /join/:inviteToken
└── /app                       # Authenticated and paired layout
    ├── /home
    ├── /timeline
    ├── /memories
    ├── /memories/:memoryId
    ├── /letters
    ├── /letters/new
    ├── /letters/:letterId
    └── /space
```

Public authentication routes, authenticated-but-unpaired onboarding routes, and authenticated-and-paired application routes will have separate guards. The app will validate membership from the database before rendering couple-scoped content.

## Authentication and couple onboarding

1. A person registers or signs in through Supabase Auth and completes their profile.
2. An unpaired user can create a couple space or follow a secure invitation link.
3. Creating a couple produces a short-lived, single-use invitation token. Only a hashed token should be stored; the raw token belongs only in the invitation URL.
4. The invited partner authenticates before accepting the invitation.
5. Acceptance runs as one atomic server-side database operation that validates token status, expiry, membership limits, and existing pairing.
6. A successful acceptance creates the second couple membership and consumes the invitation.
7. Both partners then receive equal permissions for shared content. Account-specific data, such as authentication settings, remains individually owned.

The data model will enforce at most two active memberships per couple. Re-pairing, leaving, or dissolving a shared space requires an explicit product and data-retention policy before implementation.

## Data model overview

All identifiers should use UUIDs, with UTC timestamps for storage and locale-aware formatting in the client. Shared entities carry a `couple_id`; user actions also record an actor/author ID for attribution and auditing.

| Entity               | Purpose                                                           | Important relationships / fields                                                   |
| -------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `profiles`           | Public-within-the-couple profile data for each authenticated user | `id` references `auth.users`; display name, avatar path                            |
| `couples`            | One private shared relationship space                             | name/label, relationship start date, created-by user                               |
| `couple_members`     | Membership and authorization boundary                             | unique user membership; `couple_id`, `user_id`, status, joined timestamp           |
| `couple_invitations` | Secure pairing invitations                                        | couple, token hash, expiry, invited email if used, consumed/revoked timestamps     |
| `memories`           | Timeline and gallery records                                      | couple, creator, title, caption, occurred date, importance, soft-delete timestamps |
| `memory_media`       | Ordered media attached to memories                                | memory, private storage path, media type, dimensions/duration, sort order          |
| `albums`             | Couple-scoped gallery collections                                 | couple, title, cover media, creator                                                |
| `album_memories`     | Many-to-many album membership                                     | album, memory, sort order                                                          |
| `letters`            | Partner-to-partner private letters                                | couple, sender, recipient, body, draft/scheduled/sent/read/saved state             |
| `love_notes`         | Short notes surfaced on Home                                      | couple, author, content, display date                                              |
| `important_dates`    | Anniversaries and meaningful dates                                | couple, label, date, recurrence rules                                              |
| `bucket_list_items`  | Shared goals and experiences                                      | couple, title, notes, status, completion metadata                                  |

### Relationship outline

```text
auth.users 1──1 profiles
auth.users 1──* couple_members *──1 couples
couples    1──* couple_invitations
couples    1──* memories 1──* memory_media
couples    1──* albums *──* memories
couples    1──* letters
couples    1──* love_notes
couples    1──* important_dates
couples    1──* bucket_list_items
```

Memory soft deletion should use `deleted_at` and `deleted_by`, exclude deleted rows by default, and provide a time-bounded recovery flow. Permanent deletion must also remove associated private storage objects through a trusted server-side process so database and storage state cannot silently diverge.

## Storage organization

Supabase Storage buckets will be private. Media paths should be opaque and scoped by couple without exposing personal names:

```text
couple-media/
└── {couple_id}/
    ├── memories/{memory_id}/{media_id}.{ext}
    ├── albums/{album_id}/covers/{media_id}.{ext}
    └── avatars/{user_id}/{version}.{ext}
```

- Authorization policies will derive access from authenticated couple membership, not trust a path supplied by the browser.
- Uploads will use generated object names, allowlisted MIME types, and enforced size limits.
- Images should be compressed/resized before or during upload where practical; video limits and transcoding expectations must be defined before launch.
- Private media will use authenticated downloads or short-lived signed URLs, never public bucket URLs.
- Metadata is stored in PostgreSQL; binary objects remain in Storage.

## Security and privacy

Privacy is a core data-model requirement, not only a UI feature.

- Enable Row Level Security on every application table and deny access by default.
- Allow reads and writes only when `auth.uid()` is an active member of the row's `couple_id`.
- Validate sender/recipient membership for letters and prevent changing immutable ownership fields through updates.
- Keep all Storage buckets private and apply equivalent membership policies to objects.
- Perform invite acceptance, scheduled delivery, and permanent media deletion through trusted database functions or server-side functions with narrowly scoped privileges.
- Never expose the Supabase service-role key in the browser. Only the public URL and anonymous/publishable key belong in client configuration.
- Validate input in both the client and database; constrain file type, size, text length, dates, and enum-like states.
- Rate-limit abuse-prone operations such as sign-in, invitations, letter scheduling, and uploads using available platform controls.
- Avoid placing private message or media content in analytics, logs, error reports, URL query strings, or notification previews.
- Define retention, account deletion, couple dissolution, export, backup, and recovery procedures before production launch.
- Add database indexes for membership and couple-scoped policy checks, then test RLS using two valid partners plus unrelated and unauthenticated users.

## Realtime synchronization

Supabase Realtime will subscribe only after authentication and couple membership resolution. Channels will be scoped to the active couple and limited to entities where immediate collaboration improves the experience, such as memories, bucket-list updates, love notes, and letter status.

The client should:

- Fetch canonical data first, then attach subscriptions.
- Apply payloads to an existing query cache instead of maintaining a separate realtime store.
- Use optimistic updates only for easily reversible actions and reconcile them with server responses.
- Prevent duplicate events using stable record IDs and update timestamps.
- Unsubscribe on sign-out, membership changes, or route/app teardown.
- Re-fetch after reconnect because realtime delivery is not a durable event queue.

Presence indicators, typing indicators, and custom event infrastructure are intentionally out of scope for the first release.

## PWA and offline behavior

Planned PWA support includes an installable manifest, application icons, theme colors, standalone display, service-worker updates, and an offline application shell.

Offline behavior will be deliberately limited because the product contains sensitive and collaborative data:

- Cache versioned static assets and the minimum application shell.
- Do not broadly cache private media, letters, authenticated API responses, or signed URLs in the service worker.
- Show clear offline and reconnecting states.
- Initially require a network connection for authentication, uploads, pairing, destructive actions, scheduled letters, and reliable cross-device synchronization.
- Consider offline drafts or a mutation queue only after conflict handling, device privacy, storage limits, and logout cleanup have been designed and tested.
- Provide an accessible update prompt rather than replacing an active session unexpectedly.

PWA installation improves convenience but does not make the web app equivalent to a fully offline native application.

## Environment variables

Planned client configuration:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Exact names may use Supabase's current publishable-key terminology during setup. Vite exposes variables prefixed with `VITE_` to the browser, so they must never contain service-role keys or other secrets.

Environment handling will follow these rules:

- Keep local values in ignored environment files and provide a sanitized example file during project setup.
- Configure separate Supabase projects or isolated environments for local/development, preview/staging, and production as the project matures.
- Store deployment values in Vercel Environment Variables with appropriate environment scope.
- Keep privileged secrets only in trusted server-side runtimes.
- Validate required configuration at application startup and return a clear developer-facing error when missing.

## Testing strategy

- **Static checks:** TypeScript strict mode, linting, formatting, and production builds in continuous integration.
- **Unit tests:** Date calculations, anniversary recurrence, duration formatting, validation schemas, permission helpers, and state transitions.
- **Component tests:** Forms, dialogs, navigation, memory cards, media states, reduced motion, accessibility, and error handling.
- **Integration tests:** Supabase queries, migrations, upload workflows, realtime reconciliation, and authenticated route guards.
- **Security tests:** RLS and Storage policy matrices covering partner A, partner B, an unrelated authenticated user, and an anonymous user.
- **End-to-end tests:** Registration, invitation pairing, memory lifecycle and recovery, media upload/viewing, letter delivery, and sign-out.
- **Responsive and accessibility checks:** Key viewport sizes beginning at 390 px, keyboard-only navigation, automated accessibility scans, and manual screen-reader review.
- **PWA checks:** Installation, offline shell, cache invalidation, update prompts, and cleanup after sign-out.

Tests should use synthetic data only. No real relationship content should appear in fixtures, snapshots, logs, or preview deployments.

## Development roadmap

### Phase 1 — Project setup and design system

- Initialize React, Vite, TypeScript, Tailwind CSS, routing, and quality tooling.
- Define color, typography, spacing, radius, shadow, motion, and responsive tokens.
- Build accessible foundational components and document core states.

### Phase 2 — Mobile navigation and static UI screens

- Build the app shell and native-style bottom navigation.
- Implement responsive static versions of Home, Timeline, Memories, Love Letters, and Our Space.
- Validate the information architecture at 390 px and larger breakpoints.

### Phase 3 — Supabase database and authentication

- Create the Supabase project, migrations, generated types, and environment configuration.
- Implement registration, sign-in, session handling, profiles, route guards, and baseline RLS.
- Establish automated policy tests before adding private content.

### Phase 4 — Couple pairing and shared permissions

- Implement couple creation and secure invitation acceptance.
- Enforce two-member constraints and equal couple-scoped permissions.
- Complete onboarding, expiry, revocation, and invitation error states.

### Phase 5 — Memories, timeline, and media uploads

- Implement memory CRUD, vertical timeline, albums, gallery, and viewer.
- Add private uploads, validation, progress, failure recovery, soft deletion, and restore.
- Add scoped realtime synchronization.

### Phase 6 — Love letters, anniversaries, and bucket list

- Implement letter drafts, sending, read/save state, and secure scheduled delivery.
- Add relationship counters, recurring important dates, daily notes, and bucket-list workflows.
- Test date and timezone behavior thoroughly.

### Phase 7 — PWA, animations, testing, and deployment

- Add the manifest, icons, service worker, installation experience, and safe offline shell.
- Refine restrained motion and reduced-motion behavior.
- Complete accessibility, security, responsive, performance, and end-to-end verification.
- Deploy production infrastructure and document operational procedures.

Each phase should leave the application testable and reviewable. Security policies and migrations should evolve alongside features rather than being postponed until launch.

## Local development

Prerequisites:

- A Node.js release compatible with Vite 8
- npm

Install and start the application:

```bash
git clone <repository-url>
cd Our-Relationship
npm install
npm run dev
```

Supabase is not connected, so no local Supabase or Docker setup is currently required. `.env.example` documents variables planned for the later integration.

Available scripts:

| Command                | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Start the Vite development server            |
| `npm run build`        | Type-check and create a production build     |
| `npm run lint`         | Run ESLint with zero warnings allowed        |
| `npm run typecheck`    | Run strict TypeScript project checks         |
| `npm run format`       | Format supported project files with Prettier |
| `npm run format:check` | Verify formatting without changing files     |

## Deployment strategy

- Deploy the Vite frontend to Vercel, with production builds gated by linting, type checks, tests, and a successful build.
- Use Vercel preview deployments for pull requests, connected only to non-production/synthetic data.
- Manage PostgreSQL schema and RLS as versioned Supabase migrations promoted through environments.
- Configure Supabase Auth redirect URLs for local, preview, and production origins with a strict allowlist.
- Configure client-safe environment values in Vercel and privileged values only in Supabase/server-side environments.
- Keep scheduled letter delivery in a trusted scheduled job or Edge Function; never rely on a recipient's browser being open.
- Apply database migrations before deploying frontend code that depends on them, using backward-compatible transitions when possible.
- Add production monitoring that minimizes personal data, plus alerts for authentication, function, database, and upload failures.
- Document rollback, backup verification, recovery, key rotation, and incident response before launch.

## Future improvements

Potential additions after the core experience is stable and validated:

- Encrypted data export and account/couple archive
- Optional biometric re-entry through platform-supported authentication
- Push notifications with privacy-conscious previews and granular consent
- Richer memory search, tags, and calendar/map views
- Collaborative trip planning, rituals, prompts, and relationship check-ins
- Carefully designed offline drafts and upload retry queues
- Automatic image optimization and a defined video-processing pipeline
- Localization, configurable date formats, and broader timezone support
- Expanded accessibility preferences and theme options, including dark mode

Future work should be driven by genuine use rather than feature count. Third-party integrations, complex social features, and custom backend services should be introduced only when their value outweighs their privacy and maintenance cost.

## Scope guardrails

- This is a private space for exactly two authenticated partners, not a social network.
- Supabase RLS and private Storage policies are the authorization boundary.
- Both partners have equal permissions over shared content; individual account controls remain personal.
- Maintain a single deployable frontend and managed backend until requirements prove otherwise.
- Treat privacy, accessibility, data recovery, and mobile interaction quality as release criteria.

---

Implementation should begin only after the architecture and product scope in this document have been reviewed and approved.
