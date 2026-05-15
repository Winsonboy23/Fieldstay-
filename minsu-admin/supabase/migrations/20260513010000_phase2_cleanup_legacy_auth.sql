-- Phase 2: drop legacy auth (replaced by Supabase Auth).
-- Frontend register/login already use supabase.auth.signUp / signInWithPassword.
-- Admin "新增顧客" no longer creates auth.users; new customers self-register on frontend
-- and get matched to admin-created guests row via email.

-- Drop legacy auth RPCs.
drop function if exists public.register_guest(text, text, text);
drop function if exists public.authenticate_guest(text, text);
drop function if exists public.admin_set_guest_password(bigint, text);

-- Modify admin_create_guest: no longer takes password.
drop function if exists public.admin_create_guest(text, text, text, text);

create or replace function public.admin_create_guest(
  p_full_name text,
  p_email text,
  p_phone text
)
returns table (
  id bigint,
  "fullName" text,
  email text,
  phone text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if length(coalesce(trim(p_full_name), '')) = 0
     or length(coalesce(trim(p_email), '')) = 0
     or length(coalesce(trim(p_phone), '')) = 0 then
    raise exception 'missing_fields';
  end if;

  return query
  insert into public.guests ("fullName", email, phone)
  values (trim(p_full_name), lower(trim(p_email)), trim(p_phone))
  returning public.guests.id, public.guests."fullName", public.guests.email, public.guests.phone;
exception
  when unique_violation then
    raise exception 'email_exists';
end;
$$;

grant execute on function public.admin_create_guest(text, text, text) to authenticated;

-- Drop password_hash column (no longer needed; passwords live in auth.users now).
alter table public.guests drop column if exists password_hash;
