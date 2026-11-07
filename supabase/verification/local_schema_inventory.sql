select json_build_object(
  'migrations', (
    select json_agg(version order by version)
    from supabase_migrations.schema_migrations
  ),
  'tables', (
    select json_agg(c.relname order by c.relname)
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
  ),
  'tables_without_rls', coalesce((
    select json_agg(c.relname order by c.relname)
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
  ), '[]'::json),
  'constraints', (
    select count(*)
    from pg_constraint con
    join pg_namespace n on n.oid = con.connamespace
    where n.nspname = 'public'
  ),
  'triggers', (
    select json_agg(t.tgname order by t.tgname)
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and not t.tgisinternal
  ),
  'functions', (
    select json_agg(p.proname order by p.proname)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  ),
  'public_policies', (
    select count(*) from pg_policies where schemaname = 'public'
  ),
  'storage_policies', (
    select count(*) from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname like 'couple_media_%'
  ),
  'media_bucket', (
    select json_build_object(
      'id', id,
      'public', public,
      'file_size_limit', file_size_limit,
      'allowed_mime_types', allowed_mime_types
    )
    from storage.buckets where id = 'couple-media'
  )
) as local_schema_inventory;
