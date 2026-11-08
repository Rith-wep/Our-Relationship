# Our Little Universe

> A private, mobile-first Progressive Web App for two people to preserve memories, exchange letters, celebrate milestones, and plan their life together.

## Project status

**Frontend, Supabase Auth, secure couple onboarding, and database-backed relationship features are implemented.**

The repository contains a working React, Vite, and TypeScript application with Tailwind CSS, a responsive mobile app shell, interactive Home, Timeline, Memories, Love Letters, and Our Space screens, reusable design-system components, strict static analysis, and formatting tools. Supabase provides authentication, hosted PostgreSQL persistence, invitation-based couple pairing, RLS authorization, private mailboxes, private media, and Realtime synchronization. PWA behavior and deployment remain planned.

### Implemented now

- React 19 application built with Vite 8 and strict TypeScript 6
- Tailwind CSS 4 using its recommended Vite plugin
- React Router with lazy-loaded Home, Timeline, Memories, Love Letters, and Our Space routes
- Mobile-first tokens, safe-area spacing, accessible focus styles, and reduced-motion defaults
- Responsive `AppShell` with a centered 430 px desktop presentation and persistent bottom navigation
- Accessible five-item navigation using Lucide icons and route-aware active states
- Reusable `PageHeader`, `Button`, `IconButton`, `Card`, and `EmptyState` components
- Restrained Motion page transitions and button press feedback with reduced-motion support
- Interactive Relationship Timeline with persistent typed memories, add/edit/delete/restore flows, and accessible dialogs
- Premium Home frontend with a couple hero, live relationship duration, anniversary countdown, daily notes, recent memories, and quick actions
- Database-backed `MemoriesProvider` synchronizing Home, Timeline, and Memories
- Interactive Memories Gallery with filters, details, favorites, soft deletion, restoration, and permanent removal
- Interactive Love Letters with simulated partner identities, mailbox tabs, drafts, reading, favorites, and soft deletion
- Database-backed `LettersProvider` with draft ownership, recipient read state, and independent mailboxes
- Database-backed `CoupleProvider` synchronizing profiles, dreams, and important dates
- Interactive dreams, important dates, and honest planned settings in Our Space
- `@/` source import alias
- ESLint, Prettier, type-check, and production-build scripts
- Documented Supabase environment placeholders; hosted application data is not connected
- Supabase JavaScript client with publishable-key configuration and legacy anon-key fallback
- Email/password registration, login, logout, session restoration, password recovery, and protected application routes
- Hosted migration safety plan with a mandatory remote-inspection and approval gate
- Hosted migration and post-deployment verification report for the confirmed production project
- Versioned Supabase PostgreSQL schema, RLS policies, invitation workflows, private Storage policies, and locally passing pgTAP security suites
- All four migrations applied to hosted project `jthkuepideccbiqjqeci` and structurally verified
- Authenticated couple onboarding with profile creation, shared-space creation, email-bound seven-day invitation links, and secure invitation acceptance
- Database-backed membership identity in Love Letters; the development Partner A/B switcher has been removed
- Private memory photo/video uploads with validation, PostgreSQL metadata, short-lived signed URLs, progress states, replacement, and deletion cleanup
- Private profile-photo upload/removal with owner-only writes and partner-readable signed URLs
- Scoped Realtime channels for memories, letters, mailboxes, profiles, couple details, dreams, and important dates
- Debounced refreshes, automatic channel cleanup, reconnection handling, and a non-blocking reconnect notice
- Optional city, country, and timezone per partner without precise or live location collection
- Optional shared next-meeting date with a compact Home countdown
- One-tap, timestamped Thinking of You signals with couple-scoped RLS and Realtime updates
- Shared light-mode application backgrounds with six presets, an optional custom color, automatic contrast handling, persistence, and Realtime synchronization

### Not implemented yet

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
| Authentication | Supabase Auth — client foundation implemented               |
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
│   ├── providers/
│   │   ├── couple-context.ts
│   │   ├── CoupleProvider.tsx
│   │   ├── letters-context.ts
│   │   ├── LettersProvider.tsx
│   │   ├── memories-context.ts
│   │   ├── MemoriesProvider.tsx
│   │   ├── useLetters.ts
│   │   ├── useCouple.ts
│   │   └── useMemories.ts
│   └── router/
│       ├── index.tsx
│       └── RoutePages.tsx
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
│   ├── couple/
│   │   ├── components/
│   │   │   ├── CoupleProfile.tsx
│   │   │   ├── CoupleSettings.tsx
│   │   │   ├── DreamForm.tsx
│   │   │   ├── DreamsList.tsx
│   │   │   ├── EditCoupleProfile.tsx
│   │   │   ├── ImportantDates.tsx
│   │   │   └── SpecialDateForm.tsx
│   │   ├── data/
│   │   ├── CouplePage.tsx
│   │   ├── date-utils.ts
│   │   └── types.ts
│   ├── home/
│   │   ├── components/
│   │   │   ├── AnniversaryCard.tsx
│   │   │   ├── CoupleHero.tsx
│   │   │   ├── DailyLoveNote.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   ├── RecentMemories.tsx
│   │   │   └── RelationshipCounter.tsx
│   │   ├── data/
│   │   │   └── loveNotes.ts
│   │   ├── hooks/useRelationshipDuration.ts
│   │   └── HomePage.tsx
│   ├── letters/
│   │   ├── components/
│   │   │   ├── ComposeLetterDialog.tsx
│   │   │   ├── DeletedLetters.tsx
│   │   │   ├── LetterCard.tsx
│   │   │   ├── LetterReader.tsx
│   │   │   ├── LetterTabs.tsx
│   │   │   └── AuthenticatedIdentity.tsx
│   │   ├── LettersPage.tsx
│   │   ├── types.ts
│   │   └── view-types.ts
│   ├── memories/
│   │   ├── components/
│   │   │   ├── GalleryCard.tsx
│   │   │   ├── MemoryDetail.tsx
│   │   │   ├── MemoryFilters.tsx
│   │   │   └── RecentlyDeleted.tsx
│   │   ├── MemoriesPage.tsx
│   │   └── types.ts
│   └── timeline/
│       ├── assets/*.svg
│       ├── components/
│       │   ├── MemoryCard.tsx
│       │   ├── MemoryDialog.tsx
│       │   ├── MemoryForm.tsx
│       │   ├── PhotoViewer.tsx
│       │   ├── TimelineItem.tsx
│       │   └── TimelineList.tsx
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

| Path               | Current screen                          |
| ------------------ | --------------------------------------- |
| `/`                | Interactive Home frontend               |
| `/timeline`        | Interactive Timeline frontend           |
| `/memories`        | Interactive Memories Gallery            |
| `/letters`         | Interactive Love Letters                |
| `/us`              | Interactive Our Space                   |
| `/login`           | Supabase email/password login           |
| `/register`        | Supabase account registration           |
| `/forgot-password` | Password recovery request               |
| `/reset-password`  | Password update from a recovery session |
| `/onboarding`      | Create or securely join a couple space  |

The five application routes require both a restored Supabase Auth session and a real couple membership. Unpaired users are directed to onboarding. Relationship content is loaded from couple-scoped PostgreSQL tables through RLS-protected browser queries.

## Implemented design system

- **App shell:** A single scrollable content region, modern viewport units, iOS/Android safe-area insets, horizontal-overflow prevention, and persistent bottom navigation.
- **Responsive presentation:** Edge-to-edge layout on phones and a centered, approximately 430 px application surface on larger screens without a decorative phone frame.
- **Navigation:** Five touch-friendly destinations with Lucide icons, route-aware active treatment, semantic navigation markup, and `aria-current` support from React Router.
- **Primitives:** Typed buttons, icon buttons, cards, page headers, and empty states with shared sizing, color, radius, shadow, focus, and disabled-state conventions.
- **Motion:** Short page fades/translations and press feedback only; system reduced-motion preferences disable nonessential movement.
- **Tokens:** Coral-pink accent, neutral surfaces and text, 12–16 px corner radii, subtle elevation, system typography, and consistent content widths.

## Shared couple state and Our Space

`CoupleProvider` loads the authenticated couple, both partner profiles, dreams, and important dates from Supabase. Shared relationship date and description are editable by either partner. Each account can edit only its own display name, matching profile RLS ownership. Mutations reload canonical database state so Home and `/us` remain synchronized.

The implemented Our Space frontend includes:

- A polished profile with two editable partners, local photo previews, relationship date, description, and live total days together
- A shared future-dream list with typed categories, add/edit/delete actions, planned/completed filtering, completion toggles, and a restrained progress bar
- Important relationship dates with annual recurrence, upcoming-day calculations, custom add/edit/delete flows, and safe leap-year/month-end clamping
- A minimal settings area that links back to profile editing and honestly labels authentication, notifications, accounts, and cloud privacy as planned

Profile photos use private Storage objects and signed URLs. Each member can replace or remove only their own photo. No base64 or fictional profile data is persisted. The profile Storage migration is deployed and verified.

## Shared frontend memory architecture

`MemoriesProvider` loads the couple-scoped PostgreSQL collection used by Home, Timeline, and Memories. The `useMemories` hook exposes active and deleted views plus create, update, soft-delete, restore, permanent-delete, and favorite-toggle operations.

- Active views automatically exclude records with a `deletedAt` timestamp.
- Soft deletion records `deletedAt`, `deletedBy`, and an updated timestamp without removing the memory.
- Restoration clears deletion metadata; permanent removal is available only from Recently Deleted after confirmation.
- Favorites remain a boolean property on the shared memory record rather than a separate model.
- Media is stored as private Storage objects; only object paths and validated metadata are stored in PostgreSQL.
- Signed display URLs expire after one hour and are recreated when provider data reloads.
- Every mutation is persisted through Supabase and reloaded into the shared provider.
- Route-level lazy loading keeps feature screens in separate production chunks.

JPEG, PNG, WebP, GIF, MP4, and WebM uploads are supported up to the private bucket's 25 MiB limit. Upload/database failures use compensating cleanup to avoid leaving newly uploaded objects unmanaged.

## Shared frontend letter architecture

`LettersProvider` loads the authenticated user's RLS-filtered correspondence and mailbox rows. It exposes draft creation/editing/deletion, sending, recipient-only read transitions, per-user favorites, independent soft deletion, and restoration.

- Letter records include database-oriented IDs, couple/sender/recipient relationships, draft/sent status, audit timestamps, read state, favorite state, and nullable deletion metadata.
- Draft and read-state authorization is enforced by PostgreSQL policies and triggers, not client identity parameters.
- Sending is restricted to the current draft owner and requires non-empty title and body values. Already-sent letters cannot be sent again.
- Opening a received sent letter marks it read; viewing the same letter from its sender's Sent box does not.
- Soft-deleted letters are hidden from Inbox, Sent, and Drafts and can be restored from Recently Deleted.
- Letter content and mailbox state survive refresh and sign-out/sign-in.

The eventual Supabase implementation will map these records to PostgreSQL, replace the identity simulator with authenticated membership, enforce sender/recipient access with RLS, and synchronize mutations through the shared data layer.

## Implemented Love Letters frontend

The `/letters` route provides a private correspondence experience with:

- Inbox, Sent, and Drafts views that update for the selected fictional Partner A or Partner B identity
- Clear sender, recipient, date, preview, unread, and optional favorite treatments
- A development-only identity switcher explicitly labeled as simulation rather than authentication
- A mobile writing dialog with an automatic recipient, accessible labels, title/body validation, draft saving, send protection, character count, and discard confirmation
- Draft editing limited to the simulated sender who owns the draft
- A focused ivory reading view with comfortable serif typography, paragraph spacing, signature, favorite, delete, back, and draft-only edit actions
- Recipient-only read-state updates based on the authenticated Supabase identity
- Friendly Inbox, Sent, Drafts, and Recently Deleted empty states
- Soft deletion and restoration for both sent letters and drafts

### Love Letters limitations before Supabase

- Partner switching is a removable developer simulation and provides no identity verification or security.
- Letters, drafts, per-user favorites, read timestamps, and mailbox deletions persist in PostgreSQL.
- There is no delivery service, notification, scheduling, encryption layer, or cross-device synchronization.
- Deletion affects the single shared frontend record for both simulated partners; production behavior requires an explicit retention and per-user visibility policy.
- Browser-native confirmation is used when discarding unsaved compose changes.

## Implemented Memories frontend

The `/memories` route provides a responsive shared photo-journal experience with:

- A two-column, touch-friendly gallery using lazy-loaded images, stable aspect ratios, captions, dates, and graceful non-photo placeholders
- Working All, Photos, Milestones, and Favorites filters over the current shared state
- Full-screen memory details with image, title, date, description, milestone type, creator, and favorite status
- Favorite toggling synchronized immediately with Gallery and Timeline indicators
- Reused Timeline form and accessible dialog infrastructure for adding and editing memories
- Confirmed soft deletion that immediately hides memories from Home, Timeline, and Gallery
- Recently Deleted with restore and separately confirmed permanent removal
- Empty states for the gallery, filters, Home recent memories, and Recently Deleted

### Memories limitations

- Upload progress is staged around the Supabase upload request; the standard SDK does not expose byte-level progress.
- Recently Deleted has no automatic expiry or retention window yet.
- Cross-device updates use the deployed Realtime publication.

## Implemented Home frontend

The `/` route now provides a responsive, mobile-first Home experience with:

- A time-of-day greeting, compact app identity, and neutral placeholder couple avatars
- The authenticated couple profile with real member names, relationship start date, and description
- A live relationship counter showing total calendar days, calendar-aware years/months/days, and a non-announced seconds display
- Safe handling for invalid and future start dates, with a one-second timer that is isolated to the counter and cleaned up on unmount
- Monthly and yearly anniversary countdowns that clamp dates correctly at month end, including start dates on the 29th, 30th, or 31st
- An original local collection of love notes selected deterministically by the device's local calendar date, plus a manual next-note action
- The latest three persisted memories, with navigation to the Timeline route
- Compact navigation actions for adding a memory, viewing Timeline, and writing a private letter

### Home limitations

- Daily love notes remain a generic local editorial collection because the schema has no love-note entity.
- Home reads shared database-backed providers, so Timeline and Gallery mutations appear immediately.
- The Add Memory action opens Timeline, where the existing floating action button starts the form; it does not open a global form from Home.
- The Write Letter action opens the persistent Love Letters experience.
- Cross-device synchronization uses the deployed Realtime publication.

## Implemented Timeline frontend

The `/timeline` route now provides a polished, responsive frontend prototype with:

- Chronological rendering, formatted dates, a connected vertical line, and milestone-specific Lucide icons
- Strongly typed memory and milestone models covering titles, descriptions, dates, photos, authorship, and audit timestamps
- Empty-by-default persistent memory data with no fictional production records
- Responsive memory cards and highlighted relationship/anniversary milestones
- A shared mobile form for adding and editing persistent text memories
- Delete confirmation plus an empty timeline state after all entries are removed
- Accessible modal semantics, focus trapping and restoration, Escape-key dismissal, background scroll locking, keyboard controls, and reduced-motion support

### Timeline limitations

- One media file can currently be selected per memory in the UI, although the database model supports multiple rows.
- Hosted Realtime delivery is enabled.
- Soft deletion and restoration are persistent, but automated retention cleanup is not implemented.

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
    ├── profiles/{user_id}/{media_id}.{ext}
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

Authenticated providers subscribe only after couple membership resolves. Memories, letters, dreams, dates, and couple rows use couple-scoped filters; mailbox events are filtered to the authenticated user, and profile events are filtered to the two member IDs. PostgreSQL RLS remains the authorization boundary for every event.

Event bursts are debounced into one canonical provider reload. Channels are removed on logout, couple change, and unmount. Timed-out or failed channels reconnect after a short delay, while the app displays a small non-blocking sync notice.

Migration `202611080006_realtime_publication.sql` idempotently adds the seven synchronized tables to `supabase_realtime`, enables full replica identity for reliable update/delete refreshes, and removes unnecessary anonymous execution grants from the profile path helpers. It is deployed and verified.

## Nearby and long-distance connection features

Each partner may optionally save a city, country, and IANA timezone on their own profile. Precise coordinates and live GPS are never requested or stored. The couple may optionally share one `next_time_together` date.

Home displays only configured connection details: partner cities, their current local times, the time difference, and the next-meeting countdown. Thinking of You is intentionally not chat; each event stores only its couple, sender, and timestamp, and Home shows the latest signal.

These settings live in Our Space under Distance & time. Migration `202611080007_connection_features.sql` extends the existing tables, adds the RLS-protected signal table, and publishes it to Realtime. It is deployed and verified.

## Shared application background

Our Space → Settings → Appearance → Background provides Default, Soft Pink, Cream, Lavender, Sky Blue, and Dark Romantic presets plus a custom six-digit color picker. Changes preview immediately across the application shell while cards remain primarily white. Dark custom backgrounds switch page-level text to a readable light palette; white card surfaces retain dark text. The existing dark mode is intentionally unchanged.

The preference is stored on the existing `couples` row and uses the existing member-only update policy and couple-scoped Realtime subscription. Migration `202611080008_shared_background.sql` adds only `background_preset` and `background_custom_color`, with strict preset and hex-color constraints. It passed a clean local migration replay and the 77-test pgTAP suite, and is deployed to hosted Supabase.

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

Implemented browser client configuration:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_APP_URL=
```

`VITE_SUPABASE_ANON_KEY` remains supported as a legacy fallback. Vite exposes variables prefixed with `VITE_` to the browser, so they must never contain service-role keys, secret keys, database passwords, or CLI access tokens.

`VITE_APP_URL` is optional locally and should contain the deployed HTTPS origin in production, such as `https://our-little-universe.vercel.app`. Partner invitation links use this value when present; otherwise they use the current browser origin. Links generated from `localhost` are only suitable for same-device development.

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

## Implemented database foundation (locally verified; hosted unapplied)

The repository includes versioned Supabase migrations under `supabase/migrations/`, PostgreSQL 17 local configuration in `supabase/config.toml`, and repeatable pgTAP suites under `supabase/tests/`. All four migrations are applied to hosted project `jthkuepideccbiqjqeci`; the clean local rehearsal and all 53 database assertions pass.

### Entity relationships

- `profiles` extends `auth.users` one-to-one.
- `couples` has up to two `couple_members`; a unique user constraint allows each user to belong to only one couple.
- `couple_invitations` belongs to a couple and its creating member, storing only a SHA-256 token hash.
- `memories` belongs to a couple and references same-couple creator, updater, and optional deleter memberships.
- `memory_media` belongs to a memory and stores only private Storage metadata/object paths, never binary/base64 content.
- `love_letters` references same-couple sender and recipient memberships.
- `love_letter_mailboxes` stores independent per-user favorite and deletion state for each letter.
- `dreams` and `important_dates` are shared couple records with same-couple creator/updater references.

Composite foreign keys prevent records from naming actors or resources from unrelated couples. Calendar-only values use `date`; audit and workflow timestamps use `timestamptz`.

### Membership and invitations

Direct client mutation of membership and invitation tables is denied. `create_couple`, `create_couple_invitation`, `accept_couple_invitation`, and `revoke_couple_invitation` are narrowly granted `SECURITY DEFINER` functions with an empty `search_path` and fully qualified objects.

Invitation creation returns a cryptographically random raw token once and stores only its SHA-256 hash. Acceptance:

1. Requires an authenticated caller who does not already belong to a couple.
2. Locks the invitation row and rejects invalid, consumed, revoked, or expired tokens.
3. Enforces optional recipient user/email binding.
4. Locks the couple row before checking capacity and inserting membership.
5. Marks the invitation consumed in the same transaction.

The couple-row lock serializes competing acceptances. A separate capacity trigger also locks the couple and rejects a third member as defense in depth.

### RLS strategy

RLS is enabled for every user-facing application table. Default access is denied unless an explicit authenticated policy exists. Non-recursive `is_couple_member` and `shares_couple_with` helpers avoid membership-policy recursion.

- Couple data is isolated by active membership.
- Membership and invitation creation cannot be performed through ordinary table writes.
- Memory soft-deleted rows remain accessible only to their two authorized couple members for restoration.
- Draft letters are visible/editable only to their sender.
- Sent content and participants are immutable; only the recipient can set read state.
- Shared creator/ownership/audit fields and mailbox identities are immutable.
- Actor columns use composite membership foreign keys, preventing cross-couple references.

### Letter privacy and deletion

Letter content is stored once in `love_letters`. `love_letter_mailboxes` creates a sender mailbox row immediately and a recipient row when the draft is sent. Favorite and `deleted_at` fields live on these per-user rows, so deleting a received letter does not remove it from the sender's Sent mailbox, and sender deletion does not remove the recipient copy. Production queries must join/filter the current user's mailbox row.

### Private Storage design

Migration `202611070003_private_storage.sql` creates a non-public `couple-media` bucket with a 25 MB object limit and an allowlist for JPEG, PNG, WebP, GIF, MP4, and WebM.

Object paths must follow:

```text
{couple_id}/memories/{memory_id}/{opaque_filename}
```

Storage policies parse and validate the path, require authenticated couple membership, and require the referenced memory to belong to that couple. Both partners have equal object-management rights. Private media should be displayed through authenticated downloads or short-lived signed URLs, never public URLs.

Permanent memory deletion cascades database media metadata but cannot transactionally delete Storage objects. A trusted Edge Function/job must remove objects with idempotent retries and reconciliation for partial failures.

### Applying migrations

Prerequisites are a running Docker-compatible runtime and the Supabase CLI. `psql` is optional for interactive diagnosis. Do not link this verification environment to a remote project.

After confirming the prerequisites:

```bash
docker info
supabase --version
supabase start
supabase db reset
supabase test db
```

`supabase db reset` rebuilds only the disposable local database and applies all checked-in migrations. `supabase test db` currently runs 80 core pgTAP assertions plus a four-assertion, two-session invitation concurrency suite. Migrations `202611080009_invitation_management.sql` and `202611080010_invitation_function_privileges.sql` are locally verified and deployed. For an existing environment, review the generated diff and apply through the project's controlled migration workflow.

The detailed status and security review are in `supabase/SECURITY_VERIFICATION.md`. On 2026-11-07, a clean PostgreSQL 17 reset applied all four migrations and `supabase test db` passed 49 core assertions plus four independent-session concurrency assertions. The hosted database remains unchanged.

Migration `202611070004_security_hardening.sql` additionally removes direct API mutation privileges from membership and invitation tables, revokes API execution of trigger-only functions, and prevents a draft sender from pre-populating the recipient's `read_at` state.

### Local validation status (2026-11-07)

| Check               | Result                                           |
| ------------------- | ------------------------------------------------ |
| `npm run format`    | Passed                                           |
| `npm run typecheck` | Passed                                           |
| `npm run lint`      | Passed with zero warnings                        |
| `npm run build`     | Passed with Vite 8.3.6                           |
| `supabase db reset` | Passed locally; four migrations applied in order |
| `supabase test db`  | Passed locally; 53/53 assertions                 |

Step 14 persistence and authorization validation uses the real local Supabase PostgreSQL stack. The suite covers both-partner shared CRUD, draft ownership, recipient-only read state, independent letter mailbox deletion/restoration, and cross-couple isolation. No automated browser test was run against hosted production accounts, and no fictional production records were inserted.

The local structural inventory confirmed 10 RLS-enabled tables, 60 constraints, 14 triggers, 14 public functions, 27 public policies, four Storage policies, and the private `couple-media` bucket.

### Hosted verification status (2026-11-07)

The confirmed `Our-Relationship` project contains all four migration versions and the verified application schema. Physical backups were not listed and PITR remains disabled. See `supabase/HOSTED_VERIFICATION_REPORT.md` for the complete deployment and recovery assessment.

### Rollback considerations

The migrations create enums, tables, functions, triggers, policies, and a Storage bucket. Production rollback should prefer a forward corrective migration. Dropping the schema or bucket is destructive and does not automatically recover Storage objects. Before any rollback, export required data, inventory bucket contents, disable new writes, and verify restoration procedures. Function and policy changes can usually be rolled back independently; table/enum removal requires dependency-aware reverse order.

## Local development

Prerequisites:

- A Node.js release compatible with Vite 8
- npm

Install and start the application:

```bash
git clone <repository-url>
cd Our-Relationship
npm install
```

Copy `.env.example` to the ignored `.env` file and configure the hosted project's browser-safe URL and publishable key. Never place a service-role key or database password in a `VITE_` variable. Then start Vite:

```bash
npm run dev
```

Supabase Auth, PostgreSQL product data, private Storage, Realtime, and optional connection features are connected through the browser-safe client. Couple profiles, memories, letters, dreams, dates, mailbox state, media, connection details, and Thinking of You signals are persistent. The project-local Supabase CLI and Docker are used for migration and RLS validation.

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
