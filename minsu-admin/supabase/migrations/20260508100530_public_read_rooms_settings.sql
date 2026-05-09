alter table if exists public.rooms enable row level security;
alter table if exists public.settings enable row level security;

drop policy if exists "Allow public read rooms" on public.rooms;
create policy "Allow public read rooms"
on public.rooms
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public read settings" on public.settings;
create policy "Allow public read settings"
on public.settings
for select
to anon, authenticated
using (true);
