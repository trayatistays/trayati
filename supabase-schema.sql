create table if not exists public.trayati_content (
  collection text not null,
  id text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);

alter table public.trayati_content enable row level security;

create policy "service role can manage trayati content"
on public.trayati_content
for all
to service_role
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('trayati-media', 'trayati-media', true)
on conflict (id) do update set public = true;

create policy "public can read trayati media"
on storage.objects
for select
to public
using (bucket_id = 'trayati-media');

create policy "service role can manage trayati media"
on storage.objects
for all
to service_role
using (bucket_id = 'trayati-media')
with check (bucket_id = 'trayati-media');
