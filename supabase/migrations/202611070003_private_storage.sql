begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'couple-media',
  'couple-media',
  false,
  26214400,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.valid_memory_object_path(object_name text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare parts text[]; path_couple uuid; path_memory uuid;
begin
  parts := storage.foldername(object_name);
  if array_length(parts, 1) <> 3 or parts[2] <> 'memories' then return false; end if;
  begin
    path_couple := parts[1]::uuid;
    path_memory := parts[3]::uuid;
  exception when invalid_text_representation then
    return false;
  end;
  return public.is_couple_member(path_couple)
    and exists (
      select 1 from public.memories
      where couple_id = path_couple and id = path_memory
    );
end;
$$;

revoke all on function public.valid_memory_object_path(text) from public;
grant execute on function public.valid_memory_object_path(text) to authenticated;

create policy couple_media_select on storage.objects for select to authenticated
using (
  bucket_id = 'couple-media'
  and public.valid_memory_object_path(name)
);

create policy couple_media_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'couple-media'
  and public.valid_memory_object_path(name)
);

create policy couple_media_update on storage.objects for update to authenticated
using (
  bucket_id = 'couple-media'
  and public.valid_memory_object_path(name)
)
with check (
  bucket_id = 'couple-media'
  and public.valid_memory_object_path(name)
);

create policy couple_media_delete on storage.objects for delete to authenticated
using (
  bucket_id = 'couple-media'
  and public.valid_memory_object_path(name)
);

commit;
