-- ============================================================
-- 商品描述圖：商品頁下方依序顯示的滿版長圖，可放多張
-- 留空則前台不顯示該區塊
-- ============================================================
alter table public.products
  add column if not exists detail_images text[] default '{}'::text[];

notify pgrst, 'reload schema';
