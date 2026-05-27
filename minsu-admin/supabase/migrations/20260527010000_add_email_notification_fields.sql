-- Email notification 相關欄位
-- 1. 匯款期限（小時） + 入住通用資訊（Wi-Fi、其他注意事項）
alter table public.settings
  add column if not exists payment_deadline_hours int default 48,
  add column if not exists wifi_info text,
  add column if not exists house_notes text;

-- 2. 防重複寄信
alter table public.bookings
  add column if not exists paid_email_sent_at timestamptz;

alter table public.activity_signups
  add column if not exists paid_email_sent_at timestamptz;
