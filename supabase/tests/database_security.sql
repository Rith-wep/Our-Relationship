begin;

select plan(80);

-- Synthetic identities. These UUIDs and addresses are test-only.
insert into auth.users (id, email)
values
  ('00000000-0000-4000-8000-00000000000a', 'partner-a@example.test'),
  ('00000000-0000-4000-8000-00000000000b', 'partner-b@example.test'),
  ('00000000-0000-4000-8000-00000000000c', 'unrelated-c@example.test'),
  ('00000000-0000-4000-8000-00000000000d', 'unrelated-d@example.test'),
  ('00000000-0000-4000-8000-00000000000e', 'invitee-e@example.test'),
  ('00000000-0000-4000-8000-00000000000f', 'invitee-f@example.test');

insert into public.profiles (id, display_name)
select id, 'Synthetic ' || right(id::text, 1)
from auth.users
where email like '%@example.test';

insert into public.couples (id, created_by, description)
values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000a', 'Couple one'),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-00000000000c', 'Couple two'),
  ('30000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-00000000000d', 'Invitation test');

insert into public.couple_members (couple_id, user_id)
values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000a'),
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000b'),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-00000000000c'),
  ('30000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-00000000000d');

insert into public.memories (
  id, couple_id, created_by, updated_by, title, event_date
) values
  (
    '11000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-00000000000a',
    '00000000-0000-4000-8000-00000000000a',
    'Couple one memory', current_date
  ),
  (
    '22000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-00000000000c',
    '00000000-0000-4000-8000-00000000000c',
    'Couple two memory', current_date
  );

-- Anonymous requests receive no application rows and cannot write.
set local role anon;
select is((select count(*) from public.couples), 0::bigint, 'anonymous cannot read couples');
select throws_ok(
  $$select count(*) from public.couple_members$$,
  '42501', null, 'anonymous cannot read memberships'
);
select is((select count(*) from public.memories), 0::bigint, 'anonymous cannot read memories');
select throws_ok(
  $$insert into public.profiles (id, display_name) values ('90000000-0000-4000-8000-000000000009', 'No')$$,
  '42501', null, 'anonymous cannot insert profiles'
);
reset role;

-- Partner A sees Couple 1, but not the unrelated couples.
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000a', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000a","email":"partner-a@example.test"}', true);
set local role authenticated;
select is((select count(*) from public.couples), 1::bigint, 'partner A sees only own couple');
select is((select count(*) from public.memories), 1::bigint, 'partner A sees only own memories');
select is((select count(*) from public.couple_members where couple_id = '10000000-0000-4000-8000-000000000001'), 2::bigint, 'partners can read their membership rows');
select throws_ok(
  $$insert into public.couple_members (couple_id, user_id) values ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-00000000000d')$$,
  '42501', null, 'membership cannot be forged through direct insert'
);
select throws_ok(
  $$insert into public.couple_invitations (couple_id, token_hash, created_by, expires_at) values ('10000000-0000-4000-8000-000000000001', decode('aa','hex'), '00000000-0000-4000-8000-00000000000a', now() + interval '1 day')$$,
  '42501', null, 'invitations cannot be forged through direct insert'
);
select lives_ok(
  $$update public.couples set background_preset = 'soft_pink' where id = '10000000-0000-4000-8000-000000000001'$$,
  'couple member can update the shared background'
);
select is(
  (select background_preset from public.couples where id = '10000000-0000-4000-8000-000000000001'),
  'soft_pink', 'shared background preference is stored'
);
select throws_ok(
  $$update public.couples set background_preset = 'custom', background_custom_color = null where id = '10000000-0000-4000-8000-000000000001'$$,
  '23514', null, 'custom background requires a valid color'
);
reset role;
select throws_ok(
  $$insert into public.memories (couple_id, created_by, updated_by, title, event_date) values ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-00000000000a', '00000000-0000-4000-8000-00000000000a', 'Forbidden', current_date)$$,
  '23503', null, 'cross-couple actor foreign keys are rejected'
);

-- An unrelated user cannot discover or mutate Couple 1.
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000c', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000c","email":"unrelated-c@example.test"}', true);
set local role authenticated;
select is((select count(*) from public.couples where id = '10000000-0000-4000-8000-000000000001'), 0::bigint, 'unrelated user cannot read Couple 1');
select is((select count(*) from public.memories where couple_id = '10000000-0000-4000-8000-000000000001'), 0::bigint, 'unrelated user cannot read Couple 1 memories');
select lives_ok(
  $$update public.memories set title = 'Forbidden' where id = '11000000-0000-4000-8000-000000000001'$$,
  'unrelated update is safely filtered by RLS'
);
select lives_ok(
  $$update public.couples set background_preset = 'cream' where id = '10000000-0000-4000-8000-000000000001'$$,
  'unrelated background update is safely filtered by RLS'
);
reset role;
select is((select title from public.memories where id = '11000000-0000-4000-8000-000000000001'), 'Couple one memory', 'unrelated update changes no row');
select is(
  (select background_preset from public.couples where id = '10000000-0000-4000-8000-000000000001'),
  'soft_pink', 'unrelated user cannot change the shared background'
);

-- The other partner receives and can update the same shared preference.
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000b', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000b","email":"partner-b@example.test"}', true);
set local role authenticated;
select lives_ok(
  $$update public.couples set background_preset = 'custom', background_custom_color = '#334455' where id = '10000000-0000-4000-8000-000000000001'$$,
  'second partner can update the shared background'
);
select is(
  (select background_custom_color from public.couples where id = '10000000-0000-4000-8000-000000000001'),
  '#334455', 'second partner reads the shared custom color'
);
select throws_ok(
  $$update public.couples set background_custom_color = 'not-a-color' where id = '10000000-0000-4000-8000-000000000001'$$,
  '23514', null, 'invalid custom color is rejected'
);
reset role;

-- Capacity and one-couple constraints remain enforced even for privileged writes.
select throws_ok(
  $$insert into public.couple_members (couple_id, user_id) values ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000d')$$,
  '23514', 'couple already has two members', 'third member is rejected'
);
select throws_ok(
  $$insert into public.couple_members (couple_id, user_id) values ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-00000000000a')$$,
  '23505', null, 'one-couple-per-user unique constraint is enforced'
);

-- Invitation workflows: raw token is returned once, while the table remains hidden.
create temporary table invitation_tokens (kind text primary key, invitation_id uuid, raw_token text);
grant select, insert on invitation_tokens to authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000d', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000d","email":"unrelated-d@example.test"}', true);
set local role authenticated;
insert into invitation_tokens
select 'valid', invitation_id, raw_token
from public.create_couple_invitation(
  '30000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-00000000000e',
  'invitee-e@example.test', interval '1 day'
);
select ok((select length(raw_token) = 64 from invitation_tokens where kind = 'valid'), 'invitation returns a 256-bit hex token');
select throws_ok(
  $$select count(*) from public.couple_invitations$$,
  '42501', null, 'raw invitation table is not selectable by authenticated clients'
);
reset role;

-- These rows model tokens whose raw forms are known only by this test.
insert into public.couple_invitations (
  id, couple_id, token_hash, created_by, recipient_email, created_at, expires_at, revoked_at
) values
  (
    '31000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000003',
    extensions.digest(convert_to('expired-token', 'UTF8'), 'sha256'),
    '00000000-0000-4000-8000-00000000000d', null, now() - interval '2 days', now() - interval '1 day', null
  ),
  (
    '31000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000003',
    extensions.digest(convert_to('revoked-token', 'UTF8'), 'sha256'),
    '00000000-0000-4000-8000-00000000000d', null, now(), now() + interval '1 day', now()
  ),
  (
    '31000000-0000-4000-8000-000000000003',
    '30000000-0000-4000-8000-000000000003',
    extensions.digest(convert_to('email-token', 'UTF8'), 'sha256'),
    '00000000-0000-4000-8000-00000000000d', 'invitee-e@example.test', now(), now() + interval '1 day', null
  );

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000f', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000f","email":"invitee-f@example.test"}', true);
set local role authenticated;
select throws_ok(
  format('select public.accept_couple_invitation(%L)', (select raw_token from invitation_tokens where kind = 'valid')),
  'P0001', 'invitation is bound to another user', 'recipient user binding is enforced'
);
select throws_ok(
  $$select public.accept_couple_invitation('expired-token')$$,
  'P0001', 'invitation expired', 'expired invitation is rejected'
);
select throws_ok(
  $$select public.accept_couple_invitation('revoked-token')$$,
  'P0001', 'invitation revoked', 'revoked invitation is rejected'
);
select throws_ok(
  $$select public.accept_couple_invitation('email-token')$$,
  'P0001', 'invitation is bound to another email', 'recipient email binding is enforced'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000e', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000e","email":"invitee-e@example.test"}', true);
set local role authenticated;
select lives_ok(
  format('select public.accept_couple_invitation(%L)', (select raw_token from invitation_tokens where kind = 'valid')),
  'valid bound invitation is accepted'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000f', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000f","email":"invitee-f@example.test"}', true);
set local role authenticated;
select throws_ok(
  format('select public.accept_couple_invitation(%L)', (select raw_token from invitation_tokens where kind = 'valid')),
  'P0001', 'invitation already used', 'accepted invitation cannot be reused by another user'
);
reset role;

-- Letter isolation, immutability, read state, and independent mailbox state.
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000a', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000a","email":"partner-a@example.test"}', true);
set local role authenticated;
insert into public.love_letters (
  id, couple_id, sender_id, recipient_id, title, body
) values (
  '12000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-00000000000a',
  '00000000-0000-4000-8000-00000000000b',
  'Draft', ''
);
select is((select count(*) from public.love_letters where status = 'draft'), 1::bigint, 'draft author can read draft');
select throws_ok(
  $$update public.love_letters set status = 'sent' where id = '12000000-0000-4000-8000-000000000001'$$,
  '23514', null, 'empty draft cannot be sent'
);
select throws_ok(
  $$update public.love_letters set body = 'Synthetic letter', status = 'sent', read_at = now() where id = '12000000-0000-4000-8000-000000000001'$$,
  'P0001', 'only the recipient may change read state', 'sender cannot pre-populate read state while sending'
);
update public.love_letters set body = 'Synthetic letter', status = 'sent'
where id = '12000000-0000-4000-8000-000000000001';
select is((select status::text from public.love_letters where id = '12000000-0000-4000-8000-000000000001'), 'sent', 'draft author can send non-empty letter');
update public.love_letters set title = 'Changed'
where id = '12000000-0000-4000-8000-000000000001';
select is(
  (select title from public.love_letters where id = '12000000-0000-4000-8000-000000000001'),
  'Draft', 'sender cannot edit a sent letter'
);
update public.love_letter_mailboxes set deleted_at = now()
where letter_id = '12000000-0000-4000-8000-000000000001' and user_id = auth.uid();
select ok((select deleted_at is not null from public.love_letter_mailboxes where letter_id = '12000000-0000-4000-8000-000000000001'), 'sender can soft-delete own mailbox row');
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000b', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000b","email":"partner-b@example.test"}', true);
set local role authenticated;
select is((select count(*) from public.love_letters where status = 'draft'), 0::bigint, 'recipient cannot see drafts');
select is((select count(*) from public.love_letters where status = 'sent'), 1::bigint, 'recipient can read sent letter');
select ok((select deleted_at is null from public.love_letter_mailboxes where letter_id = '12000000-0000-4000-8000-000000000001'), 'sender deletion does not delete recipient mailbox row');
update public.love_letters set read_at = now()
where id = '12000000-0000-4000-8000-000000000001';
select ok((select read_at is not null from public.love_letters where id = '12000000-0000-4000-8000-000000000001'), 'recipient can set read state');
update public.love_letter_mailboxes set deleted_at = now()
where letter_id = '12000000-0000-4000-8000-000000000001' and user_id = auth.uid();
update public.love_letter_mailboxes set deleted_at = null
where letter_id = '12000000-0000-4000-8000-000000000001' and user_id = auth.uid();
select ok((select deleted_at is null from public.love_letter_mailboxes where letter_id = '12000000-0000-4000-8000-000000000001'), 'recipient mailbox restoration works');
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000a', true);
set local role authenticated;
update public.love_letters set read_at = null
where id = '12000000-0000-4000-8000-000000000001';
select ok(
  (select read_at is not null from public.love_letters where id = '12000000-0000-4000-8000-000000000001'),
  'sender cannot change recipient read state'
);
reset role;

-- Memory soft deletion remains couple-scoped and restorable.
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000a', true);
set local role authenticated;
update public.memories
set deleted_at = now(), deleted_by = auth.uid(), updated_by = auth.uid()
where id = '11000000-0000-4000-8000-000000000001';
select is((select count(*) from public.memories where deleted_at is not null), 1::bigint, 'couple member can read soft-deleted memory');
update public.memories
set deleted_at = null, deleted_by = null, updated_by = auth.uid()
where id = '11000000-0000-4000-8000-000000000001';
select ok((select deleted_at is null from public.memories where id = '11000000-0000-4000-8000-000000000001'), 'couple member can restore memory');
reset role;

-- Storage policy checks exercise storage.objects RLS, not just the path helper.
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000a', true);
set local role authenticated;
select throws_ok(
  $$insert into storage.objects (bucket_id, name) values ('couple-media', '20000000-0000-4000-8000-000000000002/memories/22000000-0000-4000-8000-000000000002/forbidden.jpg')$$,
  '42501', null, 'cross-couple Storage path is rejected'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name) values ('couple-media', '../malformed.jpg')$$,
  '42501', null, 'malformed Storage path is rejected'
);
select lives_ok(
  $$insert into storage.objects (bucket_id, name) values ('couple-media', '10000000-0000-4000-8000-000000000001/memories/11000000-0000-4000-8000-000000000001/allowed.jpg')$$,
  'authorized member can create valid Storage metadata'
);
select is((select count(*) from storage.objects where bucket_id = 'couple-media'), 1::bigint, 'authorized member can read valid Storage object');
select lives_ok(
  $$insert into storage.objects (bucket_id, name) values ('couple-media', '10000000-0000-4000-8000-000000000001/profiles/00000000-0000-4000-8000-00000000000a/avatar.jpg')$$,
  'profile owner can create own profile object'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name) values ('couple-media', '10000000-0000-4000-8000-000000000001/profiles/00000000-0000-4000-8000-00000000000b/forbidden.jpg')$$,
  '42501', null, 'partner cannot create another member profile object'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000b', true);
set local role authenticated;
select is(
  (select count(*) from storage.objects where name like '%/profiles/00000000-0000-4000-8000-00000000000a/%'),
  1::bigint,
  'couple partner can read shared profile object'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000c', true);
set local role authenticated;
select is((select count(*) from storage.objects where bucket_id = 'couple-media'), 0::bigint, 'unrelated user cannot read Couple 1 Storage object');
select throws_ok(
  $$insert into storage.objects (bucket_id, name) values ('couple-media', '10000000-0000-4000-8000-000000000001/profiles/00000000-0000-4000-8000-00000000000c/cross-couple.jpg')$$,
  '42501', null, 'unrelated user cannot create cross-couple profile object'
);
reset role;

-- Optional connection data and lightweight Thinking of You signals.
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000a', true);
set local role authenticated;
select lives_ok(
  $$update public.profiles set city = 'Test City', country = 'Test Country', timezone = 'Asia/Kolkata' where id = auth.uid()$$,
  'member can update their own optional location and timezone'
);
select throws_ok(
  $$update public.profiles set timezone = 'Mars/Olympus' where id = auth.uid()$$,
  '22023', null, 'unsupported timezone is rejected'
);
select lives_ok(
  $$update public.couples set next_time_together = current_date + 30 where id = '10000000-0000-4000-8000-000000000001'$$,
  'couple member can set the next time together'
);
select lives_ok(
  $$insert into public.thinking_of_you (couple_id, sender_id) values ('10000000-0000-4000-8000-000000000001', auth.uid())$$,
  'couple member can send a Thinking of You signal'
);
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000c', true);
set local role authenticated;
select is(
  (select count(*) from public.thinking_of_you where couple_id = '10000000-0000-4000-8000-000000000001'),
  0::bigint,
  'unrelated member cannot read another couple Thinking of You signals'
);
select throws_ok(
  $$insert into public.thinking_of_you (couple_id, sender_id) values ('10000000-0000-4000-8000-000000000001', auth.uid())$$,
  '42501', null, 'unrelated member cannot send into another couple'
);
reset role;

-- Structural assertions complement the behavior checks above.
select ok((select not public from storage.buckets where id = 'couple-media'), 'media bucket is private');
select is((select file_size_limit from storage.buckets where id = 'couple-media'), 26214400::bigint, 'media bucket enforces 25 MiB limit');
select is((select count(*) from pg_policies where schemaname = 'public' and tablename = 'couple_invitations'), 0::bigint, 'invitation table has no client policies');
select is((select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'profile_media_%'), 4::bigint, 'four profile media policies are installed');
select ok(not has_table_privilege('authenticated', 'public.couple_members', 'INSERT'), 'authenticated role has no direct membership insert privilege');
select ok(
  (select array_to_string(proconfig, ',') in ('search_path=', 'search_path=""') from pg_proc where oid = 'public.accept_couple_invitation(text)'::regprocedure),
  'invitation acceptance has an empty search_path'
);
select is((select prosecdef from pg_proc where oid = 'public.accept_couple_invitation(text)'::regprocedure), true, 'invitation acceptance is SECURITY DEFINER');
select is(
  (
    select count(*)
    from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = any (array[
        'couples', 'profiles', 'memories', 'love_letters',
        'love_letter_mailboxes', 'dreams', 'important_dates'
      ])
  ),
  7::bigint,
  'all synchronized tables are in the realtime publication'
);
select is(
  (
    select count(*)
    from pg_catalog.pg_class
    where oid = any (array[
      'public.couples'::regclass,
      'public.profiles'::regclass,
      'public.memories'::regclass,
      'public.love_letters'::regclass,
      'public.love_letter_mailboxes'::regclass,
      'public.dreams'::regclass,
      'public.important_dates'::regclass
    ])
      and relreplident = 'f'
  ),
  7::bigint,
  'synchronized tables expose full rows for update and delete events'
);
select ok(
  not has_function_privilege('anon', 'public.valid_profile_object_path(text)', 'EXECUTE')
  and not has_function_privilege('anon', 'public.owns_profile_object_path(text)', 'EXECUTE'),
  'anonymous role cannot execute profile path helpers'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.thinking_of_you'::regclass),
  'Thinking of You table has RLS enabled'
);
select is(
  (
    select count(*)
    from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'thinking_of_you'
  ),
  1::bigint,
  'Thinking of You signals are published to Realtime'
);

-- Invitation replacement and safe status listing.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000c","email":"unrelated-c@example.test"}', true);
set local role authenticated;

insert into invitation_tokens
select 'replacement-one', invitation_id, raw_token
from public.create_couple_invitation(
  '20000000-0000-4000-8000-000000000002', null,
  'invitee-e@example.test', interval '1 day'
);
insert into invitation_tokens
select 'replacement-two', invitation_id, raw_token
from public.create_couple_invitation(
  '20000000-0000-4000-8000-000000000002', null,
  'invitee-e@example.test', interval '1 day'
);

select is(
  (select status from public.list_couple_invitations('20000000-0000-4000-8000-000000000002')
   where invitation_id = (select invitation_id from invitation_tokens where kind = 'replacement-one')),
  'revoked',
  'creating a replacement revokes the previous active invitation'
);
select is(
  (select status from public.list_couple_invitations('20000000-0000-4000-8000-000000000002')
   where invitation_id = (select invitation_id from invitation_tokens where kind = 'replacement-two')),
  'active',
  'the newest replacement invitation remains active'
);
select is(
  (select recipient_email from public.list_couple_invitations('20000000-0000-4000-8000-000000000002')
   where invitation_id = (select invitation_id from invitation_tokens where kind = 'replacement-two')),
  'invitee-e@example.test',
  'safe invitation listing returns recipient metadata'
);
select ok(
  position(
    'token' in pg_get_function_result('public.list_couple_invitations(uuid)'::regprocedure)
  ) = 0,
  'safe invitation listing exposes no token fields'
);

select throws_ok(
  $$select * from public.list_couple_invitations('10000000-0000-4000-8000-000000000001')$$,
  '42501', 'not authorized', 'unrelated users cannot list invitations'
);

select lives_ok(
  format('select public.revoke_couple_invitation(%L)', (select invitation_id from invitation_tokens where kind = 'replacement-two')),
  'a couple member can revoke the active invitation'
);

select ok(
  not has_function_privilege('anon', 'public.create_couple(date,text)', 'EXECUTE')
  and not has_function_privilege('anon', 'public.create_couple_invitation(uuid,uuid,text,interval)', 'EXECUTE')
  and not has_function_privilege('anon', 'public.accept_couple_invitation(text)', 'EXECUTE')
  and not has_function_privilege('anon', 'public.revoke_couple_invitation(uuid)', 'EXECUTE')
  and not has_function_privilege('anon', 'public.list_couple_invitations(uuid)', 'EXECUTE'),
  'anonymous role cannot execute couple or invitation workflows'
);

select * from finish();
rollback;
