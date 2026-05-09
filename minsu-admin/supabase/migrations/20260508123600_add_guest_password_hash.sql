alter table public.guests
  add column if not exists password_hash text;
