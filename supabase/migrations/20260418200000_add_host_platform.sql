create table if not exists public.hosts (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  business_name text,
  gst_number text,
  pan_number text,
  bank_account_number text,
  bank_ifsc text,
  bank_name text,
  payout_method text default 'bank_transfer',
  status text not null default 'pending' check (status in ('pending', 'approved', 'suspended', 'rejected')),
  total_earnings integer default 0,
  total_payouts integer default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stay_hosts (
  id uuid primary key default gen_random_uuid(),
  stay_id text not null references public.stays(id) on delete cascade,
  host_id uuid not null references public.hosts(id) on delete cascade,
  ownership_percentage integer default 100 check (ownership_percentage > 0 and ownership_percentage <= 100),
  is_primary boolean default true,
  created_at timestamptz not null default now(),
  unique(stay_id, host_id)
);

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  min_booking_amount integer default 0,
  max_discount_amount integer,
  usage_limit integer,
  usage_count integer default 0,
  valid_from date not null,
  valid_until date not null,
  is_active boolean default true,
  applicable_stay_ids text[] default '{}',
  created_by text default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  stay_id text not null references public.stays(id) on delete cascade,
  user_id text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  cleanliness_rating integer check (cleanliness_rating >= 1 and cleanliness_rating <= 5),
  location_rating integer check (location_rating >= 1 and location_rating <= 5),
  value_rating integer check (value_rating >= 1 and value_rating <= 5),
  title text,
  comment text,
  response text,
  responded_at timestamptz,
  is_published boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(booking_id)
);

create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  stay_id text not null references public.stays(id) on delete cascade,
  host_id uuid references public.hosts(id) on delete set null,
  gross_amount integer not null,
  commission_percentage integer not null default 10,
  commission_amount integer not null,
  gst_on_commission integer not null default 0,
  tds integer default 0,
  net_payout integer not null,
  status text not null default 'pending' check (status in ('pending', 'processed', 'paid', 'cancelled')),
  payout_reference text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id text not null,
  stay_id text not null references public.stays(id) on delete cascade,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  stay_name text not null,
  check_in date not null,
  check_out date not null,
  nights integer not null,
  guests integer not null,
  room_name text,
  base_amount integer not null,
  cleaning_fee integer default 0,
  service_fee integer default 0,
  gst_amount integer default 0,
  discount_code text,
  discount_amount integer default 0,
  total_amount integer not null,
  payment_id text,
  payment_method text,
  payment_status text default 'paid',
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.stays add column if not exists host_id uuid references public.hosts(id) on delete set null;
alter table public.stays add column if not exists commission_percentage integer default 10;

alter table public.bookings add column if not exists promo_code_id uuid references public.promo_codes(id) on delete set null;
alter table public.bookings add column if not exists discount_amount integer default 0;

create index if not exists hosts_clerk_user_id_idx on public.hosts(clerk_user_id);
create index if not exists hosts_status_idx on public.hosts(status);
create index if not exists stay_hosts_stay_id_idx on public.stay_hosts(stay_id);
create index if not exists stay_hosts_host_id_idx on public.stay_hosts(host_id);
create index if not exists promo_codes_code_idx on public.promo_codes(code);
create index if not exists promo_codes_valid_dates_idx on public.promo_codes(valid_from, valid_until, is_active);
create index if not exists reviews_stay_id_idx on public.reviews(stay_id);
create index if not exists reviews_user_id_idx on public.reviews(user_id);
create index if not exists reviews_rating_idx on public.reviews(rating);
create index if not exists commissions_booking_id_idx on public.commissions(booking_id);
create index if not exists commissions_host_id_idx on public.commissions(host_id);
create index if not exists commissions_status_idx on public.commissions(status);
create index if not exists invoices_booking_id_idx on public.invoices(booking_id);
create index if not exists invoices_invoice_number_idx on public.invoices(invoice_number);

alter table public.hosts enable row level security;
alter table public.stay_hosts enable row level security;
alter table public.promo_codes enable row level security;
alter table public.reviews enable row level security;
alter table public.commissions enable row level security;
alter table public.invoices enable row level security;

create policy "service role full access on hosts" on public.hosts for all to service_role using (true) with check (true);
create policy "service role full access on stay_hosts" on public.stay_hosts for all to service_role using (true) with check (true);
create policy "service role full access on promo_codes" on public.promo_codes for all to service_role using (true) with check (true);
create policy "service role full access on reviews" on public.reviews for all to service_role using (true) with check (true);
create policy "service role full access on commissions" on public.commissions for all to service_role using (true) with check (true);
create policy "service role full access on invoices" on public.invoices for all to service_role using (true) with check (true);
