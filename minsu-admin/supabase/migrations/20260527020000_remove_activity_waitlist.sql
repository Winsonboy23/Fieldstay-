-- 移除活動候補機制：額滿時 RPC 直接 raise 例外，不再產生 waitlist 名額
create or replace function public.create_activity_signup(
  p_activity_id text,
  p_guest_id bigint,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_quantity int default 1,
  p_special_request text default null,
  p_payment_method text default 'transfer'
)
returns public.activity_signups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_activity public.activities;
  v_signup public.activity_signups;
  v_total int;
begin
  select * into v_activity from public.activities where id = p_activity_id for update;
  if v_activity is null then
    raise exception 'ACTIVITY_NOT_FOUND';
  end if;

  if v_activity.registered + p_quantity > v_activity.capacity then
    raise exception 'ACTIVITY_FULL';
  end if;

  update public.activities
    set registered = registered + p_quantity
    where id = p_activity_id;

  v_total := v_activity.price * p_quantity;

  insert into public.activity_signups (
    activity_id, guest_id, contact_name, contact_email, contact_phone,
    quantity, total_price, special_request, payment_method, status
  ) values (
    p_activity_id, p_guest_id, p_contact_name, p_contact_email, p_contact_phone,
    p_quantity, v_total, p_special_request, p_payment_method, 'confirmed'
  ) returning * into v_signup;

  return v_signup;
end;
$$;

-- 將既有的 waitlist 紀錄一律改為 cancelled（沒有候補機制了就不該保留 waitlist 狀態）
update public.activity_signups set status = 'cancelled' where status = 'waitlist';
