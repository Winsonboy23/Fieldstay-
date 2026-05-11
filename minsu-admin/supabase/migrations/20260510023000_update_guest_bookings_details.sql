drop function if exists public.get_guest_bookings(bigint);

create or replace function public.get_guest_bookings(p_guest_id bigint)
returns table (
  id bigint,
  created_at timestamptz,
  "startDate" date,
  "endDate" date,
  "numNights" integer,
  "numGuests" integer,
  "roomPrice" numeric,
  "extrasPrice" numeric,
  "totalPrice" numeric,
  "guestId" bigint,
  "roomId" bigint,
  observations text,
  status text,
  "isPaid" boolean,
  rooms jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    b.id,
    b.created_at,
    b."startDate",
    b."endDate",
    b."numNights",
    b."numGuests",
    b."roomPrice",
    b."extrasPrice",
    b."totalPrice",
    b."guestId",
    b."roomId",
    b.observations,
    b.status,
    b."isPaid",
    jsonb_build_object(
      'name', r.name,
      'image', r.image
    ) as rooms
  from public.bookings b
  left join public.rooms r on r.id = b."roomId"
  where b."guestId" = p_guest_id
  order by b."startDate" desc;
$$;

grant execute on function public.get_guest_bookings(bigint) to anon, authenticated;

notify pgrst, 'reload schema';
