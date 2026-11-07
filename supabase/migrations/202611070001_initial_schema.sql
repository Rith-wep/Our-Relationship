begin;

create extension if not exists pgcrypto with schema extensions;

create type public.milestone_type as enum (
  'first_meeting', 'first_conversation', 'first_date',
  'relationship_started', 'anniversary', 'special_memory', 'custom_event'
);
create type public.media_type as enum ('image', 'video');
create type public.letter_status as enum ('draft', 'sent');
create type public.dream_category as enum ('travel', 'experiences', 'food', 'personal_goals', 'other');
create type public.important_date_type as enum (
  'first_meeting', 'first_date', 'relationship_anniversary', 'birthday', 'custom'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.couples (
  id uuid primary key default extensions.gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete restrict,
  relationship_start_date date,
  description text not null default '' check (char_length(description) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id),
  unique (user_id)
);

create table public.couple_invitations (
  id uuid primary key default extensions.gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  token_hash bytea not null unique,
  created_by uuid not null,
  recipient_user_id uuid references auth.users(id) on delete cascade,
  recipient_email text,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  consumed_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint invitation_creator_member
    foreign key (couple_id, created_by)
    references public.couple_members(couple_id, user_id) on delete cascade,
  check (expires_at > created_at),
  check (recipient_email is null or recipient_email = lower(btrim(recipient_email))),
  check (not (consumed_at is not null and revoked_at is not null))
);

create table public.memories (
  id uuid primary key default extensions.gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  created_by uuid not null,
  updated_by uuid not null,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 5000),
  event_date date not null,
  milestone_type public.milestone_type not null default 'special_memory',
  is_favorite boolean not null default false,
  deleted_at timestamptz,
  deleted_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (couple_id, id),
  foreign key (couple_id, created_by) references public.couple_members(couple_id, user_id) on delete restrict,
  foreign key (couple_id, updated_by) references public.couple_members(couple_id, user_id) on delete restrict,
  foreign key (couple_id, deleted_by) references public.couple_members(couple_id, user_id) on delete restrict,
  check ((deleted_at is null) = (deleted_by is null))
);

create table public.memory_media (
  id uuid primary key default extensions.gen_random_uuid(),
  couple_id uuid not null,
  memory_id uuid not null,
  object_path text not null unique check (object_path !~ '(^|/)\.\.(/|$)'),
  media_type public.media_type not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm')),
  file_size_bytes bigint not null check (file_size_bytes > 0 and file_size_bytes <= 26214400),
  uploaded_by uuid not null,
  created_at timestamptz not null default now(),
  foreign key (couple_id, memory_id) references public.memories(couple_id, id) on delete cascade,
  foreign key (couple_id, uploaded_by) references public.couple_members(couple_id, user_id) on delete restrict
);

create table public.love_letters (
  id uuid primary key default extensions.gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  sender_id uuid not null,
  recipient_id uuid not null,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  body text not null default '' check (char_length(body) <= 20000),
  status public.letter_status not null default 'draft',
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (couple_id, id),
  foreign key (couple_id, sender_id) references public.couple_members(couple_id, user_id) on delete restrict,
  foreign key (couple_id, recipient_id) references public.couple_members(couple_id, user_id) on delete restrict,
  check (sender_id <> recipient_id),
  check ((status = 'draft' and sent_at is null and read_at is null) or
         (status = 'sent' and sent_at is not null)),
  check (read_at is null or (sent_at is not null and read_at >= sent_at)),
  check (status = 'draft' or (char_length(btrim(body)) > 0))
);

create table public.love_letter_mailboxes (
  couple_id uuid not null,
  letter_id uuid not null,
  user_id uuid not null,
  is_favorite boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (letter_id, user_id),
  foreign key (couple_id, letter_id) references public.love_letters(couple_id, id) on delete cascade,
  foreign key (couple_id, user_id) references public.couple_members(couple_id, user_id) on delete cascade
);

create table public.dreams (
  id uuid primary key default extensions.gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 160),
  description text not null default '' check (char_length(description) <= 3000),
  category public.dream_category not null default 'other',
  target_date date,
  is_completed boolean not null default false,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (couple_id, created_by) references public.couple_members(couple_id, user_id) on delete restrict,
  foreign key (couple_id, updated_by) references public.couple_members(couple_id, user_id) on delete restrict
);

create table public.important_dates (
  id uuid primary key default extensions.gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 160),
  event_type public.important_date_type not null default 'custom',
  event_date date not null,
  recurs_annually boolean not null default false,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (couple_id, created_by) references public.couple_members(couple_id, user_id) on delete restrict,
  foreign key (couple_id, updated_by) references public.couple_members(couple_id, user_id) on delete restrict
);

create index couple_members_couple_idx on public.couple_members(couple_id);
create index invitations_active_idx on public.couple_invitations(couple_id, expires_at)
  where consumed_at is null and revoked_at is null;
create index memories_couple_date_idx on public.memories(couple_id, event_date desc)
  where deleted_at is null;
create index memories_deleted_idx on public.memories(couple_id, deleted_at)
  where deleted_at is not null;
create index memory_media_memory_idx on public.memory_media(memory_id);
create index letters_sender_idx on public.love_letters(couple_id, sender_id, sent_at desc);
create index letters_recipient_idx on public.love_letters(couple_id, recipient_id, sent_at desc);
create index letter_mailbox_user_idx on public.love_letter_mailboxes(user_id, deleted_at, updated_at desc);
create index dreams_couple_idx on public.dreams(couple_id, is_completed, updated_at desc);
create index important_dates_couple_idx on public.important_dates(couple_id, event_date);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace function public.enforce_couple_capacity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare member_count integer;
begin
  perform 1 from public.couples where id = new.couple_id for update;
  if not found then raise exception 'couple not found'; end if;
  select count(*) into member_count from public.couple_members
    where couple_id = new.couple_id
      and (tg_op = 'INSERT' or user_id <> old.user_id);
  if member_count >= 2 then raise exception 'couple already has two members' using errcode = '23514'; end if;
  return new;
end;
$$;

create trigger couple_capacity_before_write before insert or update on public.couple_members
for each row execute function public.enforce_couple_capacity();

create or replace function public.guard_letter_changes()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if old.status = 'sent' then
      if new.title <> old.title or new.body <> old.body or new.sender_id <> old.sender_id
         or new.recipient_id <> old.recipient_id or new.couple_id <> old.couple_id
         or new.status <> old.status or new.sent_at <> old.sent_at then
        raise exception 'sent letters are immutable';
      end if;
      if new.read_at is distinct from old.read_at and auth.uid() <> old.recipient_id then
        raise exception 'only the recipient may change read state';
      end if;
    else
      if auth.uid() <> old.sender_id then raise exception 'only the draft author may edit'; end if;
      if new.sender_id <> old.sender_id or new.recipient_id <> old.recipient_id or new.couple_id <> old.couple_id then
        raise exception 'letter ownership is immutable';
      end if;
      if new.status = 'sent' then new.sent_at = coalesce(new.sent_at, now()); end if;
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.guard_couple_identity()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.id <> old.id or new.created_by <> old.created_by or new.created_at <> old.created_at then
    raise exception 'couple identity and creator are immutable';
  end if;
  return new;
end;
$$;

create or replace function public.guard_shared_audit()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.id <> old.id or new.couple_id <> old.couple_id
     or new.created_by <> old.created_by or new.created_at <> old.created_at then
    raise exception 'record ownership and creation metadata are immutable';
  end if;
  return new;
end;
$$;

create or replace function public.guard_mailbox_identity()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.couple_id <> old.couple_id or new.letter_id <> old.letter_id
     or new.user_id <> old.user_id or new.created_at <> old.created_at then
    raise exception 'mailbox identity is immutable';
  end if;
  return new;
end;
$$;

create or replace function public.sync_letter_mailboxes()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.love_letter_mailboxes(couple_id, letter_id, user_id)
  values (new.couple_id, new.id, new.sender_id) on conflict do nothing;
  if new.status = 'sent' then
    insert into public.love_letter_mailboxes(couple_id, letter_id, user_id)
    values (new.couple_id, new.id, new.recipient_id) on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger letters_guard before update on public.love_letters
for each row execute function public.guard_letter_changes();
create trigger letters_mailboxes after insert or update of status on public.love_letters
for each row execute function public.sync_letter_mailboxes();

create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger couples_identity before update on public.couples for each row execute function public.guard_couple_identity();
create trigger couples_updated before update on public.couples for each row execute function public.set_updated_at();
create trigger memories_identity before update on public.memories for each row execute function public.guard_shared_audit();
create trigger memories_updated before update on public.memories for each row execute function public.set_updated_at();
create trigger dreams_identity before update on public.dreams for each row execute function public.guard_shared_audit();
create trigger dreams_updated before update on public.dreams for each row execute function public.set_updated_at();
create trigger dates_identity before update on public.important_dates for each row execute function public.guard_shared_audit();
create trigger dates_updated before update on public.important_dates for each row execute function public.set_updated_at();
create trigger mailbox_identity before update on public.love_letter_mailboxes for each row execute function public.guard_mailbox_identity();
create trigger mailbox_updated before update on public.love_letter_mailboxes for each row execute function public.set_updated_at();

revoke all on function public.enforce_couple_capacity() from public;
revoke all on function public.sync_letter_mailboxes() from public;

commit;
