begin;

-- Membership is readable through RLS but writable only through the pairing
-- workflows. Invitations are available only through the dedicated functions.
revoke all privileges on table public.couple_members from anon, authenticated;
grant select on table public.couple_members to authenticated;
revoke all privileges on table public.couple_invitations from anon, authenticated;

-- A sender must never be able to pre-populate the recipient's read state while
-- sending a draft. Subsequent read-state changes remain recipient-only.
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
      if new.read_at is not null then
        raise exception 'only the recipient may change read state';
      end if;
      if new.status = 'sent' then new.sent_at = coalesce(new.sent_at, now()); end if;
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger functions are invoked by PostgreSQL, never directly by API roles.
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.enforce_couple_capacity() from public, anon, authenticated;
revoke all on function public.guard_letter_changes() from public, anon, authenticated;
revoke all on function public.guard_couple_identity() from public, anon, authenticated;
revoke all on function public.guard_shared_audit() from public, anon, authenticated;
revoke all on function public.guard_mailbox_identity() from public, anon, authenticated;
revoke all on function public.sync_letter_mailboxes() from public, anon, authenticated;

commit;
