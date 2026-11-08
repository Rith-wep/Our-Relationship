begin;

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

  -- A replacement link invalidates every older unused link for this couple.
  update public.couple_invitations invitation
  set revoked_at = now()
  where invitation.couple_id = target_couple
    and invitation.consumed_at is null
    and invitation.revoked_at is null
    and invitation.expires_at > now();

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

create or replace function public.list_couple_invitations(target_couple uuid)
returns table(
  invitation_id uuid,
  recipient_email text,
  expires_at timestamptz,
  created_at timestamptz,
  status text
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.is_couple_member(target_couple) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return query
  select
    invitation.id,
    invitation.recipient_email,
    invitation.expires_at,
    invitation.created_at,
    case
      when invitation.consumed_at is not null then 'accepted'
      when invitation.revoked_at is not null then 'revoked'
      when invitation.expires_at <= now() then 'expired'
      else 'active'
    end
  from public.couple_invitations invitation
  where invitation.couple_id = target_couple
  order by invitation.created_at desc;
end;
$$;

revoke all on function public.create_couple_invitation(uuid, uuid, text, interval) from public;
grant execute on function public.create_couple_invitation(uuid, uuid, text, interval) to authenticated;

revoke all on function public.list_couple_invitations(uuid) from public;
grant execute on function public.list_couple_invitations(uuid) to authenticated;

comment on function public.list_couple_invitations(uuid) is
  'Returns invitation metadata to couple members without exposing raw tokens or token hashes.';

commit;
