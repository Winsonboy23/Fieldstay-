-- ============================================================
-- 首頁區塊排序／顯示，與首頁選物商店的精選商品
--
-- home_blocks：首頁區塊的順序與是否顯示（主視覺 banner 固定置頂，不在此列）
--   例：[{"key":"about","visible":true},{"key":"rooms","visible":true},
--        {"key":"experience","visible":true},{"key":"shop","visible":true},
--        {"key":"transport","visible":true}]
--   null = 預設順序、全部顯示（前台會自動補上缺的區塊）
--
-- home_featured_product_ids：首頁選物商店區塊要顯示的商品，依陣列順序排列
--   空陣列 = 沿用舊行為（商品列表前 3 個）
--
-- 兩欄都是純新增、可為空，舊版前台／後台不會讀到也不受影響。
-- ============================================================
alter table public.settings
  add column if not exists home_blocks jsonb,
  add column if not exists home_featured_product_ids bigint[] not null default '{}'::bigint[];

notify pgrst, 'reload schema';
