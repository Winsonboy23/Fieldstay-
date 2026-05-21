alter table public.guests
  add column if not exists emergency_contact text;
