-- =============================================
-- 民宿預約系統 Supabase Schema
-- 在 Supabase > SQL Editor 執行此檔案
-- =============================================

-- 1. rooms 房型表
CREATE TABLE rooms (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  maxCapacity int NOT NULL,
  regularPrice numeric NOT NULL,
  discount numeric DEFAULT 0,
  description text,
  image text
);

-- 2. guests 住客表
CREATE TABLE guests (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  fullName text NOT NULL,
  email text UNIQUE NOT NULL,
  nationalID text,
  nationality text,
  countryFlag text
);

-- 3. bookings 訂房表
CREATE TABLE bookings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  startDate date NOT NULL,
  endDate date NOT NULL,
  numNights int NOT NULL,
  numGuests int NOT NULL,
  totalPrice numeric NOT NULL,
  extrasPrice numeric DEFAULT 0,
  status text DEFAULT 'unconfirmed',
  hasBreakfast boolean DEFAULT false,
  isPaid boolean DEFAULT false,
  observations text,
  roomId bigint REFERENCES rooms(id) ON DELETE SET NULL,
  guestId bigint REFERENCES guests(id) ON DELETE SET NULL
);

-- 4. settings 系統設定表（只有一筆資料）
CREATE TABLE settings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  minBookingLength int DEFAULT 1,
  maxBookingLength int DEFAULT 30,
  maxGuestsPerBooking int DEFAULT 10,
  breakfastPrice numeric DEFAULT 300
);

-- 插入預設設定
INSERT INTO settings (minBookingLength, maxBookingLength, maxGuestsPerBooking, breakfastPrice)
VALUES (1, 30, 10, 300);

-- =============================================
-- RLS (Row Level Security) 政策
-- =============================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 只允許登入用戶操作（後台員工）
CREATE POLICY "Allow auth users all" ON rooms FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow auth users all" ON guests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow auth users all" ON bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow auth users all" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- 種子資料：示範房型
-- =============================================

INSERT INTO rooms (name, maxCapacity, regularPrice, discount, description, image) VALUES
('山景雙人房', 2, 2800, 0, '坐擁窗外山嵐雲霧，以台灣檜木打造的溫馨雙人房，附設獨立衛浴與私人陽台，適合情侶或夫妻入住。', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80'),
('海景四人房', 4, 4500, 500, '面向太平洋的寬敞四人房，擁有 270 度無敵海景，設有親子空間與雙衛浴，最適合家庭出遊。', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'),
('溫泉豪華套房', 2, 6800, 800, '附設私人戶外溫泉湯池，碳酸氫鈉泉質，美肌效果極佳。房內備有投影設備與高級備品。', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80'),
('森林木屋', 6, 8500, 1000, '獨立木屋設計，隱身於百年老樹林間，設有客廳、廚房與三間臥室，適合家族或朋友包棟。', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'),
('精緻單人房', 1, 1800, 0, '旅行者的溫暖港灣，麻雀雖小五臟俱全，提供舒適床鋪、高速 WiFi 與免費早餐。', 'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=800&q=80'),
('觀星閣樓套房', 2, 5200, 200, '特殊天窗設計，躺在床上即可仰望星空。配備天文望遠鏡，每晚提供導星服務。', 'https://images.unsplash.com/photo-1501117716987-c8c394bb29df?w=800&q=80');
