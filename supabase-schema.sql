-- ========================================
-- Trayati Stays — Production Database Schema
-- ========================================

-- 1. STAYS (main property listings)
create table if not exists public.stays (
  id text primary key,
  title text not null,
  subtitle text not null default 'Trayati Stays',
  location text not null,
  city text not null,
  state text not null,
  country text not null default 'India',
  pin text not null default '',
  address text not null default '',
  google_maps_url text not null default '',
  description text not null,
  rating numeric(2,1) not null default 0,
  price_per_night integer not null,
  base_price integer not null,
  image text not null,
  alt text not null default '',
  tag text not null default '',
  type text not null default '',
  experience_type text not null default '',
  amenities jsonb not null default '[]'::jsonb,
  photos jsonb not null default '[]'::jsonb,
  room_types jsonb not null default '[]'::jsonb,
  amenities_detail jsonb not null default '{}'::jsonb,
  meal_options jsonb not null default '[]'::jsonb,
  cancellation_policies jsonb not null default '[]'::jsonb,
  booking_link text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. TESTIMONIALS
create table if not exists public.testimonials (
  id text primary key,
  name text not null,
  title text not null default '',
  text text not null,
  rating numeric(2,1) not null default 5.0,
  image text not null default '',
  source text not null default '',
  date text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. EXPERIENCES (blogs / travel stories)
create table if not exists public.experiences (
  id text primary key,
  title text not null,
  description text not null,
  content text not null default '',
  image text not null default '',
  category text not null default '',
  author text not null default '',
  date text not null default '',
  read_time integer,
  featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. PROPERTY SUBMISSIONS (user-listed properties pending approval)
create table if not exists public.property_submissions (
  id text primary key,
  clerk_user_id text not null default '',
  user_name text not null default '',
  user_email text not null default '',
  property_payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

-- 5. CONTACT MESSAGES
create table if not exists public.contact_messages (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text not null,
  phone text not null default '',
  message text not null,
  source text not null default 'contact',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 6. RESERVATIONS
create table if not exists public.reservations (
  id text primary key default gen_random_uuid()::text,
  stay_id text not null,
  room_id text,
  clerk_user_id text not null default '',
  user_name text not null default '',
  user_email text not null default '',
  property_name text not null default '',
  check_in date not null,
  check_out date not null,
  guests integer not null default 1,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

-- 7. BOOKING SESSIONS (multi-step booking flow)
create table if not exists public.booking_sessions (
  id text primary key default gen_random_uuid()::text,
  clerk_user_id text not null,
  stay_id text not null,
  room_id text not null,
  check_in date not null,
  check_out date not null,
  guests integer not null default 1,
  meal_option_id text,
  special_requests text default '',
  room_total integer not null,
  meal_total integer not null default 0,
  subtotal integer not null,
  gst_amount integer not null,
  total_amount integer not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

alter table public.stays enable row level security;
alter table public.testimonials enable row level security;
alter table public.experiences enable row level security;
alter table public.property_submissions enable row level security;
alter table public.contact_messages enable row level security;
alter table public.reservations enable row level security;
alter table public.booking_sessions enable row level security;

-- Public can read active stays, testimonials, experiences
create policy "public can read active stays"
  on public.stays for select
  to public
  using (is_active = true);

create policy "public can read active testimonials"
  on public.testimonials for select
  to public
  using (is_active = true);

create policy "public can read active experiences"
  on public.experiences for select
  to public
  using (is_active = true);

-- Service role can do everything
create policy "service role full access on stays"
  on public.stays for all
  to service_role
  using (true) with check (true);

create policy "service role full access on testimonials"
  on public.testimonials for all
  to service_role
  using (true) with check (true);

create policy "service role full access on experiences"
  on public.experiences for all
  to service_role
  using (true) with check (true);

create policy "service role full access on property_submissions"
  on public.property_submissions for all
  to service_role
  using (true) with check (true);

create policy "service role full access on contact_messages"
  on public.contact_messages for all
  to service_role
  using (true) with check (true);

create policy "service role full access on reservations"
  on public.reservations for all
  to service_role
  using (true) with check (true);

create policy "service role full access on booking_sessions"
  on public.booking_sessions for all
  to service_role
  using (true) with check (true);

-- Anyone can insert property submissions
create policy "anyone can insert property submissions"
  on public.property_submissions for insert
  to public
  with check (true);

-- Anyone can insert contact messages
create policy "anyone can insert contact messages"
  on public.contact_messages for insert
  to public
  with check (true);

-- ========================================
-- STORAGE BUCKET
-- ========================================

insert into storage.buckets (id, name, public)
values ('trayati-media', 'trayati-media', true)
on conflict (id) do update set public = true;

create policy "public can read trayati media"
  on storage.objects for select
  to public
  using (bucket_id = 'trayati-media');

create policy "service role can manage trayati media"
  on storage.objects for all
  to service_role
  using (bucket_id = 'trayati-media')
  with check (bucket_id = 'trayati-media');

-- ========================================
-- UPDATED_AT TRIGGER
-- ========================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger stays_updated_at
  before update on public.stays
  for each row execute function public.handle_updated_at();

create trigger testimonials_updated_at
  before update on public.testimonials
  for each row execute function public.handle_updated_at();

create trigger experiences_updated_at
  before update on public.experiences
  for each row execute function public.handle_updated_at();

create trigger booking_sessions_updated_at
  before update on public.booking_sessions
  for each row execute function public.handle_updated_at();

-- ========================================
-- DROP OLD GENERIC TABLE IF EXISTS
-- ========================================

drop table if exists public.trayati_content cascade;

-- ========================================
-- MIGRATION: Add featured & content to experiences
-- ========================================
-- Run these ALTER statements if the columns don't exist yet:

-- alter table public.experiences add column if not exists featured boolean not null default false;
-- alter table public.experiences add column if not exists content text not null default '';

-- ========================================
-- MIGRATION: Add booking_link to stays and property_name to reservations
-- ========================================
-- Run these ALTER statements if the columns don't exist yet:

-- alter table public.stays add column if not exists booking_link text not null default '';
-- alter table public.reservations add column if not exists property_name text not null default '';
