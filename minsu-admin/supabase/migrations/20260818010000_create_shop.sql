-- ============================================================
-- Shop: products / shop_orders / shop_order_items
--
-- v1 為「全手動物流」：
--   常溫 → 超商取貨（7-11 或全家）
--   冷凍 → 超商取貨（僅全家，7-11 冷凍交貨便個人無法自行寄件）
--   冷藏 → 黑貓低溫宅配（超商無冷藏溫層）
-- 付款只有銀行轉帳，後台確認收款。
-- ============================================================

-- ============================================================
-- 1. products
-- ============================================================
create table if not exists public.products (
  id bigserial primary key,
  created_at timestamptz default now(),
  name text not null,
  subtitle text,
  description text,
  price int not null default 0,
  discount int not null default 0,
  temperature text not null default 'normal'
    check (temperature in ('normal', 'chilled', 'frozen')),
  stock int,                                  -- null = 不限量；0 = 售完
  weight_g int,                               -- 選填，購物車重量提示用
  image text,                                 -- 封面圖 URL
  gallery_images text[] default '{}'::text[],
  is_active boolean not null default true,    -- false = 前台隱藏
  sort_order int not null default 0
);

create index if not exists idx_products_active on public.products(is_active, sort_order);

alter table public.products enable row level security;

drop policy if exists "Public read products" on public.products;
create policy "Public read products"
  on public.products for select to anon, authenticated
  using (true);

drop policy if exists "Admins write products" on public.products;
create policy "Admins write products"
  on public.products for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins update products" on public.products;
create policy "Admins update products"
  on public.products for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins delete products" on public.products;
create policy "Admins delete products"
  on public.products for delete to authenticated
  using (public.is_admin());

-- ============================================================
-- 2. shop_orders
-- ============================================================
create table if not exists public.shop_orders (
  id bigserial primary key,
  created_at timestamptz default now(),
  order_no text unique not null,
  guest_id bigint references public.guests(id) on delete set null,
  status text not null default 'pending',
    -- pending(待匯款) / paid(已收款備貨中) / shipped(已出貨)
    -- / arrived(已到店) / picked_up(已完成) / cancelled(已取消)
  temperature text not null
    check (temperature in ('normal', 'chilled', 'frozen')),
  items_total int not null default 0,
  shipping_fee int not null default 0,        -- 下單當下計算後保存，日後改設定不影響舊訂單
  total_price int not null default 0,
  payment_method text default 'bank_transfer',
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  delivery_type text not null default 'cvs'
    check (delivery_type in ('cvs', 'home')),  -- cvs=超商取貨、home=黑貓低溫宅配
  cvs_brand text,                              -- 'UNIMART'(7-11) | 'FAMI'(全家)
  cvs_store_id text,
  cvs_store_name text,
  cvs_store_address text,
  receiver_address text,                       -- 宅配地址（冷藏）
  logistics_no text,                           -- 寄件單號（人工寄件後回填）
  logistics_status text,
  special_request text,
  admin_note text,
  paid_email_sent_at timestamptz,
  shipped_email_sent_at timestamptz,
  cancelled_email_sent_at timestamptz,
  constraint shop_orders_delivery_info check (
    (delivery_type = 'cvs' and cvs_brand is not null and cvs_store_id is not null)
    or (delivery_type = 'home' and receiver_address is not null)
  )
);

create index if not exists idx_shop_orders_guest on public.shop_orders(guest_id);
create index if not exists idx_shop_orders_status on public.shop_orders(status);

alter table public.shop_orders enable row level security;

drop policy if exists "Admins manage shop_orders" on public.shop_orders;
create policy "Admins manage shop_orders"
  on public.shop_orders for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Customers read own shop_orders" on public.shop_orders;
create policy "Customers read own shop_orders"
  on public.shop_orders for select to authenticated
  using (
    guest_id in (
      select id from public.guests
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

-- ============================================================
-- 3. shop_order_items
-- ============================================================
create table if not exists public.shop_order_items (
  id bigserial primary key,
  order_id bigint not null references public.shop_orders(id) on delete cascade,
  product_id bigint references public.products(id) on delete set null,
  name text not null,                          -- 下單當下的商品名稱快照
  unit_price int not null,                     -- 下單當下的單價快照（已扣折扣）
  quantity int not null,
  temperature text not null
);

create index if not exists idx_shop_order_items_order on public.shop_order_items(order_id);

alter table public.shop_order_items enable row level security;

drop policy if exists "Admins manage shop_order_items" on public.shop_order_items;
create policy "Admins manage shop_order_items"
  on public.shop_order_items for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Customers read own shop_order_items" on public.shop_order_items;
create policy "Customers read own shop_order_items"
  on public.shop_order_items for select to authenticated
  using (
    order_id in (
      select o.id from public.shop_orders o
      join public.guests g on g.id = o.guest_id
      where lower(g.email) = lower(auth.jwt() ->> 'email')
    )
  );

-- ============================================================
-- 4. settings：各溫層運費與免運門檻（後台可手動修改）
-- ============================================================
alter table public.settings
  add column if not exists ship_fee_normal int default 66,
  add column if not exists ship_fee_frozen_unimart int default 150,
  add column if not exists ship_fee_frozen_fami int default 190,
  add column if not exists ship_fee_chilled_home int default 180,
  add column if not exists free_ship_threshold_normal int,   -- null = 無免運
  add column if not exists free_ship_threshold_frozen int,
  add column if not exists free_ship_threshold_chilled int;

-- ============================================================
-- 5. RPC: create_shop_order
--    金額計算的單一真相來源（前端傳來的金額一律不採信）
-- ============================================================
create sequence if not exists public.shop_order_no_seq;

create or replace function public.create_shop_order(
  p_guest_id bigint,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_temperature text,
  p_delivery_type text,
  p_items jsonb,                               -- [{product_id, quantity}]
  p_cvs_brand text default null,
  p_cvs_store_id text default null,
  p_cvs_store_name text default null,
  p_cvs_store_address text default null,
  p_receiver_address text default null,
  p_special_request text default null,
  p_payment_method text default 'bank_transfer'
)
returns public.shop_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings public.settings;
  v_product public.products;
  v_item record;
  v_order public.shop_orders;
  v_items_total int := 0;
  v_shipping_fee int := 0;
  v_threshold int;
  v_count int;
  v_distinct int;
  v_order_no text;
begin
  if p_temperature not in ('normal', 'chilled', 'frozen') then
    raise exception 'TEMP_INVALID';
  end if;

  -- 溫層決定配送方式：冷藏只能宅配，常溫/冷凍只能超取
  if p_temperature = 'chilled' and p_delivery_type <> 'home' then
    raise exception 'DELIVERY_MISMATCH';
  end if;
  if p_temperature in ('normal', 'frozen') and p_delivery_type <> 'cvs' then
    raise exception 'DELIVERY_MISMATCH';
  end if;

  if p_delivery_type = 'cvs' then
    if coalesce(p_cvs_brand, '') not in ('UNIMART', 'FAMI') then
      raise exception 'CVS_BRAND_INVALID';
    end if;
    if coalesce(p_cvs_store_id, '') = '' or coalesce(p_cvs_store_name, '') = '' then
      raise exception 'CVS_STORE_REQUIRED';
    end if;
    -- v1：冷凍僅開放全家（7-11 冷凍交貨便個人無法在門市自行寄件）
    if p_temperature = 'frozen' and p_cvs_brand <> 'FAMI' then
      raise exception 'FROZEN_CVS_UNSUPPORTED';
    end if;
  else
    if coalesce(p_receiver_address, '') = '' then
      raise exception 'ADDRESS_REQUIRED';
    end if;
  end if;

  select count(*), count(distinct x.product_id) into v_count, v_distinct
  from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb))
    as x(product_id bigint, quantity int);

  if v_count = 0 then
    raise exception 'EMPTY_CART';
  end if;
  if v_count <> v_distinct then
    raise exception 'DUPLICATE_ITEM';
  end if;

  -- 逐項鎖定並驗證，同時累計小計
  for v_item in
    select * from jsonb_to_recordset(p_items) as x(product_id bigint, quantity int)
  loop
    if coalesce(v_item.quantity, 0) <= 0 then
      raise exception 'QUANTITY_INVALID';
    end if;

    select * into v_product from public.products
      where id = v_item.product_id for update;

    if not found then
      raise exception 'PRODUCT_NOT_FOUND';
    end if;
    if v_product.is_active is not true then
      raise exception 'PRODUCT_INACTIVE';
    end if;
    if v_product.temperature <> p_temperature then
      raise exception 'TEMP_MISMATCH';
    end if;
    if v_product.stock is not null and v_product.stock < v_item.quantity then
      raise exception 'OUT_OF_STOCK';
    end if;

    v_items_total := v_items_total
      + greatest(v_product.price - coalesce(v_product.discount, 0), 0) * v_item.quantity;
  end loop;

  -- 運費：依溫層（冷凍再依超商）取價，達免運門檻則歸零
  select * into v_settings from public.settings where id = 1;

  if p_temperature = 'normal' then
    v_shipping_fee := coalesce(v_settings.ship_fee_normal, 0);
    v_threshold := v_settings.free_ship_threshold_normal;
  elsif p_temperature = 'frozen' then
    v_shipping_fee := case
      when p_cvs_brand = 'FAMI' then coalesce(v_settings.ship_fee_frozen_fami, 0)
      else coalesce(v_settings.ship_fee_frozen_unimart, 0)
    end;
    v_threshold := v_settings.free_ship_threshold_frozen;
  else
    v_shipping_fee := coalesce(v_settings.ship_fee_chilled_home, 0);
    v_threshold := v_settings.free_ship_threshold_chilled;
  end if;

  if v_threshold is not null and v_items_total >= v_threshold then
    v_shipping_fee := 0;
  end if;

  v_order_no := 'SP'
    || to_char(timezone('Asia/Taipei', now()), 'YYMMDD')
    || lpad(nextval('public.shop_order_no_seq')::text, 4, '0');

  insert into public.shop_orders (
    order_no, guest_id, temperature,
    items_total, shipping_fee, total_price, payment_method,
    contact_name, contact_email, contact_phone,
    delivery_type, cvs_brand, cvs_store_id, cvs_store_name, cvs_store_address,
    receiver_address, special_request
  ) values (
    v_order_no, p_guest_id, p_temperature,
    v_items_total, v_shipping_fee, v_items_total + v_shipping_fee, p_payment_method,
    p_contact_name, p_contact_email, p_contact_phone,
    p_delivery_type, p_cvs_brand, p_cvs_store_id, p_cvs_store_name, p_cvs_store_address,
    p_receiver_address, p_special_request
  ) returning * into v_order;

  insert into public.shop_order_items (
    order_id, product_id, name, unit_price, quantity, temperature
  )
  select
    v_order.id, p.id, p.name,
    greatest(p.price - coalesce(p.discount, 0), 0),
    x.quantity, p.temperature
  from jsonb_to_recordset(p_items) as x(product_id bigint, quantity int)
  join public.products p on p.id = x.product_id;

  -- 扣庫存（stock is null 代表不限量，不扣）
  update public.products p
  set stock = p.stock - x.quantity
  from jsonb_to_recordset(p_items) as x(product_id bigint, quantity int)
  where p.id = x.product_id and p.stock is not null;

  return v_order;
end;
$$;

grant execute on function public.create_shop_order(
  bigint, text, text, text, text, text, jsonb,
  text, text, text, text, text, text, text
) to authenticated;

-- ============================================================
-- 6. RPC: cancel_shop_order（未出貨才可取消，並歸還庫存）
-- ============================================================
create or replace function public.cancel_shop_order(p_order_id bigint)
returns public.shop_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.shop_orders;
begin
  select * into v_order from public.shop_orders where id = p_order_id for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;
  if v_order.status = 'cancelled' then
    return v_order;
  end if;
  if v_order.status in ('shipped', 'arrived', 'picked_up') then
    raise exception 'ALREADY_SHIPPED';
  end if;

  update public.products p
  set stock = p.stock + i.quantity
  from public.shop_order_items i
  where i.order_id = p_order_id
    and p.id = i.product_id
    and p.stock is not null;

  update public.shop_orders
    set status = 'cancelled'
    where id = p_order_id
    returning * into v_order;

  return v_order;
end;
$$;

grant execute on function public.cancel_shop_order(bigint) to authenticated;

-- ============================================================
-- 7. Storage bucket + policies for product images
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read product-images" on storage.objects;
create policy "Public read product-images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Admins write product-images" on storage.objects;
create policy "Admins write product-images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins update product-images" on storage.objects;
create policy "Admins update product-images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins delete product-images" on storage.objects;
create policy "Admins delete product-images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

notify pgrst, 'reload schema';
