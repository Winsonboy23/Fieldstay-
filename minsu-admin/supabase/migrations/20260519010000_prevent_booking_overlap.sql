-- =============================================================
-- 防止房間訂單時段重疊（防超賣 / 雙重訂房）
-- 兩層防線：
-- 1) RPC create_guest_booking 內做 application-level 重疊檢查（fast fail + 友善 exception）
-- 2) bookings 表加 exclusion constraint（最後防線，擋住 race condition 與所有繞過 RPC 的 insert/update）
--
-- 使用半開區間 [startDate, endDate)：同一天既 check-out 又 check-in 的情境不算衝突。
-- 已取消的訂單 (status = 'cancelled') 不視為佔用。
--
-- 若 DB 內已存在重疊資料，constraint 建立會失敗。請先清理重複後再執行。
-- =============================================================

create extension if not exists btree_gist;

-- 1) DB-level exclusion constraint
alter table public.bookings
  drop constraint if exists bookings_no_overlap;

alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    "roomId" with =,
    daterange("startDate", "endDate", '[)') with &&
  )
  where (status is distinct from 'cancelled');

-- 2) RPC: pre-check + insert
create or replace function public.create_guest_booking(
  p_guest_id bigint,
  p_room_id bigint,
  p_start_date date,
  p_end_date date,
  p_num_nights int,
  p_num_guests int,
  p_room_price numeric,
  p_extras_price numeric,
  p_total_price numeric,
  p_observations text default null
)
returns table (id bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_guest_id is null or p_room_id is null then
    raise exception 'missing_guest_or_room';
  end if;

  if p_start_date is null or p_end_date is null or p_end_date <= p_start_date then
    raise exception 'invalid_dates';
  end if;

  if exists (
    select 1
    from public.bookings
    where "roomId" = p_room_id
      and (status is distinct from 'cancelled')
      and daterange("startDate", "endDate", '[)')
          && daterange(p_start_date, p_end_date, '[)')
  ) then
    raise exception 'booking_overlap';
  end if;

  return query
  insert into public.bookings (
    "startDate",
    "endDate",
    "numNights",
    "numGuests",
    "roomPrice",
    "extrasPrice",
    "totalPrice",
    "guestId",
    "roomId",
    observations,
    "isPaid",
    "hasBreakfast",
    status
  )
  values (
    p_start_date,
    p_end_date,
    p_num_nights,
    p_num_guests,
    p_room_price,
    p_extras_price,
    p_total_price,
    p_guest_id,
    p_room_id,
    p_observations,
    false,
    false,
    'unconfirmed'
  )
  returning bookings.id;
end;
$$;

grant execute on function public.create_guest_booking(bigint, bigint, date, date, int, int, numeric, numeric, numeric, text) to anon, authenticated;
