-- ============================================================
-- brand_id 預設值
--
-- 正式 DB 在 2026-05-31 套用了多品牌 phase 1 + 2（codex/multi-brand-foundation
-- 分支，程式碼沒合併進 main）：6 張表的 brand_id 變成 NOT NULL，但 main 的
-- 程式碼和 DB function 都不會填 brand_id，新增房間／活動／訂房／報名／顧客
-- 都會因 brand_id 為 null 失敗。
--
-- 目前只有一個品牌（fieldstay，id = 1），讓新資料自動歸到 1。
-- 之後真的要做多品牌時，程式碼會明確帶 brand_id，這個預設值不會擋路。
-- ============================================================

alter table public.rooms            alter column brand_id set default 1;
alter table public.guests           alter column brand_id set default 1;
alter table public.bookings         alter column brand_id set default 1;
alter table public.settings         alter column brand_id set default 1;
alter table public.activities       alter column brand_id set default 1;
alter table public.activity_signups alter column brand_id set default 1;

-- phase 2 把 guests 的 email unique 改成 (email, brand_id)，但 ensure_guest 仍用
-- on conflict (email)，找不到對應的 unique 就會失敗。單一品牌下 email 本來就
-- 不重複，補回 email 單欄 unique（原本的 guests_email_key 還在的話這行會略過）。
create unique index if not exists guests_email_key on public.guests (email);
