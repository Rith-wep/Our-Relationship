# Hosted Supabase database verification report

Date: 2026-11-07  
Project: `Our-Relationship` (`jthkuepideccbiqjqeci`)  
Environment: hosted production, `ap-northeast-2`  
Database: PostgreSQL 17.11

## Outcome

**Hosted migration and structural verification passed. Couple onboarding may proceed.**

After explicit owner approval, all four migrations were applied to project `jthkuepideccbiqjqeci`. The final preflight confirmed the linked project and exactly four pending migrations with no seeds or role files. Post-deployment inspection confirmed the expected schema and left the existing Auth user unchanged.

The PostgreSQL 17 local rehearsal passed 53/53 assertions before deployment. Hosted execution completed without SQL errors. The accepted recovery limitation remains: no physical backup is listed and PITR is disabled.

## Hosted deployment result

- Applied migrations: `202611070001` through `202611070004`.
- Application tables: 10; RLS enabled on all 10.
- Constraints: 60.
- Application triggers: 14.
- Public functions: 14, including hardened couple and invitation workflows.
- Policies: 27 public-table policies and four `storage.objects` policies.
- Storage: private `couple-media` bucket, 25 MiB limit, six allowed MIME types.
- Auth users: aggregate count remained 1 before and after migration.
- Storage objects: 0 after migration.

## Commands and access mode

The workspace was linked only after confirmation of the project reference. Hosted metadata was read using:

- `supabase migration list --remote`
- `supabase inspect db table-stats --remote`
- `supabase db push --remote --dry-run`
- `supabase db query --remote --read-only --file supabase/verification/hosted_inventory.sql`
- `supabase db advisors --remote`
- `supabase backups list --remote`

The inventory query selects schema metadata, bucket metadata, and aggregate counts only. It does not select user identities, emails, application content, or authentication secrets.

## What already exists

| Area                         | Hosted state                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Migration history            | No remote migration versions; `supabase_migrations.schema_migrations` is absent |
| `public` tables              | None                                                                            |
| `public` functions           | None                                                                            |
| `public` enum/domain types   | None                                                                            |
| `public` or Storage policies | None                                                                            |
| Storage buckets              | None                                                                            |
| Storage objects              | 0                                                                               |
| Auth users                   | 1 (aggregate count only; identity was not inspected)                            |
| Relevant extensions          | `pgcrypto` 1.3 and `uuid-ossp` 1.1 in `extensions`                              |

There are no existing application tables, functions, enums, policies, or buckets that conflict by name with the local migrations.

## What the four migrations will create or change

### Migration 001 — initial schema

- Five enum types.
- Ten application tables: profiles, couples, memberships, invitations, memories, media metadata, letters, per-user letter mailboxes, dreams, and important dates.
- UUID, check, unique, and same-couple composite foreign-key constraints.
- Indexes, audit/immutability/capacity triggers, and mailbox synchronization.

`pgcrypto` already exists in the expected `extensions` schema, so `CREATE EXTENSION IF NOT EXISTS` should be a no-op.

### Migration 002 — authorization and workflows

- Enables RLS on all ten application tables.
- Creates authenticated, couple-scoped policies and non-recursive membership helpers.
- Adds `SECURITY DEFINER` couple creation and invitation workflows with empty search paths and restricted grants.

### Migration 003 — private Storage

- Creates the private `couple-media` bucket with a 25 MiB limit and MIME allowlist.
- Adds validated couple/memory path authorization and four Storage object policies.

The migration contains an `ON CONFLICT DO UPDATE` for bucket privacy and limits. No bucket currently exists, so this will insert rather than overwrite existing bucket configuration.

### Migration 004 — security hardening

- Removes direct client mutation privileges from membership and invitation tables.
- Replaces the letter guard so a sender cannot pre-populate recipient read state.
- Revokes API execution rights on trigger-only functions.

## Destructive-operation review

The four migrations contain no `DROP`, `TRUNCATE`, remote reset, destructive table rewrite, or Auth-user deletion. They do create constraints and revoke selected API privileges as intended. Migration 003 can update an existing `couple-media` bucket, but the verified hosted project currently has no buckets.

The existing Auth user will not be deleted or altered. However, there is no automatic profile-creation trigger: after migration that user will still need to create their own RLS-protected `profiles` row during onboarding.

## Security and compatibility review

- Hosted PostgreSQL is 17.11; local `config.toml` now targets PostgreSQL 17 for parity.
- `pgcrypto` is already installed in the schema referenced by the migrations.
- The migration dry run recognized all four files in order and no additional artifacts.
- The dry run lists pending files but does not execute or fully validate their SQL.
- Database advisors reported one warning: Supabase Auth leaked-password protection is disabled.
- RLS, trigger behavior, invitation races, and Storage policies passed locally against the migrated PostgreSQL 17 stack.
- The local CLI v3 required configuration updates from `[inbucket]` to `[local_smtp]` and from `auth.email.enable_signup` to `auth.email.enabled`; these local compatibility changes were made.

## Backup and recovery assessment

The hosted backup API returned:

- physical backups: none listed;
- PITR: disabled;
- WALG: enabled;
- region: `ap-northeast-2`.

WALG being enabled is not equivalent to a verified user-restorable backup. Before remote migration, create a protected logical backup outside version control or explicitly accept the current recovery limitation. The hosted project contains one Auth user but no application schema or Storage objects.

## Local rehearsal results

- Docker Desktop engine: 29.6.1, running.
- Local PostgreSQL/Supabase image: 17.11.
- Clean database reset: passed; four migrations applied in order.
- Structural inventory: 10 RLS-enabled tables, 60 constraints, 14 triggers, 14 public functions, 27 public policies, and four Storage policies.
- `couple-media`: private, 25 MiB limit, six allowed MIME types.
- Core pgTAP suite: 49/49 passed.
- Independent two-session invitation race suite: 4/4 passed.
- Total: 53/53 passed.

The only changes required were to test expectations and the concurrency connection route. No RLS policy, grant, trigger, or migration security invariant was weakened.

## Remaining risks

1. No physical backup or PITR recovery point is currently available through the CLI.
2. The existing Auth user must complete application onboarding to create its profile and couple membership.
3. Leaked-password protection should be enabled in Supabase Auth settings before production use.
4. Product feature providers remain demo-backed and must not be mistaken for persisted shared data.

## Recommendation

The hosted schema is ready for secure couple onboarding. Continue using the RPC workflows for membership changes; never write directly to `couple_members` or expose privileged keys. Enable leaked-password protection and establish a tested recovery process before production launch.
