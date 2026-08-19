-- ============================================================
-- 商品規格（尺寸／容量）
--
-- 價格、折扣、庫存、重量由「商品」層下移到「規格」層，商品層只保留
-- 共用資訊（名稱、描述、圖片、溫層、成分等）。
-- 每個商品至少有一筆規格；只有一筆且 name 為 null 時代表「無規格區分」，
-- 前台不顯示規格選擇器，行為與加規格功能前完全相同。
-- ============================================================

-- ============================================================
-- 1. product_variants
-- ============================================================
create table if not exists public.product_variants (
  id bigserial primary key,
  created_at timestamptz default now(),
  product_id bigint not null references public.products(id) on delete cascade,
  name text,                                  -- 例：600ml、大罐；null = 無規格區分
  price int not null default 0,
  discount int not null default 0,
  stock int,                                  -- null = 不限量；0 = 售完
  weight_g int,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create index if not exists idx_product_variants_product
  on public.product_variants(product_id, sort_order);

alter table public.product_variants enable row level security;

drop policy if exists "Public read product_variants" on public.product_variants;
create policy "Public read product_variants"
  on public.product_variants for select to anon, authenticated
  using (true);

drop policy if exists "Admins write product_variants" on public.product_variants;
create policy "Admins write product_variants"
  on public.product_variants for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins update product_variants" on public.product_variants;
create policy "Admins update product_variants"
  on public.product_variants for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins delete product_variants" on public.product_variants;
create policy "Admins delete product_variants"
  on public.product_variants for delete to authenticated
  using (public.is_admin());

-- ============================================================
-- 2. 既有商品各補一筆規格（name = null 代表無規格區分）
-- ============================================================
insert into public.product_variants (product_id, name, price, discount, stock, weight_g, sort_order)
select p.id, null, p.price, p.discount, p.stock, p.weight_g, 0
from public.products p
where not exists (
  select 1 from public.product_variants v where v.product_id = p.id
);

-- products 的價格/庫存/重量欄位改由規格層管理，保留欄位避免破壞既有部署，
-- 但程式不再讀取，日後確認無誤可再移除。
comment on column public.products.price is 'DEPRECATED：改用 product_variants.price';
comment on column public.products.discount is 'DEPRECATED：改用 product_variants.discount';
comment on column public.products.stock is 'DEPRECATED：改用 product_variants.stock';
comment on column public.products.weight_g is 'DEPRECATED：改用 product_variants.weight_g';

-- ============================================================
-- 3. 訂單明細記錄規格
-- ============================================================
alter table public.shop_order_items
  add column if not exists variant_id bigint references public.product_variants(id) on delete set null,
  add column if not exists variant_name text;

-- ============================================================
-- 4. create_shop_order 改以規格為最小單位
-- ============================================================
create or replace function public.create_shop_order(
  p_guest_id bigint,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_temperature text,
  p_delivery_type text,
  p_items jsonb,                               -- [{variant_id, quantity}]
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
  v_variant public.product_variants;
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

  -- 以規格為 key 判斷重複（同商品不同規格是合法的）
  select count(*), count(distinct x.variant_id) into v_count, v_distinct
  from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb))
    as x(variant_id bigint, quantity int);

  if v_count = 0 then
    raise exception 'EMPTY_CART';
  end if;
  if v_count <> v_distinct then
    raise exception 'DUPLICATE_ITEM';
  end if;

  -- 逐項鎖定規格並驗證，同時累計小計
  for v_item in
    select * from jsonb_to_recordset(p_items) as x(variant_id bigint, quantity int)
  loop
    if coalesce(v_item.quantity, 0) <= 0 then
      raise exception 'QUANTITY_INVALID';
    end if;

    select * into v_variant from public.product_variants
      where id = v_item.variant_id for update;

    if not found then
      raise exception 'PRODUCT_NOT_FOUND';
    end if;
    if v_variant.is_active is not true then
      raise exception 'PRODUCT_INACTIVE';
    end if;

    select * into v_product from public.products where id = v_variant.product_id;
    if not found then
      raise exception 'PRODUCT_NOT_FOUND';
    end if;
    if v_product.is_active is not true then
      raise exception 'PRODUCT_INACTIVE';
    end if;
    if v_product.temperature <> p_temperature then
      raise exception 'TEMP_MISMATCH';
    end if;
    if v_variant.stock is not null and v_variant.stock < v_item.quantity then
      raise exception 'OUT_OF_STOCK';
    end if;

    v_items_total := v_items_total
      + greatest(v_variant.price - coalesce(v_variant.discount, 0), 0) * v_item.quantity;
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
    order_id, product_id, variant_id, name, variant_name,
    unit_price, quantity, temperature
  )
  select
    v_order.id, p.id, v.id, p.name, v.name,
    greatest(v.price - coalesce(v.discount, 0), 0),
    x.quantity, p.temperature
  from jsonb_to_recordset(p_items) as x(variant_id bigint, quantity int)
  join public.product_variants v on v.id = x.variant_id
  join public.products p on p.id = v.product_id;

  -- 扣規格庫存（stock is null 代表不限量，不扣）
  update public.product_variants v
  set stock = v.stock - x.quantity
  from jsonb_to_recordset(p_items) as x(variant_id bigint, quantity int)
  where v.id = x.variant_id and v.stock is not null;

  return v_order;
end;
$$;

grant execute on function public.create_shop_order(
  bigint, text, text, text, text, text, jsonb,
  text, text, text, text, text, text, text
) to authenticated;

-- ============================================================
-- 5. cancel_shop_order 改為歸還規格庫存
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

  update public.product_variants v
  set stock = v.stock + i.quantity
  from public.shop_order_items i
  where i.order_id = p_order_id
    and v.id = i.variant_id
    and v.stock is not null;

  update public.shop_orders
    set status = 'cancelled'
    where id = p_order_id
    returning * into v_order;

  return v_order;
end;
$$;

grant execute on function public.cancel_shop_order(bigint) to authenticated;

notify pgrst, 'reload schema';
