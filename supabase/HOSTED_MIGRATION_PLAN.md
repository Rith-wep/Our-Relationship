# Hosted Supabase migration plan

## Status

**Prepared only. No hosted project has been linked, inspected, or modified.**

Remote inspection and migration execution require explicit owner approval. Never use `supabase db reset` against a hosted project.

## Prerequisites

1. Create or select the intended hosted Supabase project.
2. Put only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the ignored local `.env` file.
3. Add local and deployed application URLs to the Supabase Auth URL allowlist, including `/reset-password` recovery redirects.
4. Authenticate the project-local CLI directly in a trusted terminal. Do not paste an access token, database password, secret key, or service-role key into chat or source files.

Example commands, to be run by the project owner:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
```

The project reference is an identifier, but access tokens and database passwords are secrets.

## Mandatory remote inspection before migration

Run these read-only or dry-run checks after linking:

```bash
npx supabase migration list --linked
npx supabase db dump --linked --schema public,auth,storage --file supabase/remote-schema-before.sql
npx supabase db push --linked --dry-run
```

Keep any dump containing user data outside version control. Before continuing:

- inventory existing `public` tables, functions, triggers, policies, and grants;
- confirm whether the four local migration versions already appear in remote migration history;
- identify name/type conflicts and any existing Auth users or Storage objects;
- verify a current platform backup or point-in-time recovery capability;
- review the dry-run output for drops, type changes, table rewrites, or policy replacement;
- validate the migrations against a disposable local or staging Supabase project first.

The checked-in migrations create enums, ten application tables, functions, triggers, RLS policies, and the private `couple-media` bucket. Migration 004 changes privileges and replaces the letter guard trigger function. They do not intentionally drop application tables, but conflicts with a pre-existing hand-created schema can still make execution unsafe.

## Approval gate

After presenting the migration history, remote inventory, backup status, and dry-run output, request explicit approval for the exact hosted project and exact command. Only then run:

```bash
npx supabase db push --linked
```

Immediately verify migration history, RLS, functions, bucket privacy, and a synthetic two-user workflow. Never expose or use a service-role key in the React application.

## Frontend/database model differences

| Frontend today                                                | Hosted database model                                      | Required provider mapping                                                    |
| ------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Partner IDs are `'partner-a'` / `'partner-b'`                 | Auth and member IDs are UUIDs                              | Replace demo identity switching with `auth.uid()` and couple membership rows |
| A letter has shared `favorite` and `deletedAt` fields         | `love_letter_mailboxes` stores those values per user       | Join the caller's mailbox row; never delete the other partner's state        |
| Memory photos are embedded `{ src, alt }` values or data URLs | `memory_media` stores metadata and a private object path   | Upload to Storage, insert metadata, and resolve authenticated/signed URLs    |
| `createdBy` and `deletedBy` are display strings               | Actor columns are member UUIDs                             | Join profiles for display names while preserving UUID audit fields           |
| Couple profile contains a two-item partner tuple              | `couples`, `couple_members`, and `profiles` are normalized | Compose the view model from the couple and its two profile rows              |
| Important dates use `date`, `type`, `recurringAnnually`       | Columns are `event_date`, `event_type`, `recurs_annually`  | Map names at the service boundary                                            |
| Dreams use `completed`                                        | Database uses `is_completed`                               | Map names at the service boundary                                            |
| Current providers initialize fictional records                | Authenticated users must load canonical database rows      | Add loading/error/empty states; never silently fall back to demos            |

Database-generated TypeScript definitions should be generated only after the hosted schema is safely applied and verified:

```bash
npx supabase gen types typescript --linked > src/lib/supabase/types.ts
```

Review generated changes before committing them. Until then, the client intentionally does not claim generated database types.
