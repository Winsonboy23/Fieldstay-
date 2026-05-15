-- WARNING: storing plaintext password for admin visibility — demo only.
-- Login still uses password_hash (bcrypt). password_visible is admin-only display.

alter table public.guests
  add column if not exists password_visible text;

create or replace function public.admin_create_guest(
  p_full_name text,
  p_email text,
  p_phone text,
  p_password text
)
returns table (
  id bigint,
  "fullName" text,
  email text,
  phone text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if length(coalesce(trim(p_full_name), '')) = 0
     or length(coalesce(trim(p_email), '')) = 0
     or length(coalesce(trim(p_phone), '')) = 0 then
    raise exception 'missing_fields';
  end if;

  if length(p_password) < 8 then
    raise exception 'password_too_short';
  end if;

  return query
  insert into public.guests ("fullName", email, phone, password_hash, password_visible)
  values (
    trim(p_full_name),
    lower(trim(p_email)),
    trim(p_phone),
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    p_password
  )
  returning public.guests.id, public.guests."fullName", public.guests.email, public.guests.phone;
exception
  when unique_violation then
    raise exception 'email_exists';
end;
$$;

create or replace function public.admin_set_guest_password(
  p_id bigint,
  p_password text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if length(p_password) < 8 then
    raise exception 'password_too_short';
  end if;

  update public.guests
  set password_hash = extensions.crypt(p_password, extensions.gen_salt('bf')),
      password_visible = p_password
  where id = p_id;
end;
$$;
