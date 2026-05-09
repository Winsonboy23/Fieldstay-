drop function if exists public.get_guest_by_email(text);

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

grant execute on function public.get_guest_by_email(text) to anon, authenticated;

create or replace function public.update_guest_profile(
  p_email text,
  p_occupation text
)
returns table (
  id bigint,
  occupation text
)
language sql
security definer
set search_path = public
as $$
  update public.guests as g
  set occupation = nullif(trim(p_occupation), '')
  where lower(g.email) = lower(trim(p_email))
  returning g.id, g.occupation;
$$;

grant execute on function public.update_guest_profile(text, text) to anon, authenticated;
