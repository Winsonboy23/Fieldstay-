-- Brand / contact / bank info, editable from admin Settings page.
alter table public.settings
  add column if not exists brand_name_zh text default '山田寓所',
  add column if not exists brand_name_en text default 'FIELDSTAY',
  add column if not exists brand_tagline text default '田間民宿訂房',
  add column if not exists logo_url text,
  add column if not exists bank_name text default '台灣銀行 (004)',
  add column if not exists bank_branch text default '台中分行',
  add column if not exists bank_account_name text default '訂房系統股份有限公司',
  add column if not exists bank_account_number text default '123-456-789012',
  add column if not exists contact_email text default 'service@booking.com',
  add column if not exists contact_phone text default '02-1234-5678';

-- Allow public read of settings so frontend (anon) can fetch brand/bank info.
drop policy if exists "Public read settings" on public.settings;
create policy "Public read settings"
  on public.settings for select
  to anon, authenticated
  using (true);
