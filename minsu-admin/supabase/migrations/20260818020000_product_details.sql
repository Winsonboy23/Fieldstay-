-- ============================================================
-- 商品詳情欄位（方案一）：特色條列、規格資訊、購買須知
-- 全部選填，留空則前台不顯示對應區塊
-- ============================================================
alter table public.products
  add column if not exists features text[] default '{}'::text[],   -- 商品特色（條列）
  add column if not exists notes text[] default '{}'::text[],      -- 購買須知（條列）
  add column if not exists spec_content text,                      -- 內容量／規格，例：600ml / 玻璃瓶
  add column if not exists spec_origin text,                       -- 產地
  add column if not exists spec_ingredients text,                  -- 成分
  add column if not exists spec_shelf_life text,                   -- 保存期限
  add column if not exists spec_storage text;                      -- 保存方式

notify pgrst, 'reload schema';
