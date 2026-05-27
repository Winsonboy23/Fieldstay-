-- 取消通知所需的欄位與 RPC

-- 防重複寄送取消信
alter table public.bookings
  add column if not exists cancelled_email_sent_at timestamptz;

alter table public.activity_signups
  add column if not exists cancelled_email_sent_at timestamptz;

-- 取消活動報名 RPC：把 status 改成 cancelled，並還回對應 capacity（registered--）
-- 已是 cancelled 的不會重複扣
create or replace function public.cancel_activity_signup(p_signup_id bigint)
returns public.activity_signups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_signup public.activity_signups;
  v_was_active boolean;
begin
  select * into v_signup
    from public.activity_signups
    where id = p_signup_id
    for update;

  if v_signup is null then
    raise exception 'SIGNUP_NOT_FOUND';
  end if;

  v_was_active := v_signup.status <> 'cancelled';

  if v_was_active then
    update public.activity_signups
      set status = 'cancelled'
      where id = p_signup_id
      returning * into v_signup;

    -- 還回名額；防止 registered 變負數
    update public.activities
      set registered = greatest(0, registered - v_signup.quantity)
      where id = v_signup.activity_id;
  end if;

  return v_signup;
end;
$$;

grant execute on function public.cancel_activity_signup(bigint) to authenticated, anon;
