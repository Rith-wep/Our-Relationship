-- This file intentionally uses committed synthetic setup so two independent
-- PostgreSQL sessions can race. It cleans up every object it creates.

create extension if not exists dblink with schema extensions;

insert into auth.users (id, email)
values
  ('00000000-0000-4000-8000-000000000010', 'race-owner@example.test'),
  ('00000000-0000-4000-8000-000000000011', 'race-one@example.test'),
  ('00000000-0000-4000-8000-000000000012', 'race-two@example.test');

insert into public.couples (id, created_by, description)
values (
  '40000000-0000-4000-8000-000000000004',
  '00000000-0000-4000-8000-000000000010',
  'Concurrency test'
);

insert into public.couple_members (couple_id, user_id)
values (
  '40000000-0000-4000-8000-000000000004',
  '00000000-0000-4000-8000-000000000010'
);

insert into public.couple_invitations (
  id, couple_id, token_hash, created_by, recipient_user_id, expires_at
) values
  (
    '41000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000004',
    extensions.digest(convert_to('race-token-one', 'UTF8'), 'sha256'),
    '00000000-0000-4000-8000-000000000010',
    '00000000-0000-4000-8000-000000000011',
    now() + interval '1 day'
  ),
  (
    '41000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000004',
    extensions.digest(convert_to('race-token-two', 'UTF8'), 'sha256'),
    '00000000-0000-4000-8000-000000000010',
    '00000000-0000-4000-8000-000000000012',
    now() + interval '1 day'
  );

create schema test_support;
revoke all on schema test_support from public;

create function test_support.try_accept(token text, caller uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform set_config('request.jwt.claim.sub', caller::text, true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', caller::text, 'email', 'race@example.test')::text,
    true
  );
  return 'accepted:' || public.accept_couple_invitation(token)::text;
exception when others then
  return 'error:' || sqlstate || ':' || sqlerrm;
end;
$$;

select extensions.dblink_connect(
  'race_one',
  'host=host.docker.internal port=54322 dbname=postgres user=postgres password=postgres'
);
select extensions.dblink_connect(
  'race_two',
  'host=host.docker.internal port=54322 dbname=postgres user=postgres password=postgres'
);

select extensions.dblink_send_query(
  'race_one',
  $$select test_support.try_accept('race-token-one', '00000000-0000-4000-8000-000000000011')$$
);
select extensions.dblink_send_query(
  'race_two',
  $$select test_support.try_accept('race-token-two', '00000000-0000-4000-8000-000000000012')$$
);

create temporary table race_results (result text);
insert into race_results
select result from extensions.dblink_get_result('race_one') as response(result text);
insert into race_results
select result from extensions.dblink_get_result('race_two') as response(result text);

select plan(4);
select is(
  (select count(*) from public.couple_members where couple_id = '40000000-0000-4000-8000-000000000004'),
  2::bigint,
  'concurrent acceptance cannot exceed two members'
);
select is(
  (select count(*) from race_results where result like 'accepted:%'),
  1::bigint,
  'exactly one concurrent acceptance succeeds'
);
select is(
  (select count(*) from race_results where result = 'error:P0001:couple already has two members'),
  1::bigint,
  'the competing acceptance fails after the capacity check'
);
select is(
  (select count(*) from public.couple_invitations where couple_id = '40000000-0000-4000-8000-000000000004' and consumed_at is not null),
  1::bigint,
  'only the successful invitation is consumed'
);
select * from finish();

select extensions.dblink_disconnect('race_one');
select extensions.dblink_disconnect('race_two');
drop schema test_support cascade;
delete from public.couples where id = '40000000-0000-4000-8000-000000000004';
delete from auth.users where id in (
  '00000000-0000-4000-8000-000000000010',
  '00000000-0000-4000-8000-000000000011',
  '00000000-0000-4000-8000-000000000012'
);
