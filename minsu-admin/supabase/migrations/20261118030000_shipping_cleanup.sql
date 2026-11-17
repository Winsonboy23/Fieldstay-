-- ============================================================
-- 商城運費改版的收尾 —— 請等「新版前台與後台都部署上線」之後再執行。
--
-- 在那之前執行會讓線上舊版前台壞掉：
--   * 舊版商店頁只認得 normal / chilled / frozen，轉成 cold 的商品會從列表消失
--   * 舊版結帳還在呼叫 create_shop_order
--
-- 新版程式本身不依賴這支 migration（它會把 chilled / frozen 當成 cold 處理），
-- 這裡只是把資料整理乾淨。
-- ============================================================

-- 1. 舊的冷藏、冷凍商品統一改成「必須低溫」
update public.products
set temperature = 'cold'
where temperature in ('chilled', 'frozen');

-- 2. 商品溫層只留新的三個值（舊訂單的 chilled / frozen 保留，不動 shop_orders）
alter table public.products
  drop constraint if exists products_temperature_check;
alter table public.products
  add constraint products_temperature_check
  check (temperature in ('normal', 'cold', 'flex'));

-- 3. 移除舊的下單函式
drop function if exists public.create_shop_order(
  bigint, text, text, text, text, text, jsonb,
  text, text, text, text, text, text, text
);

notify pgrst, 'reload schema';
