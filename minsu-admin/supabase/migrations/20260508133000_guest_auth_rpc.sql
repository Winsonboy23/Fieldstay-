create extension if not exists pgcrypto with schema extensions;

create or replace function public.get_guest_by_email(p_email text)
returns table (
  id bigint,
  created_at timestamptz,
  "fullName" text,
  email text,
  "nationalID" text,
  nationality text,
  "countryFlag" text,
  occupation text
)
language sql
security definer
set search_path = public
as $$
  select
    g.id,
    g.created_at,
    g."fullName",
    g.email,
    g."nationalID",
    g.nationality,
    g."countryFlag",
    g.occupation
  from public.guests as g
  where lower(g.email) = lower(p_email)
  limit 1;
$$;

create or replace function public.ensure_guest(p_full_name text, p_email text)
returns table (
  id bigint,
  "fullName" text,
  email text
)
language sql
security definer
set search_path = public
as $$
  insert into public.guests ("fullName", email)
  values (p_full_name, lower(p_email))
  on conflict (email) do update
    set "fullName" = coalesce(public.guests."fullName", excluded."fullName")
  returning public.guests.id, public.guests."fullName", public.guests.email;
$$;

create or replace function public.register_guest(
  p_full_name text,
  p_email text,
  p_password text
)
returns table (
  id bigint,
  "fullName" text,
  email text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if length(trim(p_full_name)) = 0 or length(trim(p_email)) = 0 then
    raise exception 'missing_fields';
  end if;

  if length(p_password) < 8 then
    raise exception 'password_too_short';
  end if;

  return query
  insert into public.guests ("fullName", email, password_hash)
  values (
    trim(p_full_name),
    lower(trim(p_email)),
    extensions.crypt(p_password, extensions.gen_salt('bf'))
  )
  returning public.guests.id, public.guests."fullName", public.guests.email;
exception
  when unique_violation then
    raise exception 'email_exists';
end;
$$;

create or replace function public.authenticate_guest(
  p_email text,
  p_password text
)
returns table (
  id bigint,
  "fullName" text,
  email text
)
language sql
security definer
set search_path = public, extensions
as $$
  select g.id, g."fullName", g.email
  from public.guests as g
  where lower(g.email) = lower(trim(p_email))
    and g.password_hash is not null
    and g.password_hash = extensions.crypt(p_password, g.password_hash)
  limit 1;
$$;

grant execute on function public.get_guest_by_email(text) to anon, authenticated;
grant execute on function public.ensure_guest(text, text) to anon, authenticated;
grant execute on function public.register_guest(text, text, text) to anon, authenticated;
grant execute on function public.authenticate_guest(text, text) to anon, authenticated;
