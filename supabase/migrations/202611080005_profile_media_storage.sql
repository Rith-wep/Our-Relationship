begin;

alter table public.profiles
  add column avatar_mime_type text,
  add column avatar_size_bytes bigint,
  add constraint profiles_avatar_metadata_consistent check (
    (
      avatar_path is null
      and avatar_mime_type is null
      and avatar_size_bytes is null
    )
    or (
      avatar_path is not null
      and avatar_mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
      and avatar_size_bytes > 0
      and avatar_size_bytes <= 8388608
    )
  );

create or replace function public.valid_profile_object_path(object_name text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare parts text[]; path_couple uuid; path_user uuid;
begin
  parts := storage.foldername(object_name);
  if array_length(parts, 1) <> 3 or parts[2] <> 'profiles' then return false; end if;
  begin
    path_couple := parts[1]::uuid;
    path_user := parts[3]::uuid;
  exception when invalid_text_representation then
    return false;
  end;
  return public.is_couple_member(path_couple)
    and exists (
      select 1 from public.couple_members
      where couple_id = path_couple and user_id = path_user
    );
end;
$$;

create or replace function public.owns_profile_object_path(object_name text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare parts text[]; path_user uuid;
begin
  parts := storage.foldername(object_name);
  if not public.valid_profile_object_path(object_name) then return false; end if;
  begin
    path_user := parts[3]::uuid;
  exception when invalid_text_representation then
    return false;
  end;
  return path_user = auth.uid();
end;
$$;

revoke all on function public.valid_profile_object_path(text) from public;
revoke all on function public.owns_profile_object_path(text) from public;
grant execute on function public.valid_profile_object_path(text) to authenticated;
grant execute on function public.owns_profile_object_path(text) to authenticated;

create policy profile_media_select on storage.objects for select to authenticated
using (
  bucket_id = 'couple-media'
  and public.valid_profile_object_path(name)
);

create policy profile_media_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'couple-media'
  and public.owns_profile_object_path(name)
);

create policy profile_media_update on storage.objects for update to authenticated
using (
  bucket_id = 'couple-media'
  and public.owns_profile_object_path(name)
)
with check (
  bucket_id = 'couple-media'
  and public.owns_profile_object_path(name)
);

create policy profile_media_delete on storage.objects for delete to authenticated
using (
  bucket_id = 'couple-media'
  and public.owns_profile_object_path(name)
);

commit;
