-- ============================================================
-- 商城溫層修正：冷藏、冷凍分開，每個商品自己設定「可以用哪些溫層寄送」
--
-- 規則（與前台 minsu-frontend/app/_lib/product-utils.js 的試算必須一致，
-- 這裡的 RPC 才是最終計價依據）：
--
--   商品：products.ship_temps 記這個商品可以用哪些溫層寄送，可複選
--         normal 常溫／chilled 冷藏／frozen 冷凍
--         例：只能冷凍 = {frozen}；冷藏、冷凍都可以 = {chilled,frozen}
--
--   訂單：一張訂單只有一個溫層，裡面每個商品都必須能用這個溫層寄送。
--         購物車裡沒有共同溫層的商品，由前台分成多張訂單一起結帳
--         （create_shop_orders_v3 一次建立，任何一張失敗就全部不成立）。
--
--   配送方式
--     normal  → 超商取貨（7-ELEVEN／全家）或宅配
--     chilled → 只能黑貓冷藏宅配
--     frozen  → 全家冷凍取貨，或黑貓冷凍宅配
--     超商取貨的總重超過該超商限重就不能選。
--
--   運費
--     超商取貨：一件一份運費，滿免運門檻則免運
--     宅配　　：箱數 = 無條件進位(總重 / 每箱重量上限)，至少 1 箱
--               每滿一次免運門檻抵 1 箱，運費 = max(箱數 − 抵掉的箱數, 0) × 每箱運費
--     免運門檻三個溫層各自一個（free_ship_threshold_normal / _chilled / _frozen）。
--
-- 這支 migration「先套用、再部署新程式」是安全的：
--   * 只新增欄位與函式；products.temperature 與 create_shop_order_v2 都原封不動，
--     線上現行版本照常運作
--   * 新版後台存商品時會一併寫回 products.temperature，舊欄位不會變成髒資料
-- ============================================================

-- ------------------------------------------------------------
-- 1. 商品可寄送的溫層
-- ------------------------------------------------------------
alter table public.products
  add column if not exists ship_temps text[] not null default array['normal']::text[];

-- 由現有的 temperature 帶入。
-- 上一版收尾時把冷藏、冷凍都改成了 cold，這裡依改版前的紀錄還原：
--   原本冷凍：13 冷凍芋頭塊、24–26 巴斯克、27 芋頭米粉鹹派
--   原本冷藏：28、29 米戚風蛋糕
-- 只還原目前仍是 cold 的商品；其餘 cold 商品先當成冷藏、冷凍都可以。
update public.products
set ship_temps = case
  when temperature = 'cold' and id in (13, 24, 25, 26, 27) then array['frozen']
  when temperature = 'cold' and id in (28, 29) then array['chilled']
  when temperature = 'cold' then array['chilled', 'frozen']
  when temperature = 'chilled' then array['chilled']
  when temperature = 'frozen' then array['frozen']
  when temperature = 'flex' then array['normal', 'chilled', 'frozen']
  else array['normal']
end;

alter table public.products
  drop constraint if exists products_ship_temps_check;
alter table public.products
  add constraint products_ship_temps_check
  check (
    cardinality(ship_temps) >= 1
    and ship_temps <@ array['normal', 'chilled', 'frozen']::text[]
  );

-- ------------------------------------------------------------
-- 2. 運費設定
--    冷藏：沿用 ship_fee_chilled_home、free_ship_threshold_chilled
--    冷凍：全家冷凍取貨沿用 ship_fee_frozen_fami，免運門檻沿用 free_ship_threshold_frozen
--          新增黑貓冷凍宅配每箱運費、全家冷凍取貨限重
-- ------------------------------------------------------------
alter table public.settings
  add column if not exists ship_fee_frozen_home int not null default 180,            -- 黑貓冷凍宅配每箱運費
  add column if not exists cvs_weight_limit_fami_frozen_g int not null default 10000; -- 全家冷凍取貨限重

-- ------------------------------------------------------------
-- 3. 建立單張訂單：溫層由前台指定，這裡逐項驗證商品是否允許
-- ------------------------------------------------------------
create or replace function public.create_shop_order_v3(
  p_guest_id bigint,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_temperature text,                          -- normal / chilled / frozen
  p_delivery_type text,                        -- cvs / home
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
  if p_temperature is null or p_temperature not in ('normal', 'chilled', 'frozen') then
    raise exception 'TEMP_INVALID';
  end if;
  if p_delivery_type is null or p_delivery_type not in ('cvs', 'home') then
    raise exception 'DELIVERY_INVALID';
  end if;

  if p_delivery_type = 'cvs' then
    -- 冷藏沒有超商取貨；冷凍只有全家
    if p_temperature = 'chilled' then
      raise exception 'CHILLED_REQUIRES_HOME';
    end if;
    if coalesce(p_cvs_brand, '') not in ('UNIMART', 'FAMI') then
      raise exception 'CVS_BRAND_INVALID';
    end if;
    if p_temperature = 'frozen' and p_cvs_brand <> 'FAMI' then
      raise exception 'FROZEN_CVS_FAMI_ONLY';
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

  -- 逐項鎖定規格並驗證，同時累計小計與總重
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

    -- 這個商品不能用這張訂單的溫層寄送
    if not (p_temperature = any (v_product.ship_temps)) then
      raise exception 'TEMP_NOT_ALLOWED';
    end if;

    v_items_total := v_items_total
      + greatest(v_variant.price - coalesce(v_variant.discount, 0), 0) * v_item.quantity;
    -- 沒填重量的規格先當 0 計（後台表單會要求填寫）
    v_weight_g := v_weight_g + coalesce(v_variant.weight_g, 0) * v_item.quantity;
  end loop;

  select * into v_settings from public.settings where id = 1;

  if p_delivery_type = 'cvs' then
    -- 超商取貨：超過該超商限重就不能選
    v_cvs_limit := case
      when p_temperature = 'frozen' then coalesce(v_settings.cvs_weight_limit_fami_frozen_g, 10000)
      when p_cvs_brand = 'UNIMART' then coalesce(v_settings.cvs_weight_limit_unimart_g, 10000)
      else coalesce(v_settings.cvs_weight_limit_fami_g, 5000)
    end;
    if v_weight_g > v_cvs_limit then
      raise exception 'CVS_OVERWEIGHT';
    end if;
    v_boxes := 1;
    v_base_fee := case
      when p_temperature = 'frozen' then coalesce(v_settings.ship_fee_frozen_fami, 0)
      else coalesce(v_settings.ship_fee_normal, 0)
    end;
  else
    v_box_weight := coalesce(nullif(v_settings.ship_box_weight_g, 0), 20000);
    v_boxes := greatest(ceil(v_weight_g::numeric / v_box_weight)::int, 1);
    v_base_fee := case p_temperature
      when 'frozen' then coalesce(v_settings.ship_fee_frozen_home, 0)
      when 'chilled' then coalesce(v_settings.ship_fee_chilled_home, 0)
      else coalesce(v_settings.ship_fee_normal_home, 0)
    end;
  end if;

  v_threshold := case p_temperature
    when 'frozen' then v_settings.free_ship_threshold_frozen
    when 'chilled' then v_settings.free_ship_threshold_chilled
    else v_settings.free_ship_threshold_normal
  end;

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
    v_order_no, p_guest_id, p_temperature,
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

  -- 品項快照的溫層記的是這張訂單實際寄送的溫層
  insert into public.shop_order_items (
    order_id, product_id, variant_id, name, variant_name,
    unit_price, quantity, temperature
  )
  select
    v_order.id, p.id, v.id, p.name, v.name,
    greatest(v.price - coalesce(v.discount, 0), 0),
    x.quantity, p_temperature
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

-- ------------------------------------------------------------
-- 4. 一次結多張訂單：全部成功才成立，任何一張失敗就整批退回
--    p_orders: [{temperature, delivery_type, items, cvs_brand, cvs_store_id,
--                cvs_store_name, cvs_store_address, receiver_address, special_request}]
-- ------------------------------------------------------------
create or replace function public.create_shop_orders_v3(
  p_guest_id bigint,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_orders jsonb,
  p_payment_method text default 'bank_transfer'
)
returns setof public.shop_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entry jsonb;
  v_count int;
begin
  if p_orders is null or jsonb_typeof(p_orders) <> 'array' then
    raise exception 'EMPTY_CART';
  end if;
  v_count := jsonb_array_length(p_orders);
  if v_count = 0 then
    raise exception 'EMPTY_CART';
  end if;
  -- 溫層只有三種，一次最多就是三張
  if v_count > 3 then
    raise exception 'TOO_MANY_ORDERS';
  end if;

  for v_entry in select * from jsonb_array_elements(p_orders)
  loop
    return next public.create_shop_order_v3(
      p_guest_id,
      p_contact_name,
      p_contact_email,
      p_contact_phone,
      v_entry->>'temperature',
      v_entry->>'delivery_type',
      v_entry->'items',
      v_entry->>'cvs_brand',
      v_entry->>'cvs_store_id',
      v_entry->>'cvs_store_name',
      v_entry->>'cvs_store_address',
      v_entry->>'receiver_address',
      v_entry->>'special_request',
      p_payment_method
    );
  end loop;

  return;
end;
$$;

grant execute on function public.create_shop_order_v3(
  bigint, text, text, text, text, text, jsonb,
  text, text, text, text, text, text, text
) to authenticated;

grant execute on function public.create_shop_orders_v3(
  bigint, text, text, text, jsonb, text
) to authenticated;

notify pgrst, 'reload schema';
