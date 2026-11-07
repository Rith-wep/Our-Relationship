select json_build_object(
  'database', json_build_object(
    'name', current_database(),
    'postgres_version', current_setting('server_version')
  ),
  'public_tables', coalesce((
    select json_agg(json_build_object(
      'name', c.relname,
      'rls_enabled', c.relrowsecurity,
      'force_rls', c.relforcerowsecurity,
      'estimated_rows', greatest(c.reltuples::bigint, 0)
    ) order by c.relname)
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p')
  ), '[]'::json),
  'policies', coalesce((
    select json_agg(json_build_object(
      'schema', schemaname,
      'table', tablename,
      'name', policyname,
      'permissive', permissive,
      'roles', roles,
      'command', cmd
    ) order by schemaname, tablename, policyname)
    from pg_policies
    where schemaname in ('public', 'storage')
  ), '[]'::json),
  'public_functions', coalesce((
    select json_agg(json_build_object(
      'name', p.proname,
      'arguments', pg_get_function_identity_arguments(p.oid),
      'security_definer', p.prosecdef,
      'configuration', p.proconfig
    ) order by p.proname, pg_get_function_identity_arguments(p.oid))
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  ), '[]'::json),
  'public_types', coalesce((
    select json_agg(json_build_object(
      'name', t.typname,
      'kind', t.typtype
    ) order by t.typname)
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typtype in ('e', 'd')
  ), '[]'::json),
  'storage_buckets', coalesce((
    select json_agg(json_build_object(
      'id', id,
      'name', name,
      'public', public,
      'file_size_limit', file_size_limit,
      'allowed_mime_types', allowed_mime_types
    ) order by id)
    from storage.buckets
  ), '[]'::json),
  'aggregate_counts', json_build_object(
    'auth_users', (select count(*) from auth.users),
    'storage_buckets', (select count(*) from storage.buckets),
    'storage_objects', (select count(*) from storage.objects)
  ),
  'relevant_extensions', coalesce((
    select json_agg(json_build_object(
      'name', e.extname,
      'schema', n.nspname,
      'version', e.extversion
    ) order by e.extname)
    from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
    where e.extname in ('pgcrypto', 'pg_graphql', 'pgjwt', 'uuid-ossp')
  ), '[]'::json)
) as hosted_inventory;
