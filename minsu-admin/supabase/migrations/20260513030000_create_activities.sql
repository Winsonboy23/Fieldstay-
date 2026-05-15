-- ============================================================
-- Activities & Activity Signups
-- ============================================================

-- ============================================================
-- 1. activities table
-- ============================================================
create table if not exists public.activities (
  id text primary key,
  title text not null,
  short_title text,
  category text default '報名手作',
  summary text,
  activity_date date not null,
  start_time time not null,
  end_time time not null,
  duration text,                     -- display string, e.g. "2.5 hr"
  capacity int not null default 0,
  registered int not null default 0,
  price int not null default 0,
  unit text default '人',
  location text,
  address text,
  instructor text,
  image text,                        -- cover image URL
  gallery_images text[] default '{}'::text[],
  highlights text[] default '{}'::text[],
  notes text[] default '{}'::text[],
  is_published boolean default true,
  created_at timestamptz default now()
);

alter table public.activities enable row level security;

-- anon can read published activities
drop policy if exists "Public read activities" on public.activities;
create policy "Public read activities"
  on public.activities for select to anon, authenticated
  using (true);

drop policy if exists "Admins write activities" on public.activities;
create policy "Admins write activities"
  on public.activities for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins update activities" on public.activities;
create policy "Admins update activities"
  on public.activities for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins delete activities" on public.activities;
create policy "Admins delete activities"
  on public.activities for delete to authenticated
  using (public.is_admin());

-- ============================================================
-- 2. activity_signups table
-- ============================================================
create table if not exists public.activity_signups (
  id bigserial primary key,
  activity_id text not null references public.activities(id) on delete cascade,
  guest_id bigint references public.guests(id) on delete set null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  quantity int not null default 1,
  total_price int not null default 0,
  special_request text,
  payment_method text default 'transfer',
  payment_status text default 'unpaid',  -- unpaid / paid / refunded
  status text default 'confirmed',       -- confirmed / waitlist / cancelled
  created_at timestamptz default now()
);

create index if not exists idx_activity_signups_activity on public.activity_signups(activity_id);
create index if not exists idx_activity_signups_guest on public.activity_signups(guest_id);

alter table public.activity_signups enable row level security;

drop policy if exists "Admins manage activity_signups" on public.activity_signups;
create policy "Admins manage activity_signups"
  on public.activity_signups for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Customers read own activity_signups" on public.activity_signups;
create policy "Customers read own activity_signups"
  on public.activity_signups for select to authenticated
  using (
    guest_id in (
      select id from public.guests
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

-- ============================================================
-- 3. RPC: create_activity_signup (atomic capacity check + registered++)
-- ============================================================
create or replace function public.create_activity_signup(
  p_activity_id text,
  p_guest_id bigint,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_quantity int default 1,
  p_special_request text default null,
  p_payment_method text default 'transfer'
)
returns public.activity_signups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_activity public.activities;
  v_signup public.activity_signups;
  v_status text;
  v_total int;
begin
  select * into v_activity from public.activities where id = p_activity_id for update;
  if v_activity is null then
    raise exception 'ACTIVITY_NOT_FOUND';
  end if;

  if v_activity.registered + p_quantity > v_activity.capacity then
    -- become waitlist instead of erroring out
    v_status := 'waitlist';
  else
    v_status := 'confirmed';
    update public.activities
      set registered = registered + p_quantity
      where id = p_activity_id;
  end if;

  v_total := v_activity.price * p_quantity;

  insert into public.activity_signups (
    activity_id, guest_id, contact_name, contact_email, contact_phone,
    quantity, total_price, special_request, payment_method, status
  ) values (
    p_activity_id, p_guest_id, p_contact_name, p_contact_email, p_contact_phone,
    p_quantity, v_total, p_special_request, p_payment_method, v_status
  ) returning * into v_signup;

  return v_signup;
end;
$$;

grant execute on function public.create_activity_signup(text, bigint, text, text, text, int, text, text) to authenticated;

-- ============================================================
-- 4. Storage bucket + policies for activity images
-- ============================================================
insert into storage.buckets (id, name, public)
values ('activity-images', 'activity-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read activity-images" on storage.objects;
create policy "Public read activity-images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'activity-images');

drop policy if exists "Admins write activity-images" on storage.objects;
create policy "Admins write activity-images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'activity-images' and public.is_admin());

drop policy if exists "Admins update activity-images" on storage.objects;
create policy "Admins update activity-images"
  on storage.objects for update to authenticated
  using (bucket_id = 'activity-images' and public.is_admin())
  with check (bucket_id = 'activity-images' and public.is_admin());

drop policy if exists "Admins delete activity-images" on storage.objects;
create policy "Admins delete activity-images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'activity-images' and public.is_admin());

-- ============================================================
-- 5. Seed: 10 activities (idempotent via id PK)
-- ============================================================
insert into public.activities (
  id, title, short_title, category, summary,
  activity_date, start_time, end_time, duration,
  capacity, registered, price, unit,
  location, address, instructor,
  image, highlights, notes
) values
('honggui-cake', '傳統炊粿・紅龜粿手作', '紅龜粿手作', '報名手作',
 '百年大灶起火，跟著阿嬤揉拌粿、印粿、上蒸籠。每人帶 6 顆紅龜粿回家。',
 '2026-05-12', '14:00', '16:30', '2.5 hr',
 8, 6, 980, '人',
 '老屋廚趣', '台南市中西區民權路二段 30 號', '陳阿嬤',
 'https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?w=1200&q=80',
 array['體驗百年大灶傳統炊粿', '學習揉麵、包餡、印模技巧', '了解紅龜粿的文化意義', '每人帶走 6 顆手作紅龜粿'],
 array['適合 12 歲以上參加', '請穿著輕便服裝', '建議提前 10 分鐘到達']),

('rice-harvest', '清晨割稻・田間早餐', '清晨割稻體驗', '農事體驗',
 '清晨走進稻田，學習割稻與綁稻，最後在田邊享用熱粥與小菜早餐。',
 '2026-05-14', '06:00', '09:00', '3 hr',
 10, 4, 1200, '人',
 '後埕稻田', '台南市後壁區稻田路 18 號', '林伯伯',
 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200&q=80',
 array['體驗傳統割稻與綁稻', '認識稻作與節氣', '田邊早餐', '帶回一束稻穗紀念'],
 array['請穿防滑鞋', '活動可能因天候調整', '建議攜帶帽子與水壺']),

('plum-wine', '立夏限定・青梅釀酒', '青梅釀酒', '節氣釀造',
 '挑青梅、洗梅、殺青與封罐，帶回一瓶屬於自己的夏日梅酒。',
 '2026-05-16', '13:30', '15:30', '2 hr',
 8, 7, 680, '人',
 '老屋中庭', '台南市中西區民權路二段 30 號', '吳釀師',
 'https://images.unsplash.com/photo-1620149455040-fbd9d4a59d40?w=1200&q=80',
 array['認識青梅處理流程', '完成個人梅酒封罐', '學習保存與飲用時程', '帶回 1 罐青梅酒'],
 array['未滿 18 歲不得飲酒', '可改做無酒精梅露', '請提前 10 分鐘到場']),

('kiln-building', '磚瓦匠的手・古法砌窯', '古法砌窯', '在地職人',
 '與第三代瓦窯師傅共工一日，學疊磚、抹漿、修簷，午餐自烤披薩。',
 '2026-05-18', '10:00', '16:00', '6 hr',
 6, 0, 1480, '人',
 '後埕窯場', '台南市後壁區窯場路 8 號', '黃師傅',
 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80',
 array['學習古法砌窯工序', '理解磚瓦與老屋修復', '職人現場示範', '午餐自烤披薩'],
 array['請穿可弄髒衣物', '活動含午餐', '不建議 12 歲以下單獨參加']),

('feed-chicken', '小田農夫・餵雞拾蛋', '餵雞拾蛋', '親子同遊',
 '給小朋友的第一堂農事課：認識三隻土雞、餵食、撿溫熱的蛋回家。',
 '2026-05-21', '15:30', '17:00', '1.5 hr',
 12, 5, 780, '親子組',
 '老屋後院', '台南市中西區民權路二段 30 號', '小田老師',
 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1200&q=80',
 array['認識土雞生活習性', '親手餵食與撿蛋', '完成小農夫任務卡', '帶回新鮮雞蛋'],
 array['適合親子同行', '請穿耐髒鞋', '現場需家長陪同']),

('firefly-walk', '螢火夜行・後山步道', '螢火夜行', '獨處時光',
 '熄燈隨自然生光。在地嚮導帶你走 1.6km 步道，認識螢火蟲與夜間生物。',
 '2026-05-23', '19:30', '21:00', '1.5 hr',
 12, 12, 450, '人',
 '後山步道入口', '台南市後壁區後山步道入口', '阿哲嚮導',
 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&q=80',
 array['夜間生態導覽', '認識螢火蟲棲地', '低光害步道體驗', '小班制慢行'],
 array['請勿使用強光手電筒', '請穿長袖長褲', '此活動已額滿可候補']),

('savory-rice-cake', '柴燒手作・鹹粿與菜頭粿', '鹹粿菜頭粿', '飲食手作',
 '使用在地白米與蘿蔔，跟著阿桂阿姨的私房比例，蒸出最有家的味道的粿。',
 '2026-05-26', '10:00', '12:30', '2.5 hr',
 8, 3, 880, '人',
 '老屋灶腳', '台南市中西區民權路二段 30 號', '阿桂阿姨',
 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
 array['學習米漿比例', '處理蘿蔔與鹹料', '柴燒蒸籠體驗', '帶回自製菜頭粿'],
 array['活動含試吃', '請自備保鮮盒', '可素食請提前告知']),

('morning-walk', '晨間靜走・田埂之間', '晨間靜走', '獨處時光',
 '不講話，跟著嚮導以慢速走過 2km 田埂。回程奉上一杯熱玄米茶。',
 '2026-05-28', '06:30', '07:30', '1 hr',
 8, 2, 380, '人',
 '老屋門口集合', '台南市中西區民權路二段 30 號', '阿曼老師',
 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80',
 array['田埂慢行', '呼吸與步伐練習', '晨間觀察筆記', '回程熱玄米茶'],
 array['請準時集合', '建議穿輕便鞋', '雨天改為室內靜心茶席']),

('summer-vegetable', '小滿菜園・夏蔬採收日', '夏蔬採收', '節氣 · 小滿',
 '小滿時節，菜園正盛。採瓜、剪辣椒、拔蘿蔔，自選 2kg 蔬果帶回家。',
 '2026-05-30', '08:30', '11:30', '3 hr',
 10, 1, 780, '人',
 '後埕菜園', '台南市後壁區後埕菜園', '菜園阿良',
 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80',
 array['認識夏季蔬菜', '親手採收蔬果', '菜園導覽', '帶回 2kg 當季蔬果'],
 array['請戴帽子防曬', '可自備購物袋', '雨天可能延期'])
on conflict (id) do nothing;
