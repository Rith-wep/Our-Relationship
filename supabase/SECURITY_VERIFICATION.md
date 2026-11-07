# Database security verification

## Current verification status

**Passed locally on PostgreSQL 17 — 69/69 assertions successful.**

On 2026-11-08, a clean Docker-backed `supabase db reset` applied migrations `202611070001` through `202611080007` in order. `supabase test db` passed both test files: 65 core security assertions and four independent-session concurrency assertions.

Hosted project `jthkuepideccbiqjqeci` has migrations 001–007 applied. Read-only post-deployment inspection confirmed the expected schema, RLS, Storage policies, replica identity, and Realtime publication membership.

## Verified environment

| Prerequisite             | Executed status                       |
| ------------------------ | ------------------------------------- |
| Node.js                  | `v25.7.0`                             |
| npm                      | `11.10.1`                             |
| Docker client and engine | Docker Desktop `29.6.1`, running      |
| Supabase CLI             | Project-local dependency, operational |
| Local PostgreSQL         | Supabase PostgreSQL `17.11`           |

Docker access required execution outside the restricted sandbox. No hosted database reset or migration command was run.

## Reproducible commands

From the repository root:

```bash
docker info
npx supabase start
npx supabase db reset
npx supabase test db
```

`supabase db reset` is destructive only to the disposable local database. Never use a reset command against the hosted project.

Executed test result:

```text
database_security.sql .............. ok
database_security_concurrency.sql .. ok
Files=2, Tests=69
All tests successful.
Result: PASS
```

## Structural verification

The read-only local inventory confirmed:

- all four migration versions recorded;
- 10 application tables, all with RLS enabled;
- 60 constraints;
- 14 application triggers;
- 14 public functions;
- 27 public-table policies and four `storage.objects` policies;
- a private `couple-media` bucket with a 25 MiB limit and JPEG, PNG, WebP, GIF, MP4, and WebM allowlists.

## Automated test coverage

The 65-test core suite verifies:

- anonymous denial and authenticated couple isolation;
- direct membership and invitation mutation denial;
- one-couple-per-user and maximum-two-member constraints;
- valid, expired, revoked, reused, user-bound, and email-bound invitations;
- one-time raw invitation token handling;
- draft privacy, non-empty sending, sent-content immutability, and recipient-only read state;
- independent mailbox deletion and restoration;
- cross-couple foreign-key denial and memory soft-delete restoration;
- malformed/cross-couple Storage denial and authorized Storage access;
- profile-object owner writes, partner reads, and unrelated-user denial;
- Realtime publication membership, full replica identity, and anonymous helper denial;
- optional location ownership, timezone validation, shared next-meeting updates, and Thinking of You isolation;
- private bucket configuration, direct role privileges, `SECURITY DEFINER`, and empty `search_path` settings.

The four-test concurrency suite opens two independent PostgreSQL sessions and confirms exactly one invitation can claim the final couple slot, the other receives the capacity error, only two members exist, and only the successful invitation is consumed.

## Issues corrected during execution

The migrations themselves applied without changes. Three test-harness corrections were required:

1. Reads denied by revoked table privileges now expect SQLSTATE `42501` instead of an empty RLS result.
2. Unauthorized updates filtered to zero rows by RLS now assert that protected data remains unchanged instead of expecting an exception.
3. `dblink` concurrency sessions use the Docker host mapping so PostgreSQL password authentication is actually exercised.

No RLS policy, grant, trigger, migration, or security invariant was weakened.

## Security review notes

- Every API-facing application table has RLS enabled. The invitation table has no client policy.
- Membership helpers are non-recursive `SECURITY DEFINER` functions with empty `search_path` values and fully qualified relations.
- Pairing workflows and the capacity trigger lock the couple row, preventing concurrent third-member insertion.
- Direct mutation privileges are removed from membership and invitation tables.
- Raw invitation tokens are generated from 32 random bytes, returned once, and stored only as SHA-256 hashes.
- Composite foreign keys bind actors and referenced resources to the same couple.
- Storage authorization validates `{couple_id}/memories/{memory_id}/{filename}` against authenticated membership and memory ownership. The locally verified fifth migration adds `{couple_id}/profiles/{user_id}/{filename}` with owner-only writes and couple-member reads.
- `service_role`, database owners, and other `BYPASSRLS` roles intentionally bypass RLS and must never be exposed to browser code.

## Remaining limitations

- Hosted migrations 001–007 are applied and structurally verified.
- Supabase default grants expose broader table privileges on `thinking_of_you` than required; RLS still denies update/delete because no policies permit them. A future approved hardening migration should revoke those unused privileges explicitly.
- Actual Storage HTTP upload/download behavior, signed URL expiry, and denial of public URLs still require integration tests.
- Binary Storage cleanup after permanent memory deletion requires the planned trusted cleanup workflow.
- Auth rate limits, retention, account deletion, backup restoration, and incident response remain operational work.
- The hosted project lists no physical backup and has PITR disabled.
- Supabase Auth leaked-password protection is currently disabled and should be enabled before production use.

The local pass demonstrates migration compatibility and tested authorization behavior. Post-deployment schema verification confirmed profile location fields, next-meeting data, Thinking of You RLS, all eight Realtime publication members, full replica identity, profile media controls, and existing application-table RLS. Hosted behavioral security tests were not run against production users; the 69-test suite remains a local result.
