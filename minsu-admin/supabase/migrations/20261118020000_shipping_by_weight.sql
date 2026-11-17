-- ============================================================
-- 商城運費改版：重量分箱 + 常溫／低溫兩溫層
--
-- 規則（與前台 minsu-frontend/app/_lib/product-utils.js 的試算必須一致，
-- 這支 RPC 才是最終計價依據）：
--
--   商品溫層（products.temperature）
--     normal = 只能常溫　cold = 必須低溫（冷藏／冷凍）　flex = 兩種都可以
--     舊值 chilled / frozen 一律視為 cold。
--
--   訂單溫層：購物車只要有一件「必須低溫」的商品，整筆就是 cold，否則 normal。
--     例外：購物車裡有「兩種都可以」的商品時，客人可以自己選擇整筆走低溫
--     （p_prefer_cold = true）。
--
--   配送方式
--     cold   → 只能宅配（黑貓低溫）
--     normal → 超商取貨或宅配；總重超過該超商限重就不能選超商
--
--   運費
--     超商取貨：一件一份運費，滿免運門檻則免運
--     宅配　　：箱數 = 無條件進位(總重 / 每箱重量上限)，至少 1 箱
--               每滿一次免運門檻抵 1 箱
--               運費 = max(箱數 − 抵掉的箱數, 0) × 每箱運費
--     例（每箱 20kg、門檻 2000）：22kg 買 2000 → 2 箱抵 1 箱，收 1 份；
--                                 22kg 買 4000 → 全免
--
-- 這支 migration「先套用、再部署新程式」是安全的：
--   * 只放寬限制、只新增欄位
--   * 新的下單流程是另一支函式 create_shop_order_v2，
--     舊的 create_shop_order 原封不動，線上舊版前台照常運作
--   * 不改動任何既有商品或訂單資料
-- 新程式上線後的收尾（把舊商品轉成 cold、移除舊函式）在
-- 20261118030000_shipping_cleanup.sql。
-- ============================================================

-- ------------------------------------------------------------
-- 1. 放寬溫層的值域（保留舊值，讓舊資料與舊程式都還合法）
-- ------------------------------------------------------------
do $$
declare
  c record;
begin
  for c in
    select con.conrelid::regclass as tbl, con.conname
    from pg_constraint con
    join pg_attribute att
      on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
    where con.contype = 'c'
      and att.attname = 'temperature'
      and con.conrelid in ('public.products'::regclass, 'public.shop_orders'::regclass)
  loop
    execute format('alter table %s drop constraint %I', c.tbl, c.conname);
  end loop;
end $$;

alter table public.products
  add constraint products_temperature_check
  check (temperature in ('normal', 'cold', 'flex', 'chilled', 'frozen'));

alter table public.shop_orders
  add constraint shop_orders_temperature_check
  check (temperature in ('normal', 'cold', 'chilled', 'frozen'));

-- ------------------------------------------------------------
-- 2. 運費設定
--    低溫宅配的每箱運費與免運門檻沿用原本冷藏的兩欄：
--      ship_fee_chilled_home、free_ship_threshold_chilled
--    常溫的免運門檻沿用 free_ship_threshold_normal（超商、宅配共用）
--    冷凍的三欄（ship_fee_frozen_*、free_ship_threshold_frozen）不再使用，先留著
-- ------------------------------------------------------------
alter table public.settings
  add column if not exists ship_box_weight_g int not null default 20000,          -- 宅配每箱重量上限
  add column if not exists cvs_weight_limit_unimart_g int not null default 10000,  -- 7-ELEVEN 超商取貨限重
  add column if not exists cvs_weight_limit_fami_g int not null default 5000,      -- 全家超商取貨限重
  add column if not exists ship_fee_normal_home int not null default 150;          -- 常溫宅配每箱運費

-- ------------------------------------------------------------
-- 3. 訂單記下當時算出來的總重與箱數（舊訂單為 null）
-- ------------------------------------------------------------
alter table public.shop_orders
  add column if not exists total_weight_g int,
  add column if not exists box_count int;

-- ------------------------------------------------------------
-- 4. 新的下單函式：溫層由伺服器判定，不再由前端傳入
-- ------------------------------------------------------------
create or replace function public.create_shop_order_v2(
  p_guest_id bigint,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_delivery_type text,
  p_items jsonb,                               -- [{variant_id, quantity}]
  p_cvs_brand text default null,
  p_cvs_store_id text default null,
  p_cvs_store_name text default null,
  p_cvs_store_address text default null,
  p_receiver_address text default null,
  p_special_request text default null,
  p_payment_method text default 'bank_transfer',
  p_prefer_cold boolean default false          -- 客人自選低溫（購物車需有 flex 商品）
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
  v_temperature text := 'normal';
  v_has_flex boolean := false;
  v_items_total int := 0;
  v_weight_g int := 0;
  v_boxes int := 1;
  v_free_boxes int := 0;
  v_base_fee int := 0;
  v_shipping_fee int := 0;
  v_threshold int;
  v_box_weight int;
  v_cvs_limit int;
  v_count int;
  v_distinct int;
  v_order_no text;
begin
  if p_delivery_type not in ('cvs', 'home') then
    raise exception 'DELIVERY_INVALID';
  end if;

  if p_delivery_type = 'cvs' then
    if coalesce(p_cvs_brand, '') not in ('UNIMART', 'FAMI') then
      raise exception 'CVS_BRAND_INVALID';
    end if;
    if coalesce(p_cvs_store_id, '') = '' or coalesce(p_cvs_store_name, '') = '' then
      raise exception 'CVS_STORE_REQUIRED';
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

  -- 逐項鎖定規格並驗證，同時累計小計、總重，並判定整筆溫層
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
    if v_variant.stock is not null and v_variant.stock < v_item.quantity then
      raise exception 'OUT_OF_STOCK';
    end if;

    -- 只要有一件必須低溫，整筆就走低溫（chilled / frozen 是舊值）
    if v_product.temperature in ('cold', 'chilled', 'frozen') then
      v_temperature := 'cold';
    elsif v_product.temperature = 'flex' then
      v_has_flex := true;
    end if;

    v_items_total := v_items_total
      + greatest(v_variant.price - coalesce(v_variant.discount, 0), 0) * v_item.quantity;
    -- 沒填重量的規格先當 0 計（後台表單會要求填寫）
    v_weight_g := v_weight_g + coalesce(v_variant.weight_g, 0) * v_item.quantity;
  end loop;

  -- 客人自選低溫：購物車裡要有「兩種都可以」的商品才成立
  if v_temperature <> 'cold' and coalesce(p_prefer_cold, false) then
    if not v_has_flex then
      raise exception 'COLD_NOT_AVAILABLE';
    end if;
    v_temperature := 'cold';
  end if;

  select * into v_settings from public.settings where id = 1;

  -- 低溫只能宅配
  if v_temperature = 'cold' and p_delivery_type <> 'home' then
    raise exception 'COLD_REQUIRES_HOME';
  end if;

  if p_delivery_type = 'cvs' then
    -- 超商取貨：超過該超商限重就不能選
    v_cvs_limit := case
      when p_cvs_brand = 'UNIMART' then coalesce(v_settings.cvs_weight_limit_unimart_g, 10000)
      else coalesce(v_settings.cvs_weight_limit_fami_g, 5000)
    end;
    if v_weight_g > v_cvs_limit then
      raise exception 'CVS_OVERWEIGHT';
    end if;
    v_boxes := 1;
    v_base_fee := coalesce(v_settings.ship_fee_normal, 0);
    v_threshold := v_settings.free_ship_threshold_normal;
  else
    v_box_weight := coalesce(nullif(v_settings.ship_box_weight_g, 0), 20000);
    v_boxes := greatest(ceil(v_weight_g::numeric / v_box_weight)::int, 1);
    if v_temperature = 'cold' then
      v_base_fee := coalesce(v_settings.ship_fee_chilled_home, 0);
      v_threshold := v_settings.free_ship_threshold_chilled;
    else
      v_base_fee := coalesce(v_settings.ship_fee_normal_home, 0);
      v_threshold := v_settings.free_ship_threshold_normal;
    end if;
  end if;

  -- 每滿一次免運門檻抵 1 箱運費；沒設門檻（null 或 0）就不免運
  if v_threshold is not null and v_threshold > 0 then
    v_free_boxes := floor(v_items_total::numeric / v_threshold)::int;
  end if;
  v_shipping_fee := greatest(v_boxes - v_free_boxes, 0) * v_base_fee;

  v_order_no := 'SP'
    || to_char(timezone('Asia/Taipei', now()), 'YYMMDD')
    || lpad(nextval('public.shop_order_no_seq')::text, 4, '0');

  insert into public.shop_orders (
    order_no, guest_id, temperature,
    items_total, shipping_fee, total_price, payment_method,
    contact_name, contact_email, contact_phone,
    delivery_type, cvs_brand, cvs_store_id, cvs_store_name, cvs_store_address,
    receiver_address, special_request,
    total_weight_g, box_count
  ) values (
    v_order_no, p_guest_id, v_temperature,
    v_items_total, v_shipping_fee, v_items_total + v_shipping_fee, p_payment_method,
    p_contact_name, p_contact_email, p_contact_phone,
    p_delivery_type,
    case when p_delivery_type = 'cvs' then p_cvs_brand end,
    case when p_delivery_type = 'cvs' then p_cvs_store_id end,
    case when p_delivery_type = 'cvs' then p_cvs_store_name end,
    case when p_delivery_type = 'cvs' then p_cvs_store_address end,
    case when p_delivery_type = 'home' then p_receiver_address end,
    p_special_request,
    v_weight_g, v_boxes
  ) returning * into v_order;

  -- 品項快照的溫層記的是整筆訂單實際寄送的溫層
  insert into public.shop_order_items (
    order_id, product_id, variant_id, name, variant_name,
    unit_price, quantity, temperature
  )
  select
    v_order.id, p.id, v.id, p.name, v.name,
    greatest(v.price - coalesce(v.discount, 0), 0),
    x.quantity, v_temperature
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

grant execute on function public.create_shop_order_v2(
  bigint, text, text, text, text, jsonb,
  text, text, text, text, text, text, text, boolean
) to authenticated;

notify pgrst, 'reload schema';
