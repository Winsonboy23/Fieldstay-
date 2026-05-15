alter table public.rooms
  add column if not exists cleaning_fee integer default 500,
  add column if not exists service_fee_rate numeric(5,4) default 0.05,
  add column if not exists city text,
  add column if not exists address text;
