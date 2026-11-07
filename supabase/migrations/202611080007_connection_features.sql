begin;

alter table public.profiles
  add column city text,
  add column country text,
  add column timezone text,
  add constraint profiles_city_length check (
    city is null or char_length(btrim(city)) between 1 and 100
  ),
  add constraint profiles_country_length check (
    country is null or char_length(btrim(country)) between 1 and 100
  ),
  add constraint profiles_timezone_length check (
    timezone is null or char_length(btrim(timezone)) between 1 and 100
  );

alter table public.couples
  add column next_time_together date;

create or replace function public.validate_profile_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.timezone is not null and not exists (
    select 1
    from pg_catalog.pg_timezone_names
    where name = new.timezone
  ) then
    raise exception 'Unsupported timezone' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger profiles_validate_timezone
before insert or update of timezone on public.profiles
for each row execute function public.validate_profile_timezone();

create table public.thinking_of_you (
  id uuid primary key default extensions.gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  sender_id uuid not null,
  created_at timestamptz not null default now(),
  foreign key (couple_id, sender_id)
    references public.couple_members(couple_id, user_id) on delete cascade
);

create index thinking_of_you_couple_created_idx
on public.thinking_of_you(couple_id, created_at desc);

alter table public.thinking_of_you enable row level security;

create policy thinking_of_you_select
on public.thinking_of_you for select to authenticated
using (public.is_couple_member(couple_id));

create policy thinking_of_you_insert
on public.thinking_of_you for insert to authenticated
with check (
  public.is_couple_member(couple_id)
  and sender_id = auth.uid()
);

revoke all on table public.thinking_of_you from anon;
grant select, insert on table public.thinking_of_you to authenticated;

alter table public.thinking_of_you replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'thinking_of_you'
  ) then
    alter publication supabase_realtime add table public.thinking_of_you;
  end if;
end;
$$;

commit;
