alter table public.rooms
  add column if not exists check_in_time text default '15:00',
  add column if not exists check_out_time text default '11:00';
