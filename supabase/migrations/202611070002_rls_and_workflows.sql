begin;

create or replace function public.is_couple_member(target_couple uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.couple_members
    where couple_id = target_couple and user_id = auth.uid()
  );
$$;

create or replace function public.shares_couple_with(target_user uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.couple_members mine
    join public.couple_members theirs on theirs.couple_id = mine.couple_id
    where mine.user_id = auth.uid() and theirs.user_id = target_user
  );
$$;

revoke all on function public.is_couple_member(uuid) from public;
revoke all on function public.shares_couple_with(uuid) from public;
grant execute on function public.is_couple_member(uuid) to authenticated;
grant execute on function public.shares_couple_with(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.couple_invitations enable row level security;
alter table public.memories enable row level security;
alter table public.memory_media enable row level security;
alter table public.love_letters enable row level security;
alter table public.love_letter_mailboxes enable row level security;
alter table public.dreams enable row level security;
alter table public.important_dates enable row level security;

create policy profiles_select on public.profiles for select to authenticated
using (id = auth.uid() or public.shares_couple_with(id));
create policy profiles_insert_self on public.profiles for insert to authenticated
with check (id = auth.uid());
create policy profiles_update_self on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());

create policy couples_select on public.couples for select to authenticated
using (public.is_couple_member(id));
create policy couples_update on public.couples for update to authenticated
using (public.is_couple_member(id)) with check (public.is_couple_member(id));

create policy members_select on public.couple_members for select to authenticated
using (public.is_couple_member(couple_id));

-- No invitation table policies are created. Raw table access remains denied;
-- callers use the narrowly scoped SECURITY DEFINER workflows below.

create policy memories_select on public.memories for select to authenticated
using (public.is_couple_member(couple_id));
create policy memories_insert on public.memories for insert to authenticated
with check (
  public.is_couple_member(couple_id) and created_by = auth.uid() and updated_by = auth.uid()
  and deleted_at is null and deleted_by is null
);
create policy memories_update on public.memories for update to authenticated
using (public.is_couple_member(couple_id))
with check (
  public.is_couple_member(couple_id) and updated_by = auth.uid()
  and (deleted_by is null or deleted_by = auth.uid())
);
create policy memories_delete on public.memories for delete to authenticated
using (public.is_couple_member(couple_id));

create policy media_select on public.memory_media for select to authenticated
using (public.is_couple_member(couple_id));
create policy media_insert on public.memory_media for insert to authenticated
with check (public.is_couple_member(couple_id) and uploaded_by = auth.uid());
create policy media_delete on public.memory_media for delete to authenticated
using (public.is_couple_member(couple_id));

create policy letters_select on public.love_letters for select to authenticated
using (
  (status = 'draft' and sender_id = auth.uid())
  or (status = 'sent' and auth.uid() in (sender_id, recipient_id))
);
create policy letters_insert on public.love_letters for insert to authenticated
with check (
  sender_id = auth.uid() and status = 'draft' and sent_at is null and read_at is null
  and public.is_couple_member(couple_id)
);
create policy letters_update on public.love_letters for update to authenticated
using (
  (status = 'draft' and sender_id = auth.uid())
  or (status = 'sent' and recipient_id = auth.uid())
)
with check (public.is_couple_member(couple_id));
create policy letters_delete_drafts on public.love_letters for delete to authenticated
using (status = 'draft' and sender_id = auth.uid());

create policy mailbox_select on public.love_letter_mailboxes for select to authenticated
using (user_id = auth.uid());
create policy mailbox_update on public.love_letter_mailboxes for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy dreams_all_select on public.dreams for select to authenticated
using (public.is_couple_member(couple_id));
create policy dreams_insert on public.dreams for insert to authenticated
with check (public.is_couple_member(couple_id) and created_by = auth.uid() and updated_by = auth.uid());
create policy dreams_update on public.dreams for update to authenticated
using (public.is_couple_member(couple_id))
with check (public.is_couple_member(couple_id) and updated_by = auth.uid());
create policy dreams_delete on public.dreams for delete to authenticated
using (public.is_couple_member(couple_id));

create policy dates_select on public.important_dates for select to authenticated
using (public.is_couple_member(couple_id));
create policy dates_insert on public.important_dates for insert to authenticated
with check (public.is_couple_member(couple_id) and created_by = auth.uid() and updated_by = auth.uid());
create policy dates_update on public.important_dates for update to authenticated
using (public.is_couple_member(couple_id))
with check (public.is_couple_member(couple_id) and updated_by = auth.uid());
create policy dates_delete on public.important_dates for delete to authenticated
using (public.is_couple_member(couple_id));

create or replace function public.create_couple(
  relationship_date date default null,
  couple_description text default ''
) returns uuid language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); new_couple uuid;
begin
  if caller is null then raise exception 'authentication required' using errcode = '28000'; end if;
  if exists (select 1 from public.couple_members where user_id = caller) then
    raise exception 'user already belongs to a couple';
  end if;
  insert into public.couples(created_by, relationship_start_date, description)
  values (caller, relationship_date, coalesce(couple_description, '')) returning id into new_couple;
  insert into public.couple_members(couple_id, user_id) values (new_couple, caller);
  return new_couple;
end;
$$;

create or replace function public.create_couple_invitation(
  target_couple uuid,
  recipient_user uuid default null,
  recipient_email_address text default null,
  valid_for interval default interval '7 days'
) returns table(invitation_id uuid, raw_token text, expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); token text; expiry timestamptz;
begin
  if caller is null or not public.is_couple_member(target_couple) then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  perform 1 from public.couples where id = target_couple for update;
  if (select count(*) from public.couple_members where couple_id = target_couple) >= 2 then
    raise exception 'couple already has two members';
  end if;
  if valid_for <= interval '0 seconds' or valid_for > interval '30 days' then
    raise exception 'invalid invitation lifetime';
  end if;
  token := encode(extensions.gen_random_bytes(32), 'hex');
  expiry := now() + valid_for;
  insert into public.couple_invitations(
    couple_id, token_hash, created_by, recipient_user_id, recipient_email, expires_at
  ) values (
    target_couple,
    extensions.digest(convert_to(token, 'UTF8'), 'sha256'),
    caller,
    recipient_user,
    case when recipient_email_address is null then null else lower(btrim(recipient_email_address)) end,
    expiry
  ) returning id into invitation_id;
  raw_token := token; expires_at := expiry; return next;
end;
$$;

create or replace function public.accept_couple_invitation(raw_token text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); invite public.couple_invitations%rowtype; jwt_email text;
begin
  if caller is null then raise exception 'authentication required' using errcode = '28000'; end if;
  if exists (select 1 from public.couple_members where user_id = caller) then
    raise exception 'user already belongs to a couple';
  end if;
  select * into invite from public.couple_invitations
  where token_hash = extensions.digest(convert_to(raw_token, 'UTF8'), 'sha256') for update;
  if not found then raise exception 'invalid invitation'; end if;
  if invite.consumed_at is not null then raise exception 'invitation already used'; end if;
  if invite.revoked_at is not null then raise exception 'invitation revoked'; end if;
  if invite.expires_at <= now() then raise exception 'invitation expired'; end if;
  if invite.recipient_user_id is not null and invite.recipient_user_id <> caller then
    raise exception 'invitation is bound to another user';
  end if;
  jwt_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if invite.recipient_email is not null and invite.recipient_email <> jwt_email then
    raise exception 'invitation is bound to another email';
  end if;
  perform 1 from public.couples where id = invite.couple_id for update;
  if (select count(*) from public.couple_members where couple_id = invite.couple_id) >= 2 then
    raise exception 'couple already has two members';
  end if;
  insert into public.couple_members(couple_id, user_id) values (invite.couple_id, caller);
  update public.couple_invitations set consumed_at = now(), consumed_by = caller where id = invite.id;
  return invite.couple_id;
end;
$$;

create or replace function public.revoke_couple_invitation(invitation uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); target_couple uuid;
begin
  select couple_id into target_couple from public.couple_invitations
  where id = invitation and consumed_at is null for update;
  if target_couple is null or not public.is_couple_member(target_couple) then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  update public.couple_invitations set revoked_at = now() where id = invitation;
end;
$$;

revoke all on function public.create_couple(date, text) from public;
revoke all on function public.create_couple_invitation(uuid, uuid, text, interval) from public;
revoke all on function public.accept_couple_invitation(text) from public;
revoke all on function public.revoke_couple_invitation(uuid) from public;
grant execute on function public.create_couple(date, text) to authenticated;
grant execute on function public.create_couple_invitation(uuid, uuid, text, interval) to authenticated;
grant execute on function public.accept_couple_invitation(text) to authenticated;
grant execute on function public.revoke_couple_invitation(uuid) to authenticated;

commit;
