-- Phase 3: lock down RLS.
-- Threat model: anyone can read SUPABASE_KEY (anon) from the frontend JS bundle.
-- Without proper RLS, that key gives full read/write on any table.
-- After this migration: anon can only read public catalog (rooms, settings).
-- Admin app authenticates via Supabase Auth; RLS recognises admins via the
-- admin_users table.

-- ============================================================
-- 1. admin_users table (DB-driven admin whitelist)
-- ============================================================
create table if not exists public.admin_users (
  id bigserial primary key,
  email text unique not null,
  role text default 'admin',
  created_at timestamptz default now()
);

-- Seed first admin (idempotent).
insert into public.admin_users (email, role)
values ('winsonboy23@gmail.com', 'admin')
on conflict (email) do nothing;

alter table public.admin_users enable row level security;

-- Only admins can manage admin_users.
drop policy if exists "Admins manage admin_users" on public.admin_users;
create policy "Admins manage admin_users"
  on public.admin_users for all
  to authenticated
  using (
    exists (
      select 1 from public.admin_users a
      where lower(a.email) = lower(auth.jwt() ->> 'email')
    )
  )
  with check (
    exists (
      select 1 from public.admin_users a
      where lower(a.email) = lower(auth.jwt() ->> 'email')
    )
  );

-- ============================================================
-- 2. Helper: is_admin() — returns true if current JWT belongs to an admin
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ============================================================
-- 3. guests table
-- ============================================================
drop policy if exists "Allow auth users all" on public.guests;
drop policy if exists "Admins manage guests" on public.guests;
drop policy if exists "Customers read own guest" on public.guests;
drop policy if exists "Customers update own guest" on public.guests;
drop policy if exists "Customers insert own guest" on public.guests;

create policy "Admins manage guests"
  on public.guests for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Customers read own guest"
  on public.guests for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

create policy "Customers update own guest"
  on public.guests for update to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'))
  with check (lower(email) = lower(auth.jwt() ->> 'email'));

-- ============================================================
-- 4. bookings table
-- ============================================================
drop policy if exists "Allow auth users all" on public.bookings;
drop policy if exists "Admins manage bookings" on public.bookings;
drop policy if exists "Customers read own bookings" on public.bookings;
drop policy if exists "Customers write own bookings" on public.bookings;

create policy "Admins manage bookings"
  on public.bookings for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Customers read own bookings"
  on public.bookings for select to authenticated
  using (
    "guestId" in (
      select id from public.guests
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "Customers write own bookings"
  on public.bookings for insert to authenticated
  with check (
    "guestId" in (
      select id from public.guests
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

-- ============================================================
-- 5. rooms table — anon read OK, only admin writes
-- ============================================================
drop policy if exists "Allow auth users all" on public.rooms;
drop policy if exists "Public read rooms" on public.rooms;
drop policy if exists "Admins write rooms" on public.rooms;
drop policy if exists "Admins update rooms" on public.rooms;
drop policy if exists "Admins delete rooms" on public.rooms;

create policy "Public read rooms"
  on public.rooms for select to anon, authenticated
  using (true);

create policy "Admins write rooms"
  on public.rooms for insert to authenticated
  with check (public.is_admin());

create policy "Admins update rooms"
  on public.rooms for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete rooms"
  on public.rooms for delete to authenticated
  using (public.is_admin());

-- ============================================================
-- 6. settings — anon read OK (frontend needs brand/bank info), only admin writes
-- ============================================================
drop policy if exists "Allow auth users all" on public.settings;
drop policy if exists "Public read settings" on public.settings;
drop policy if exists "Admins write settings" on public.settings;

create policy "Public read settings"
  on public.settings for select to anon, authenticated
  using (true);

create policy "Admins write settings"
  on public.settings for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
