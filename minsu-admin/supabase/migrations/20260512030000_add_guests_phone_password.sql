alter table public.guests
  add column if not exists phone text,
  add column if not exists password text;

create unique index if not exists guests_email_unique on public.guests (email);
