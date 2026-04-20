create extension if not exists btree_gist;

create table if not exists public.booking_sources (
  id uuid primary key default gen_random_uuid(),
  stay_id text not null references public.stays(id) on delete cascade,
  room_id text,
  provider_name text not null default '',
  feed_url text not null,
  is_active boolean not null default true,
  last_synced_at timestamptz,
  last_sync_status text not null default 'never'
    check (last_sync_status in ('never', 'success', 'failed')),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stay_id, room_id, feed_url)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  stay_id text not null references public.stays(id) on delete cascade,
  room_id text,
  room_scope text generated always as (coalesce(room_id, '__stay__')) stored,
  start_date date not null,
  end_date date not null,
  date_span daterange generated always as (daterange(start_date, end_date, '[)')) stored,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'failed', 'cancelled')),
  payment_id text,
  payment_order_id text,
  currency text not null default 'INR',
  amount integer,
  lock_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date > start_date)
);

create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  stay_id text not null references public.stays(id) on delete cascade,
  room_id text,
  room_scope text generated always as (coalesce(room_id, '__stay__')) stored,
  start_date date not null,
  end_date date not null,
  date_span daterange generated always as (daterange(start_date, end_date, '[)')) stored,
  source text not null check (source in ('ical', 'local')),
  booking_id uuid references public.bookings(id) on delete cascade,
  booking_source_id uuid references public.booking_sources(id) on delete cascade,
  external_uid text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date > start_date)
);

create table if not exists public.booking_locks (
  id uuid primary key,
  stay_id text not null references public.stays(id) on delete cascade,
  room_id text,
  room_scope text generated always as (coalesce(room_id, '__stay__')) stored,
  session_id text not null,
  start_date date not null,
  end_date date not null,
  expires_at timestamptz not null,
  released_at timestamptz,
  booking_id uuid references public.bookings(id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);

create index if not exists booking_sources_stay_idx
  on public.booking_sources (stay_id, room_id, is_active);

create index if not exists bookings_lookup_idx
  on public.bookings (stay_id, room_id, start_date, end_date, status);

create index if not exists bookings_payment_order_idx
  on public.bookings (payment_order_id);

create index if not exists blocked_dates_lookup_idx
  on public.blocked_dates (stay_id, room_id, start_date, end_date, source, is_active);

create index if not exists booking_locks_lookup_idx
  on public.booking_locks (stay_id, room_id, expires_at)
  where released_at is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blocked_dates_no_overlap'
  ) then
    alter table public.blocked_dates
      add constraint blocked_dates_no_overlap
      exclude using gist (
        stay_id with =,
        room_scope with =,
        date_span with &&
      )
      where (is_active);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'confirmed_bookings_no_overlap'
  ) then
    alter table public.bookings
      add constraint confirmed_bookings_no_overlap
      exclude using gist (
        stay_id with =,
        room_scope with =,
        date_span with &&
      )
      where (status = 'confirmed');
  end if;
end $$;

alter table public.booking_sources enable row level security;
alter table public.bookings enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.booking_locks enable row level security;

create policy "service role full access on booking_sources"
  on public.booking_sources for all
  to service_role
  using (true) with check (true);

create policy "service role full access on bookings"
  on public.bookings for all
  to service_role
  using (true) with check (true);

create policy "service role full access on blocked_dates"
  on public.blocked_dates for all
  to service_role
  using (true) with check (true);

create policy "service role full access on booking_locks"
  on public.booking_locks for all
  to service_role
  using (true) with check (true);

do $$
begin
  if exists (
    select 1
    from pg_proc
    where proname = 'handle_updated_at'
      and pg_function_is_visible(oid)
  ) then
    if not exists (
      select 1 from pg_trigger where tgname = 'booking_sources_updated_at'
    ) then
      create trigger booking_sources_updated_at
        before update on public.booking_sources
        for each row execute function public.handle_updated_at();
    end if;

    if not exists (
      select 1 from pg_trigger where tgname = 'bookings_updated_at'
    ) then
      create trigger bookings_updated_at
        before update on public.bookings
        for each row execute function public.handle_updated_at();
    end if;

    if not exists (
      select 1 from pg_trigger where tgname = 'blocked_dates_updated_at'
    ) then
      create trigger blocked_dates_updated_at
        before update on public.blocked_dates
        for each row execute function public.handle_updated_at();
    end if;
  end if;
end $$;
