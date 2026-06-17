-- =============================================
-- Multi-brand 多品牌支援 Phase 1
-- 1. 新增 brands 主表
-- 2. 既有表加 brand_id (nullable, 先不擋寫入)
-- 3. 插入第一個品牌 fieldstay
--
-- 安全性：此階段完全不影響現有 code，brand_id 全部為 NULL
-- 執行後請跑既有 admin / frontend 確認沒壞
-- =============================================

-- 1. brands 主表
CREATE TABLE IF NOT EXISTS brands (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  slug text UNIQUE NOT NULL,                  -- 內部識別 + fallback subdomain
  name text NOT NULL,                         -- 顯示名稱
  custom_domain text UNIQUE,                  -- 業者自訂網域，可為 NULL
  status text NOT NULL DEFAULT 'active',      -- active | suspended

  -- Email 設定
  email_mode text NOT NULL DEFAULT 'shared',  -- 'shared' | 'custom'
  from_email text,                            -- custom 模式時的寄件信箱
  from_name text,                             -- 顯示寄件人名稱
  reply_to_email text,                        -- 業主接回信信箱

  CONSTRAINT email_mode_check CHECK (email_mode IN ('shared', 'custom')),
  CONSTRAINT status_check CHECK (status IN ('active', 'suspended'))
);

-- 2. 插入既有品牌 fieldstay (假設拿到 id = 1)
-- 如果之後想改名/改 domain/改 email，到 admin 後台或直接 UPDATE
INSERT INTO brands (slug, name, custom_domain, email_mode, from_email, from_name, reply_to_email)
VALUES (
  'fieldstay',
  'FIELDSTAY',
  'www.field-stay.com',
  'custom',
  'noreply@field-stay.com',
  'FIELDSTAY',
  NULL  -- TODO: 跟業主確認後填入 reply-to email，例如 info@field-stay.com
)
ON CONFLICT (slug) DO NOTHING;

-- 3. 既有 6 張表加 brand_id（nullable，Phase 2 backfill 後才會 NOT NULL）
ALTER TABLE rooms            ADD COLUMN IF NOT EXISTS brand_id bigint REFERENCES brands(id) ON DELETE RESTRICT;
ALTER TABLE guests           ADD COLUMN IF NOT EXISTS brand_id bigint REFERENCES brands(id) ON DELETE RESTRICT;
ALTER TABLE bookings         ADD COLUMN IF NOT EXISTS brand_id bigint REFERENCES brands(id) ON DELETE RESTRICT;
ALTER TABLE settings         ADD COLUMN IF NOT EXISTS brand_id bigint REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE activities       ADD COLUMN IF NOT EXISTS brand_id bigint REFERENCES brands(id) ON DELETE RESTRICT;
ALTER TABLE activity_signups ADD COLUMN IF NOT EXISTS brand_id bigint REFERENCES brands(id) ON DELETE RESTRICT;

-- 注意：admin_users 表用途未明，暫不處理
