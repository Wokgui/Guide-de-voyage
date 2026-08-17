begin;

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

create table if not exists private.app_owners (
  app_id text primary key,
  user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default clock_timestamp()
);

alter table private.app_owners enable row level security;
revoke all on table private.app_owners from public;
revoke all on table private.app_owners from anon;
revoke all on table private.app_owners from authenticated;

create or replace function public.wokgui_is_app_owner(p_app_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.app_owners owner_row
    where owner_row.app_id = p_app_id
      and owner_row.user_id = auth.uid()
  );
$$;

revoke all on function public.wokgui_is_app_owner(text) from public;
revoke all on function public.wokgui_is_app_owner(text) from anon;
revoke all on function public.wokgui_is_app_owner(text) from authenticated;
grant execute on function public.wokgui_is_app_owner(text) to authenticated;

-- À faire une seule fois depuis une migration privée ou le SQL Editor avec un rôle de confiance :
-- associer 'guide-de-voyage' à l'UUID auth de son propriétaire dans private.app_owners.
-- Ne jamais mettre cet UUID dans le JavaScript client ni publier de clé service_role.

create table if not exists public.copenhagen_shared_state (
  trip_id uuid not null,
  path text not null,
  value jsonb,
  is_deleted boolean not null default false,
  device_id uuid not null,
  client_updated_at timestamptz not null,
  updated_at timestamptz not null default clock_timestamp(),
  primary key (trip_id, path),
  constraint copenhagen_shared_state_path_format
    check (
      path ~ '^/(items|starts|forced|reservations|manualAside|departures|timeOverrides|durationOverrides|openingOverrides|order|customOrderDays|dayOverrides|customPoints|deletedIds|globalNotes|stayInfo)(/|$)'
    ),
  constraint copenhagen_shared_state_path_length
    check (char_length(path) between 2 and 500)
);

alter table public.copenhagen_shared_state enable row level security;

create or replace function public.copenhagen_shared_state_accept_newer()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'UPDATE' and new.client_updated_at < old.client_updated_at then
    return old;
  end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

revoke all on function public.copenhagen_shared_state_accept_newer() from public;
revoke all on function public.copenhagen_shared_state_accept_newer() from anon;
revoke all on function public.copenhagen_shared_state_accept_newer() from authenticated;

drop trigger if exists copenhagen_shared_state_accept_newer_trigger
  on public.copenhagen_shared_state;

create trigger copenhagen_shared_state_accept_newer_trigger
before insert or update on public.copenhagen_shared_state
for each row execute function public.copenhagen_shared_state_accept_newer();

revoke all on table public.copenhagen_shared_state from public;
revoke all on table public.copenhagen_shared_state from anon;
revoke all on table public.copenhagen_shared_state from authenticated;
grant select, insert, update on table public.copenhagen_shared_state to authenticated;

drop policy if exists "copenhagen_public_read" on public.copenhagen_shared_state;
drop policy if exists "copenhagen_public_insert" on public.copenhagen_shared_state;
drop policy if exists "copenhagen_public_update" on public.copenhagen_shared_state;
drop policy if exists "copenhagen_trip_select" on public.copenhagen_shared_state;
drop policy if exists "copenhagen_trip_insert" on public.copenhagen_shared_state;
drop policy if exists "copenhagen_trip_update" on public.copenhagen_shared_state;

create policy "copenhagen_trip_select"
on public.copenhagen_shared_state
for select
to authenticated
using (
  trip_id = 'e110549f-c366-4116-ba14-aedbfbb1946c'::uuid
  and public.wokgui_is_app_owner('guide-de-voyage')
);

create policy "copenhagen_trip_insert"
on public.copenhagen_shared_state
for insert
to authenticated
with check (
  trip_id = 'e110549f-c366-4116-ba14-aedbfbb1946c'::uuid
  and public.wokgui_is_app_owner('guide-de-voyage')
);

create policy "copenhagen_trip_update"
on public.copenhagen_shared_state
for update
to authenticated
using (
  trip_id = 'e110549f-c366-4116-ba14-aedbfbb1946c'::uuid
  and public.wokgui_is_app_owner('guide-de-voyage')
)
with check (
  trip_id = 'e110549f-c366-4116-ba14-aedbfbb1946c'::uuid
  and public.wokgui_is_app_owner('guide-de-voyage')
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'copenhagen_shared_state'
  ) then
    alter publication supabase_realtime add table public.copenhagen_shared_state;
  end if;
end
$$;

notify pgrst, 'reload schema';
commit;
