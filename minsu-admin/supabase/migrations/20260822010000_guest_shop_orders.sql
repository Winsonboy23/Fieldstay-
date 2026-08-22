-- ============================================================
-- 訪客訂購（guest checkout）
--
-- shop_orders 加 access_token：訪客（guest_id 為 null）下單後，
-- 憑通知信中的連結 /shop/thankyou?orderId=X&token=<access_token>
-- 查看與取消訂單。
--
-- create_shop_order 的 p_guest_id 原本就允許 null、
-- returns public.shop_orders 會自動帶回新欄位，RPC 不需改。
-- ============================================================

alter table public.shop_orders
  add column if not exists access_token uuid not null default gen_random_uuid();

create unique index if not exists idx_shop_orders_access_token
  on public.shop_orders(access_token);

notify pgrst, 'reload schema';
