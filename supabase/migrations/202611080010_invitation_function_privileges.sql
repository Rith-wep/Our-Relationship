begin;

-- Supabase grants API roles execute on newly created functions by default.
-- Invitation workflows authenticate internally, but anonymous callers should
-- not have execute privileges at all.
revoke execute on function public.create_couple(date, text) from anon;
revoke execute on function public.create_couple_invitation(uuid, uuid, text, interval) from anon;
revoke execute on function public.accept_couple_invitation(text) from anon;
revoke execute on function public.revoke_couple_invitation(uuid) from anon;
revoke execute on function public.list_couple_invitations(uuid) from anon;

commit;
