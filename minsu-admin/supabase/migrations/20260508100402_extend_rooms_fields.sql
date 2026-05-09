alter table public.rooms
  add column if not exists subtitle text,
  add column if not exists area_sqm integer,
  add column if not exists bed_text text,
  add column if not exists bathroom_text text,
  add column if not exists category text default 'double',
  add column if not exists amenities text[] default '{}',
  add column if not exists house_rules text[] default '{}',
  add column if not exists gallery_images text[] default '{}';
