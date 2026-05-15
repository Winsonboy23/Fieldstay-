-- Drop legacy wide-open policies that override the RLS lockdown.
drop policy if exists "auth_all_guests" on public.guests;
drop policy if exists "auth_all_bookings" on public.bookings;
drop policy if exists "auth_all_rooms" on public.rooms;
drop policy if exists "auth_all_settings" on public.settings;

-- Also drop duplicate-name policies (we now have "Public read rooms" / "Public read settings").
drop policy if exists "Allow public read rooms" on public.rooms;
drop policy if exists "Allow public read settings" on public.settings;
