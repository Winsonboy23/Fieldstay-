insert into storage.buckets (id, name, public)
values ('room-images', 'room-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Allow authenticated upload room images" on storage.objects;
create policy "Allow authenticated upload room images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'room-images');

drop policy if exists "Allow authenticated update room images" on storage.objects;
create policy "Allow authenticated update room images"
on storage.objects
for update
to authenticated
using (bucket_id = 'room-images')
with check (bucket_id = 'room-images');

drop policy if exists "Allow authenticated delete room images" on storage.objects;
create policy "Allow authenticated delete room images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'room-images');

drop policy if exists "Allow public read room images" on storage.objects;
create policy "Allow public read room images"
on storage.objects
for select
to public
using (bucket_id = 'room-images');
