begin;

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

create table if not exists public.copenhagen_shared_snapshots (
  id uuid primary key default extensions.gen_random_uuid(),
  trip_id uuid not null,
  created_at timestamptz not null default clock_timestamp(),
  created_by uuid not null,
  reason text not null default 'auto',
  label text,
  state_hash text not null,
  entry_count integer not null,
  entries jsonb not null,
  constraint copenhagen_shared_snapshots_reason
    check (reason in ('auto', 'manual', 'initial', 'pre_restore')),
  constraint copenhagen_shared_snapshots_label_length
    check (label is null or char_length(label) between 1 and 160),
  constraint copenhagen_shared_snapshots_hash_format
    check (state_hash ~ '^[0-9a-f]{64}$'),
  constraint copenhagen_shared_snapshots_entries_array
    check (jsonb_typeof(entries) = 'array'),
  constraint copenhagen_shared_snapshots_entry_count
    check (
      entry_count between 0 and 2500
      and entry_count = jsonb_array_length(entries)
    )
);

comment on table public.copenhagen_shared_snapshots is
  'Dix derniers états complets du voyage. La position GPS et les filtres locaux ne sont jamais inclus.';

create index if not exists copenhagen_shared_snapshots_trip_created_idx
  on public.copenhagen_shared_snapshots (trip_id, created_at desc, id desc);

alter table public.copenhagen_shared_snapshots enable row level security;

revoke all on table public.copenhagen_shared_snapshots from public;
revoke all on table public.copenhagen_shared_snapshots from anon;
revoke all on table public.copenhagen_shared_snapshots from authenticated;
grant select, insert on table public.copenhagen_shared_snapshots to anon;

drop policy if exists "copenhagen_snapshots_select" on public.copenhagen_shared_snapshots;
drop policy if exists "copenhagen_snapshots_insert" on public.copenhagen_shared_snapshots;

create policy "copenhagen_snapshots_select"
on public.copenhagen_shared_snapshots
for select
to anon
using (trip_id = 'e110549f-c366-4116-ba14-aedbfbb1946c'::uuid);

create policy "copenhagen_snapshots_insert"
on public.copenhagen_shared_snapshots
for insert
to anon
with check (trip_id = 'e110549f-c366-4116-ba14-aedbfbb1946c'::uuid);

create table if not exists private.copenhagen_admin_secrets (
  trip_id uuid primary key,
  code_hash text not null,
  failed_attempts smallint not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default clock_timestamp(),
  constraint copenhagen_admin_failed_attempts
    check (failed_attempts between 0 and 4)
);

comment on table private.copenhagen_admin_secrets is
  'Empreinte du code de restauration et verrou anti-tentatives. Aucun code en clair.';

alter table private.copenhagen_admin_secrets enable row level security;
revoke all on table private.copenhagen_admin_secrets from public;
revoke all on table private.copenhagen_admin_secrets from anon;
revoke all on table private.copenhagen_admin_secrets from authenticated;

create or replace function private.copenhagen_prune_snapshots()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.copenhagen_shared_snapshots snapshot
  where snapshot.trip_id = new.trip_id
    and snapshot.id not in (
      select kept.id
      from public.copenhagen_shared_snapshots kept
      where kept.trip_id = new.trip_id
      order by kept.created_at desc, kept.id desc
      limit 10
    );
  return null;
end;
$$;

revoke all on function private.copenhagen_prune_snapshots() from public;
revoke all on function private.copenhagen_prune_snapshots() from anon;
revoke all on function private.copenhagen_prune_snapshots() from authenticated;

drop trigger if exists copenhagen_prune_snapshots_trigger
  on public.copenhagen_shared_snapshots;

create trigger copenhagen_prune_snapshots_trigger
after insert on public.copenhagen_shared_snapshots
for each row execute function private.copenhagen_prune_snapshots();

create or replace function private.copenhagen_authorize_restore(
  p_trip_id uuid,
  p_admin_code text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  secret_row private.copenhagen_admin_secrets%rowtype;
  now_at timestamptz := clock_timestamp();
  next_attempts integer;
  code_is_valid boolean := false;
begin
  select *
  into secret_row
  from private.copenhagen_admin_secrets
  where trip_id = p_trip_id
  for update;

  if not found then
    return 'unavailable';
  end if;

  if secret_row.locked_until is not null and secret_row.locked_until > now_at then
    return 'locked';
  end if;

  if p_admin_code is not null and char_length(p_admin_code) between 8 and 128 then
    code_is_valid := extensions.crypt(p_admin_code, secret_row.code_hash) = secret_row.code_hash;
  end if;

  if code_is_valid then
    update private.copenhagen_admin_secrets
    set failed_attempts = 0,
        locked_until = null,
        updated_at = now_at
    where trip_id = p_trip_id;
    return 'ok';
  end if;

  next_attempts := secret_row.failed_attempts + 1;
  if next_attempts >= 5 then
    update private.copenhagen_admin_secrets
    set failed_attempts = 0,
        locked_until = now_at + interval '10 minutes',
        updated_at = now_at
    where trip_id = p_trip_id;
    return 'locked';
  end if;

  update private.copenhagen_admin_secrets
  set failed_attempts = next_attempts,
      locked_until = null,
      updated_at = now_at
  where trip_id = p_trip_id;
  return 'invalid';
end;
$$;

revoke all on function private.copenhagen_authorize_restore(uuid, text) from public;
revoke all on function private.copenhagen_authorize_restore(uuid, text) from anon;
revoke all on function private.copenhagen_authorize_restore(uuid, text) from authenticated;
grant usage on schema private to anon;
grant execute on function private.copenhagen_authorize_restore(uuid, text) to anon;

create or replace function public.copenhagen_create_snapshot(
  p_trip_id uuid,
  p_device_id uuid,
  p_reason text default 'auto',
  p_label text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  snapshot_entries jsonb;
  snapshot_hash text;
  snapshot_count integer;
  latest_snapshot public.copenhagen_shared_snapshots%rowtype;
  inserted_id uuid;
  normalized_reason text := coalesce(p_reason, 'auto');
  normalized_label text := nullif(btrim(coalesce(p_label, '')), '');
begin
  if p_trip_id <> 'e110549f-c366-4116-ba14-aedbfbb1946c'::uuid
     or p_device_id is null
     or normalized_reason not in ('auto', 'manual', 'initial')
     or (normalized_label is not null and char_length(normalized_label) > 160) then
    return jsonb_build_object('ok', false, 'error', 'invalid_request');
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_trip_id::text, 310)
  );

  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'path', shared.path,
          'value', shared.value,
          'is_deleted', shared.is_deleted
        )
        order by shared.path
      ),
      '[]'::jsonb
    ),
    count(*)::integer
  into snapshot_entries, snapshot_count
  from public.copenhagen_shared_state shared
  where shared.trip_id = p_trip_id;

  snapshot_hash := encode(
    extensions.digest(snapshot_entries::text, 'sha256'),
    'hex'
  );

  select *
  into latest_snapshot
  from public.copenhagen_shared_snapshots
  where trip_id = p_trip_id
  order by created_at desc, id desc
  limit 1;

  if found and latest_snapshot.state_hash = snapshot_hash then
    return jsonb_build_object(
      'ok', true,
      'created', false,
      'snapshot_id', latest_snapshot.id,
      'created_at', latest_snapshot.created_at,
      'state_hash', latest_snapshot.state_hash,
      'entry_count', latest_snapshot.entry_count
    );
  end if;

  if normalized_reason = 'auto'
     and latest_snapshot.id is not null
     and latest_snapshot.created_at > clock_timestamp() - interval '15 seconds' then
    return jsonb_build_object(
      'ok', true,
      'created', false,
      'throttled', true,
      'snapshot_id', latest_snapshot.id,
      'created_at', latest_snapshot.created_at,
      'state_hash', latest_snapshot.state_hash,
      'entry_count', latest_snapshot.entry_count
    );
  end if;

  insert into public.copenhagen_shared_snapshots (
    trip_id,
    created_by,
    reason,
    label,
    state_hash,
    entry_count,
    entries
  ) values (
    p_trip_id,
    p_device_id,
    normalized_reason,
    normalized_label,
    snapshot_hash,
    snapshot_count,
    snapshot_entries
  )
  returning id into inserted_id;

  return jsonb_build_object(
    'ok', true,
    'created', true,
    'snapshot_id', inserted_id,
    'created_at', clock_timestamp(),
    'state_hash', snapshot_hash,
    'entry_count', snapshot_count
  );
end;
$$;

revoke all on function public.copenhagen_create_snapshot(uuid, uuid, text, text) from public;
revoke all on function public.copenhagen_create_snapshot(uuid, uuid, text, text) from authenticated;
grant execute on function public.copenhagen_create_snapshot(uuid, uuid, text, text) to anon;

create or replace function public.copenhagen_restore_snapshot(
  p_trip_id uuid,
  p_snapshot_id uuid,
  p_admin_code text,
  p_device_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  authorization_result text;
  snapshot_entries jsonb;
  snapshot_created_at timestamptz;
  current_entries jsonb;
  current_count integer;
  current_hash text;
  pre_restore_id uuid;
  restore_at timestamptz;
  restored_count integer;
begin
  if p_trip_id <> 'e110549f-c366-4116-ba14-aedbfbb1946c'::uuid
     or p_snapshot_id is null
     or p_device_id is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_request');
  end if;

  authorization_result := private.copenhagen_authorize_restore(p_trip_id, p_admin_code);
  if authorization_result <> 'ok' then
    return jsonb_build_object('ok', false, 'error', authorization_result);
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_trip_id::text, 310)
  );

  select entries, created_at
  into snapshot_entries, snapshot_created_at
  from public.copenhagen_shared_snapshots
  where trip_id = p_trip_id
    and id = p_snapshot_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'snapshot_not_found');
  end if;

  if jsonb_typeof(snapshot_entries) <> 'array'
     or jsonb_array_length(snapshot_entries) > 2500
     or exists (
       select 1
       from jsonb_array_elements(snapshot_entries) entry
       where jsonb_typeof(entry) <> 'object'
          or entry->>'path' is null
          or char_length(entry->>'path') not between 2 and 500
          or (entry->>'path') !~ '^/(items|starts|forced|reservations|manualAside|departures|timeOverrides|durationOverrides|openingOverrides|order|customOrderDays|dayOverrides|customPoints|deletedIds|globalNotes|stayInfo)(/|$)'
          or jsonb_typeof(entry->'is_deleted') <> 'boolean'
     ) then
    return jsonb_build_object('ok', false, 'error', 'invalid_snapshot');
  end if;

  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'path', shared.path,
          'value', shared.value,
          'is_deleted', shared.is_deleted
        )
        order by shared.path
      ),
      '[]'::jsonb
    ),
    count(*)::integer
  into current_entries, current_count
  from public.copenhagen_shared_state shared
  where shared.trip_id = p_trip_id;

  current_hash := encode(
    extensions.digest(current_entries::text, 'sha256'),
    'hex'
  );

  insert into public.copenhagen_shared_snapshots (
    trip_id,
    created_by,
    reason,
    label,
    state_hash,
    entry_count,
    entries
  ) values (
    p_trip_id,
    p_device_id,
    'pre_restore',
    'Avant la restauration du ' || to_char(snapshot_created_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI'),
    current_hash,
    current_count,
    current_entries
  )
  returning id into pre_restore_id;

  select greatest(
    clock_timestamp(),
    coalesce(max(client_updated_at) + interval '1 millisecond', clock_timestamp())
  )
  into restore_at
  from public.copenhagen_shared_state
  where trip_id = p_trip_id;

  update public.copenhagen_shared_state
  set value = null,
      is_deleted = true,
      device_id = p_device_id,
      client_updated_at = restore_at
  where trip_id = p_trip_id;

  insert into public.copenhagen_shared_state (
    trip_id,
    path,
    value,
    is_deleted,
    device_id,
    client_updated_at
  )
  select
    p_trip_id,
    entry->>'path',
    entry->'value',
    (entry->>'is_deleted')::boolean,
    p_device_id,
    restore_at
  from jsonb_array_elements(snapshot_entries) entry
  on conflict (trip_id, path) do update
  set value = excluded.value,
      is_deleted = excluded.is_deleted,
      device_id = excluded.device_id,
      client_updated_at = excluded.client_updated_at;

  get diagnostics restored_count = row_count;

  return jsonb_build_object(
    'ok', true,
    'restored_snapshot_id', p_snapshot_id,
    'pre_restore_snapshot_id', pre_restore_id,
    'restored_at', restore_at,
    'restored_entries', restored_count
  );
end;
$$;

revoke all on function public.copenhagen_restore_snapshot(uuid, uuid, text, uuid) from public;
revoke all on function public.copenhagen_restore_snapshot(uuid, uuid, text, uuid) from authenticated;
grant execute on function public.copenhagen_restore_snapshot(uuid, uuid, text, uuid) to anon;

notify pgrst, 'reload schema';

commit;
