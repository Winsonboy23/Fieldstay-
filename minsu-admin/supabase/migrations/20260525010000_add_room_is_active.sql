-- 房型開放 / 暫停 開關
-- is_active = true  → 前台正常顯示「立即訂房」
-- is_active = false → 前台仍顯示房型卡片，但按鈕變「暫不開放」、不能下訂
alter table public.rooms
  add column if not exists is_active boolean not null default true;
