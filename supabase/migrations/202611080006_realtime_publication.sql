begin;

revoke execute on function public.valid_profile_object_path(text) from anon;
revoke execute on function public.owns_profile_object_path(text) from anon;

alter table public.couples replica identity full;
alter table public.profiles replica identity full;
alter table public.memories replica identity full;
alter table public.love_letters replica identity full;
alter table public.love_letter_mailboxes replica identity full;
alter table public.dreams replica identity full;
alter table public.important_dates replica identity full;

do $$
declare
  relation_name text;
begin
  foreach relation_name in array array[
    'couples',
    'profiles',
    'memories',
    'love_letters',
    'love_letter_mailboxes',
    'dreams',
    'important_dates'
  ]
  loop
    if not exists (
      select 1
      from pg_catalog.pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = relation_name
    ) then
      execute format(
        'alter publication supabase_realtime add table public.%I',
        relation_name
      );
    end if;
  end loop;
end;
$$;

commit;
