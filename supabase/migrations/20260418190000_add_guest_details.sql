alter table public.bookings
  add column if not exists guest_details jsonb;

comment on column public.bookings.guest_details is 'Guest contact details for the booking';
