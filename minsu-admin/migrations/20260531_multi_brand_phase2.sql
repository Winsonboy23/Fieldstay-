-- =============================================
-- Multi-brand Phase 2: Backfill + 鎖緊 schema
--
-- 1. 把既有資料全部設成 brand_id = 1 (fieldstay)
-- 2. brand_id 改 NOT NULL
-- 3. guests email unique 改成 (email, brand_id) 複合
-- 4. settings 每個 brand 只能有一筆
-- 5. 加 index 加速 brand 過濾
--
-- 前提：執行此檔前，請確認 brands 表的 fieldstay id = 1
--      SELECT id FROM brands WHERE slug = 'fieldstay';
-- =============================================

-- ===== 1. Backfill 既有資料 =====
UPDATE rooms            SET brand_id = 1 WHERE brand_id IS NULL;
UPDATE guests           SET brand_id = 1 WHERE brand_id IS NULL;
UPDATE bookings         SET brand_id = 1 WHERE brand_id IS NULL;
UPDATE settings         SET brand_id = 1 WHERE brand_id IS NULL;
UPDATE activities       SET brand_id = 1 WHERE brand_id IS NULL;
UPDATE activity_signups SET brand_id = 1 WHERE brand_id IS NULL;

-- ===== 2. 改 NOT NULL =====
ALTER TABLE rooms            ALTER COLUMN brand_id SET NOT NULL;
ALTER TABLE guests           ALTER COLUMN brand_id SET NOT NULL;
ALTER TABLE bookings         ALTER COLUMN brand_id SET NOT NULL;
ALTER TABLE settings         ALTER COLUMN brand_id SET NOT NULL;
ALTER TABLE activities       ALTER COLUMN brand_id SET NOT NULL;
ALTER TABLE activity_signups ALTER COLUMN brand_id SET NOT NULL;

-- ===== 3. guests: email 從全站 unique → 每品牌內 unique =====
-- 同一個 email 在不同品牌可以是不同的 guest
ALTER TABLE guests DROP CONSTRAINT IF EXISTS guests_email_key;
ALTER TABLE guests ADD CONSTRAINT guests_email_brand_unique UNIQUE (email, brand_id);

-- ===== 4. settings: 每個 brand 只能有一筆 =====
ALTER TABLE settings ADD CONSTRAINT settings_brand_unique UNIQUE (brand_id);

-- ===== 5. 加 index（高頻 brand_id 過濾的表）=====
CREATE INDEX IF NOT EXISTS idx_rooms_brand            ON rooms(brand_id);
CREATE INDEX IF NOT EXISTS idx_guests_brand           ON guests(brand_id);
CREATE INDEX IF NOT EXISTS idx_bookings_brand         ON bookings(brand_id);
CREATE INDEX IF NOT EXISTS idx_activities_brand       ON activities(brand_id);
CREATE INDEX IF NOT EXISTS idx_activity_signups_brand ON activity_signups(brand_id);
