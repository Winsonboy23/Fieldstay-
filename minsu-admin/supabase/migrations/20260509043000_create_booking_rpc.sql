alter table if exists public.bookings add column if not exists "roomPrice" numeric default 0;

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
