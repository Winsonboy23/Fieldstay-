# Fieldstay 購物功能開發規劃（三溫層＋超商取貨）

> 狀態：**Phase 1–4 已完成**（DB、後台商品管理、運費設定、前台商品頁、購物車、結帳與訂單、**後台訂單管理與全部通知信**；剩 Phase 5 上線前實測）
> 日期：2026-08-18
> 範圍：前台（minsu-frontend）＋後台（minsu-admin）＋共用 Supabase
> 相關文件：[output/reports/Fieldstay_開發任務難度排序.md](../output/reports/Fieldstay_開發任務難度排序.md)（本計畫對應其第 2、3 項，並明確**排除**第 1 項「複合訂單合併付款」）

---

## TL;DR

| 項目 | 結論 |
|---|---|
| 物流 | ✅ **已拍板（2026-08-18）：v1 不申請任何物流帳號，全手動寄件**——常溫至 7-11 ibon（交貨便）或全家 FamiPort（店到店），冷凍限全家 FamiPort（冷凍店到店），皆開放個人現場操作；客人結帳時自行查填門市。**PayNow 立吉富列為升級路徑**（個人身分證可辦、免簽約；屆時補站內地圖選店＋一鍵開單＋貨態回傳，見 §7 升級路徑） |
| 冷藏 | **台灣超商取貨沒有「冷藏」溫層**（只有常溫與冷凍），這是物流業界現實，不是 API 限制。✅ **已拍板**：冷藏走**黑貓低溫宅配**——v1 半自動（系統管訂單與運費，店家自行至黑貓寄件後回填託運單號；API 自動建單列 backlog） |
| 金流 | ✅ **已拍板（2026-08-18）**：不接金流，僅銀行轉帳＋後台確認已收款（與訂房／活動一致） |
| 訂單模型 | 商品訂單**完全獨立**於住宿／活動訂單；**一張訂單＝單一溫層**（常溫／冷凍＝超商取貨、冷藏＝黑貓低溫宅配），購物車依溫層分組結帳 |
| 架構 | 全面複製活動報名（activity_signups）的既有模式：RLS＋security definer RPC、frontend API route、notify email、admin feature 資料夾＋React Query v4 |
| 估時 | 約 **11–15 人天**（單人；全手動物流版） |

---

## 1. 物流方案調查

> ✅ **2026-08-18 拍板：v1 全手動寄件、不串接物流 API**（流程見 §1.6）。以下調查結論保留，作為日後升級 PayNow 的依據。

### 1.1 溫層 × 通路可行性矩陣（核心結論）

| 溫層 | 7-11 超取 | 全家超取 | 宅配 |
|---|---|---|---|
| 常溫 | ✅ 交貨便 C2C（PayNow 66 元/件、≤5kg；綠界也有） | ✅ 店到店 C2C（同左） | ✅ 黑貓／郵局 |
| 冷藏 | ❌ **無此服務** | ❌ **無此服務** | ✅ 黑貓低溫宅配（可經綠界）**← 已採用，v1 人工寄件** |
| 冷凍 | ✅ 冷凍交貨便 C2C（**PayNow 150 元/件**；綠界僅 B2C 大宗寄倉，不適合） | ✅ 冷凍店到店 C2C（**PayNow 190 元/件**；綠界無此服務） | ✅ 黑貓低溫宅配 |

### 1.2 整合商比較

| | PayNow 立吉富 | 綠界 ECPay | PAYUNi 統一金流 |
|---|---|---|---|
| 常溫 C2C | 7-11／全家／萊爾富，66 元 | 7-11／全家／萊爾富／OK | 7-11 |
| 冷凍 C2C | ✅ 7-11（150）＋全家（190） | ❌（7-11 冷凍僅 B2C 寄倉 UNIMARTFREEZE） | ✅ 僅 7-11 |
| 電子地圖選店 | ✅ | ✅ | ✅ |
| 貨態回傳 webhook | ✅ | ✅ | ✅ |
| 申請門檻 | 免簽約免設定費，個人身分證即可 | 會員開通物流 | 會員開通 |
| 使用實績 | WACA、meepShop、CYBERBIZ、ShopStore | 最大宗 | WooCommerce 模組等 |
| 金流（未來擴充） | ✅ 有（信用卡等）＋電子發票 | ✅ 最完整 | ✅ 有 |

**選 PayNow 的理由**：需求是「7-11＋全家、可冷凍」，只有 PayNow 一家全包且是 C2C（民宿自己拿去門市寄，不需大宗進倉）。未來要接金流它也有，不必換商。
**備案**：若最後決定「冷凍不做超取、只做宅配」，則綠界一家即可（常溫超取＋黑貓低溫宅配）。

### 1.3 為什麼不直接串官方 API

- 7-11：物流 API 須與統一資訊／大智通簽 B2C 合約（大宗寄倉、有量體門檻）；電子地圖 `emap.presco.com.tw/c2cemap.ashx` 需要 `eshopid`（開發商代號），實務上由整合商核發，散戶拿不到。
- 全家：同樣需與日翊文化等簽約。
- 7-11「賣貨便」可免串接手動出單（支援冷凍），可當**上線前的人工備援**，但無公開 API，不能自動化。

### 1.4 電子地圖選店流程（升級版才需要）

```
結帳頁選「7-11 / 全家」→ 前台以 form POST 導向 PayNow 電子地圖
→ 消費者在地圖選門市 → PayNow 將門市資訊 POST 回我方 callback URL
→ Next.js route handler 接收（門市代號/名稱/地址）→ 寫回結帳頁（redirect + cookie 或 query）
```

- callback 是**外部 POST 進來**，必須是 server route（規劃為 `app/api/shop/cvs-map/route.js`），純 client 頁面接不到。
- 選店在瀏覽器內完成 redirect，**本機開發可測**；但**貨態回傳 webhook 需要公開網址**（見 A5 的 fallback 設計）。
- 確切參數以申請帳號後 PayNow 提供的串接 PDF 為準（各通路一份：7-11 店到店／全家店到店／7-11 冷凍／全家冷凍）。

### 1.5 冷凍寄件的營運現實（會影響商品企劃）

- 商品須 **-18°C 預冷 24 小時**後才能寄。
- 全家冷凍店到店：**專用紙箱**（S60 28×20×12／S90 38×28×24／S105 45×30×30 cm，≤10kg），託運標籤須**防水材質＋雷射印表機**（或防水袋包裝）；**不可寄**冰淇淋、蛋糕、水餃類。
- （升級版 API 開單後）C2C 物流單建立後 **7 天內**須至門市寄件，逾期作廢；v1 在機台現場開單即寄，無此問題。
- 常溫店到店 ≤5kg。
- 超取商品金額上限約 2 萬元（綠界明文 1–20000，PayNow 以合約為準）。

→ 因此商品表設 `weight_g` 選填欄位，購物車做粗略重量提示（v1 提示即可，不強制擋）。

### 1.6 v1 全手動寄件流程（已採用）

| 環節 | v1 做法 |
|---|---|
| 客人選門市 | 結帳頁選 7-11／全家（冷凍僅全家）→ 提供官方門市查詢連結（7-11 emap.pcsc.com.tw／全家店舖查詢）→ 客人**手動填門市名稱＋店號** |
| 出貨（常溫） | 7-11 門市 ibon「交貨便」或全家 FamiPort「店到店」現場操作，櫃檯付運費，收據上的**寄件單號**回填後台 |
| 出貨（冷凍） | 全家 FamiPort「冷凍店到店」（個人可用；專用紙箱＋預冷要求見 §1.5） |
| 出貨（冷藏） | 黑貓低溫宅配人工寄件（D10） |
| 貨態 | 到店／取貨由超商發簡訊通知收件人；系統不追蹤，後台手動標記完成（A5） |
| 運費成本 | 依門市櫃檯牌價（常溫約 60 上下、全家冷凍 190，偶有促銷）；向客人收的運費在後台手動維護（A6） |

7-11 冷凍交貨便**個人只能走「賣貨便」**（需買家再點連結選店，流程太繞）→ v1 冷凍不開放 7-11，升級 PayNow 後再開（U4）。

---

## 2. 關鍵設計決策

| # | 決策 | 理由 |
|---|---|---|
| D1 | 商品訂單獨立，**不做**與住宿／活動合併結帳 | 難度排序把「複合訂單合併付款」列為極高難度；拆開後本案從「極高」降為可控 |
| D2 | **一張訂單＝單一溫層＋單一配送方式**：常溫走超商取貨（7-11 或全家）、冷凍走超商取貨（**v1 限全家**，§1.6）、冷藏走黑貓低溫宅配；購物車依溫層分組，一次結一組 | 實際物流本來就一單一溫層一包裹；運費／免運門檻依溫層分別計算（符合難度排序 #2 的要求）。「多組一次結帳、自動拆多張訂單」列 v1.5 增強 |
| D3 | 付款僅**轉帳＋後台確認**（`bank_transfer`）——已拍板 | 與 bookings／activity_signups 完全一致，email 模板、後台操作都可複製；不接金流 |
| D4 | v1 **無 API 建單**：確認收款後店家人工寄件，後台「標記出貨」回填寄件單號（全部溫層同一套半自動流程） | 不依賴任何物流帳號即可上線；升級 PayNow 後此步改為一鍵開單（仍維持「收款後才建單」原則） |
| D5 | 運費與免運門檻放 `settings`（後台可調），**下單當下計算並 snapshot 進訂單** | 難度排序 #2 明文要求「下單時保存運費計算結果」 |
| D6 | 庫存用 `products.stock`（null＝不限量），RPC 內 `select … for update` 原子扣減 | 複製 `create_activity_signup` 的 `ACTIVITY_FULL` 模式，錯誤碼 `OUT_OF_STOCK` |
| D7 | （升級版原則）日後串 PayNow 時，後台一律經 frontend 的 `/api/admin/shop/*` route 呼叫，以 **admin 的 Supabase JWT** 驗證（server 端 `auth.getUser()` ＋ `admin_users` 查核）；v1 無此需求 | admin 是純前端 SPA，物流密鑰不能進 bundle。**刻意不沿用** `VITE_NOTIFY_SECRET` 共享密鑰模式——該密鑰已被編譯進公開 JS bundle（既有風險，見 §9） |
| D8 | 上下架語意：`is_active=false`＝前台**隱藏**（同 `activities.is_published`）；`stock=0`＝顯示但標「售完」不可加入購物車 | 下架＝不想賣了該消失；售完＝還想賣只是沒貨 |
| D9 | 訂單編號用**真實欄位 `order_no`**，由 RPC 產生（`SP` + YYMMDD + 流水） | 現有 BK／AC／FS 三套顯示用編號在 6 處重複且互相矛盾——不再加第 7 套；超取對單需要可唸可查的單號 |
| D10 | 冷藏宅配 v1 採**半自動**：訂單／地址／運費由系統管理，出貨時店家自行至黑貓寄件（門市寄或叫收件），後台回填託運單號→觸發出貨信 | 冷藏單量初期低，為此多串一套綠界黑貓 API 不划算；綠界全方位物流已確認支援黑貓低溫，量大後再自動化（backlog） |

---

## 3. 資料庫設計（migration 草案）

新 migration 放 `minsu-admin/supabase/migrations/`（**不要**放到另一個孤兒資料夾 `minsu-admin/migrations/`）。新表一律 snake_case（同 activities，不學 bookings 的 camelCase）。金額一律**整數 TWD**。

### 3.1 products

```sql
create table if not exists public.products (
  id bigserial primary key,
  created_at timestamptz default now(),
  name text not null,
  subtitle text,
  description text,
  price int not null default 0,
  discount int not null default 0,
  temperature text not null default 'normal'
    check (temperature in ('normal','chilled','frozen')),
  stock int,                                -- null = 不限量；0 = 售完
  weight_g int,                             -- 選填，購物車重量提示用
  image text,                               -- 主圖（product-images bucket URL）
  gallery_images text[] default '{}'::text[],
  is_active boolean not null default true,  -- false = 前台隱藏
  sort_order int not null default 0
);
```

### 3.2 shop_orders / shop_order_items

```sql
create table if not exists public.shop_orders (
  id bigserial primary key,
  created_at timestamptz default now(),
  order_no text unique not null,            -- RPC 產生：SP + YYMMDD + 4 碼流水
  guest_id bigint references public.guests(id) on delete set null,
  status text not null default 'pending',
    -- pending(待匯款) / paid(已收款備貨中) / shipped(已出貨)
    -- / arrived(已到店) / picked_up(已取貨) / cancelled(已取消)
  temperature text not null,                -- 本單溫層（單一，D2）
  items_total int not null,
  shipping_fee int not null,                -- 下單時 snapshot（D5）
  total_price int not null,
  payment_method text default 'bank_transfer',
  contact_name text not null,               -- 正式欄位，不學 bookings 塞 observations 再用 regex 撈
  contact_email text not null,
  contact_phone text not null,
  delivery_type text not null default 'cvs'
    check (delivery_type in ('cvs','home')), -- cvs=超商取貨（常溫/冷凍）、home=黑貓低溫宅配（冷藏）
  cvs_brand text,                           -- 'UNIMART'(7-11) | 'FAMI'(全家)；超取必填（冷凍 v1 僅 FAMI）
  cvs_store_id text,                        -- v1 客人手填店號；升級後由電子地圖回填
  cvs_store_name text,
  cvs_store_address text,
  receiver_address text,                    -- 宅配必填（冷藏）
  logistics_no text,                        -- 寄件單號（v1 人工寄件後手動回填；升級後由 API 回填）
  logistics_status text,                    -- 最新貨態描述
  special_request text,
  admin_note text,
  paid_email_sent_at timestamptz,           -- email 冪等戳記，同 bookings 模式
  shipped_email_sent_at timestamptz,
  cancelled_email_sent_at timestamptz,
  check (
    (delivery_type = 'cvs'  and cvs_brand is not null and cvs_store_id is not null)
    or (delivery_type = 'home' and receiver_address is not null)
  )
);
create index if not exists idx_shop_orders_guest  on public.shop_orders(guest_id);
create index if not exists idx_shop_orders_status on public.shop_orders(status);

create table if not exists public.shop_order_items (
  id bigserial primary key,
  order_id bigint not null references public.shop_orders(id) on delete cascade,
  product_id bigint references public.products(id) on delete set null,
  name text not null,                       -- snapshot
  unit_price int not null,                  -- snapshot（已含折扣）
  quantity int not null,
  temperature text not null
);
create index if not exists idx_shop_order_items_order on public.shop_order_items(order_id);
```

購物車**不建表**：未登入即可加購物車，存 localStorage（前台 Context），結帳才落地成訂單。

### 3.3 settings 新增欄位（沿用 id=1 單例列）

```sql
alter table public.settings
  add column if not exists ship_fee_normal          int default 66,   -- 預設參考值；後台手動輸入修改（v1 依門市櫃檯牌價自行調整）
  add column if not exists ship_fee_frozen_unimart  int default 150,
  add column if not exists ship_fee_frozen_fami     int default 190,
  add column if not exists ship_fee_chilled_home    int default 180,  -- 冷藏黑貓低溫宅配（參考黑貓牌價，自行調整）
  add column if not exists free_ship_threshold_normal  int,   -- 「滿 X 元免運」門檻，各溫層獨立；null = 無免運
  add column if not exists free_ship_threshold_frozen  int,
  add column if not exists free_ship_threshold_chilled int;
```

### 3.4 RLS（沿用 `20260513020000_rls_lockdown.sql` 的模式，**必做**——anon key 是公開的）

- `products`：anon／authenticated 可 select（`using (true)`，前台自行過濾 `is_active`；或政策直接限 `is_active`，與 activities 的做法二選一）；寫入僅 `public.is_admin()`。
- `shop_orders`／`shop_order_items`：admin 全權（`is_admin()`）；顧客 select 自己的（`guest_id in (select id from guests where lower(email)=lower(auth.jwt()->>'email'))`，同 bookings 寫法）；**不開 anon insert**——前台寫入走 API route 的 service role。
- storage：新 bucket `product-images`，政策複製 `20260513030000_create_activities.sql` 第 4 節（公開讀、admin 寫）。

### 3.5 RPC（security definer，金額計算單一真相來源）

```
create_shop_order(p_guest_id, p_contact_name/email/phone,
                  p_temperature, p_delivery_type,
                  p_cvs_brand, p_store_id/name/address,   -- 超取用
                  p_receiver_address,                      -- 冷藏宅配用
                  p_items jsonb,            -- [{product_id, quantity}]
                  p_special_request)
```
- 逐項 `select … for update`：檢查 `is_active`、`temperature = p_temperature`、扣 `stock`。
- 單價／小計以 **DB 當下價格**計算（不信任前端金額）；運費從 `settings` 讀＋免運門檻判斷；產生 `order_no`；寫入 order＋items；回傳整列。
- 溫層↔配送方式規則在 RPC 內強制：`normal`／`frozen` → `cvs`、`chilled` → `home`，違反丟 `DELIVERY_MISMATCH`；v1 另限制 `frozen` 的 `cvs_brand` 只能 `FAMI`（升級後放開，U4）。
- 錯誤用 `raise exception 'OUT_OF_STOCK'`／`'PRODUCT_INACTIVE'`／`'TEMP_MISMATCH'`／`'DELIVERY_MISMATCH'`，前台 action 轉中文（同 `ACTIVITY_FULL` 模式）。
- 註：`create_activity_signup` 因 RPC 簽名沒帶 custom fields 而多打一次 UPDATE 的舊帳——這次把欄位一次帶齊，不要重蹈。

```
cancel_shop_order(p_order_id)  -- 未出貨才可取消；歸還 stock；status → cancelled
```

---

## 4. 前台開發任務（minsu-frontend）

沿用：資料層 `app/_lib/data-service.js`（⚠️ 它 select 指名欄位不是 `*`，新欄位要手動加）、公開讀用 anon client、寫入與個人資料讀取用 `supabase-admin.js`（server-only）、下單走 **API route**（採 `/api/reservations` 的結構化錯誤模式，不用 server action——bookings 已驗證這條路）。

| # | 任務 | 內容與主要檔案 | 驗證方式 |
|---|---|---|---|
| F1 | 資料層 | `data-service.js` 加 `getProducts()`（濾 `is_active`、排 `sort_order`）、`getProduct(id)`、`getShopOrdersByGuestId()`、`getShopOrderById()` | 暫頁列印資料正確 |
| F2 | 商品列表頁 `/shop` | 頁面＋商品卡（溫層 badge：常溫 `#3276A8`／冷藏 `#3A8D83`／冷凍 `#B44B4B`，沿用報告書配色）；售完狀態；三處導覽入口：`MobileMenuClient.js:92` 的 `ITEMS`、`SiteHeader.js`、`SideNavigation.js:12` 的 `navLinks` | 瀏覽器實測：上架商品出現、`is_active=false` 不出現、`stock=0` 標售完 |
| F3 | 購物車狀態 | `CartContext`（仿 `_components/ReservationContext.js`）＋ localStorage 持久化＋header 購物車圖示與數量徽章（掛進 `app/layout.js` 的 Provider 樹） | 加減商品、重整頁面數量不掉 |
| F4 | 購物車頁 `/cart` | **依溫層分組**顯示（D2）、改量／移除、每組顯示運費與免運差額試算、載入時對照最新商品資料處理失效品（下架／變價／售完提示） | 混溫層購物車正確分組；把商品後台下架後回購物車有失效提示 |
| F5 | 超商門市填寫 | （限常溫／冷凍組）結帳頁選 7-11／全家（冷凍僅顯示全家）→ 提供官方門市查詢連結（開新分頁）→ 客人手填**門市名稱＋店號**（必填，店號做格式檢核）。站內電子地圖選店列升級任務 U1 | 填好門市後結帳頁與訂單正確顯示門市資訊 |
| F6 | 結帳 `/checkout` | 登入保護（`middleware.js` matcher 加路徑＋頁內 `await auth()` 雙保險，同 confirm 頁模式）；收件人表單（預帶 guest 資料）；**冷藏組不選門市，改填宅配地址**；送單 `POST /api/shop/orders` → 呼叫 RPC → 錯誤碼轉中文 → 導 `/shop/thankyou?orderId=` | 完整下單流程（含冷藏宅配單）；stock=1 時開兩視窗搶單，後者收到「已售完」 |
| F7 | 訂單成立 email | `emailTemplates.js` 加 `shopOrderCreatedEmail`（含品項、匯款帳號＋`payment_deadline_hours`、門市資訊）；在 `/api/shop/orders` 內寄送（try/catch 不擋下單，同活動模式） | 收到信、金額門市正確 |
| F8 | 會員區訂單 | `/account/shop-orders` 列表＋`/account/shop-orders/[orderId]` 詳情（狀態、貨態、門市、匯款資訊）；`pending` 可自行取消（呼叫 cancel RPC）；`SideNavigation` 加項目 | 只看得到自己的訂單（換帳號驗證）；取消後庫存歸還 |
| F9 | thankyou 頁 | `/shop/thankyou?orderId=`＋`&admin=1` 支援（後台深連結用，同 `activities/thankyou` 的擁有者檢查寫法） | 非本人開他人 orderId 得 notFound |

## 5. 後台開發任務（minsu-admin）

沿用：feature 資料夾＋React Query v4（`isLoading` 不是 v5 的 `isPending`）、styled-components（transient props 要用 `$` 前綴）、react-hook-form、`getFrontendUrl()` 產生跨站連結、圖片上傳複製 `apiRooms.js`（含失敗 rollback）。⚠️ `npm run lint` 是 `--max-warnings 0`。

| # | 任務 | 內容與主要檔案 | 驗證方式 |
|---|---|---|---|
| A1 | 商品管理 | 新 `src/features/products/`＋`pages/Products.jsx`＋`App.jsx` 路由＋`MainNav.jsx` 項目。卡片列表（仿 rooms）、`CreateProductForm`（名稱／價格／折扣／**溫層下拉**／庫存／重量／圖片上傳到 `product-images`）、上下架 toggle（複製 `useToggleRoomActive` 五層模式） | 新增商品→前台出現；下架→前台消失 |
| A2 | 訂單列表 | `pages/Bookings.jsx` 現有「住宿／活動」tab（`:264-272, 390-394`，`?type=` 驅動）加第三個 **商品** tab；`ShopOrderTable/Row`＋狀態 filter（仿 `ACTIVITY_FILTERS :224`）；訂單編號格顯示 `order_no` 並以 `getFrontendUrl('/shop/thankyou?orderId=…&admin=1')` 深連結 | 三個 tab 切換正常、filter 正確 |
| A3 | 訂單操作 | 仿 `ActivitySignupRow` 三件套：確認收款（status→paid＋觸發 email）、取消（cancel RPC 還庫存＋email）、重寄通知；`services/apiShopOrders.js`＋hooks | 每個操作後狀態、email、庫存都對 |
| A4 | 出貨流程（全手動，D4） | paid 訂單顯示「標記出貨」→ 彈窗輸入**寄件單號**（超取：ibon／FamiPort 收據單號；冷藏：黑貓託運單號）→ status→shipped → 觸發已出貨 email（含門市或地址＋單號＋取貨提醒）。出貨畫面清楚顯示目的門市名稱＋店號，供現場操作機台時核對。PayNow 一鍵開單＋託運單列印列升級任務 U2 | 三種溫層各標記一單，狀態、email、單號都正確 |
| A5 | 完成標記 | v1 不追蹤貨態（到店／取貨簡訊由超商直接發給收件人）；後台提供「標記完成」（status→picked_up）。貨態 webhook 自動化列升級任務 U3 | 標記後列表與前台會員區狀態正確 |
| A6 | 運費設定 | settings 頁加「商城運費」區塊：四個運費（常溫／7-11 冷凍／全家冷凍／冷藏宅配）＋三個「滿 X 元免運」門檻，全部後台手動輸入修改（§3.3） | 改運費→前台結帳試算即時反映；舊訂單金額不變（snapshot） |
| A7 | Dashboard（選配） | 今日待出貨／待收款商品訂單小卡 | 數字正確 |

## 6. Email 通知一覽

模板加在 `emailTemplates.js`（複用 `shell()`／`infoCard()`／`formatPrice()`），寄送統一走 `mailer.js`（Zeabur Email API）。冪等戳記同 bookings（`*_email_sent_at`）。

| 時機 | 模板 | 觸發點 |
|---|---|---|
| 訂單成立 | `shopOrderCreatedEmail`（匯款資訊＋門市） | F6 下單 route 內 |
| 已收款 | `shopOrderPaidEmail` | 新 notify route `app/api/notify/shop-paid`＋`apiNotify.js` 加 `notifyShopPaid()` |
| 已出貨 | `shopOrderShippedEmail`（寄件單號＋門市或地址＋取貨提醒） | 新 notify route `app/api/notify/shop-shipped`（A4 標記出貨後觸發，同 shop-paid 模式） |
| 已取消 | `shopOrderCancelledEmail` | notify route `shop-cancelled` |
| 重寄 | 依狀態選模板（同 `booking-resend` 模式） | notify route `shop-resend` |

## 7. 開發順序與估時

```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 5
（前置確認）（DB+後台商品）（前台商品+購物車）（結帳+email）    （端到端實測上線）
                └────────────► Phase 4 ──────────────┘
                     （後台訂單+手動出貨，可與 Phase 3 部分並行）
```

| Phase | 內容 | 估時 |
|---|---|---|
| 0 | 前置確認（**免任何申請**）：至門市確認各溫層櫃檯牌價；建議先自寄一件熟悉 ibon／FamiPort 操作與冷凍包材 | 0.5 天（可與 Phase 1 並行） |
| 1 | ✅ **已完成 2026-08-18**：migration（§3 全部）＋A1 商品管理＋A6 運費設定 | 2–3 天 |
| 2 | ✅ **已完成 2026-08-18**：F1–F4（商品列表、商品詳情、購物車） | 2–3 天 |
| 2.5 | ✅ **已完成 2026-08-19**：商品頁豐富化方案一——互動圖庫（縮圖切換＋燈箱）＋結構化商品資訊（特色條列、內容量／產地／成分／保存期限／保存方式、購買須知；migration `20260818020000`）。方案二「自由圖文區塊」列 backlog，[排版示意](https://claude.ai/code/artifact/baa329b2-6007-4920-9e7f-2d91146f2e37) | 1–1.5 天 |
| 3 | ✅ **已完成 2026-08-19**：F5–F9（門市填寫、結帳含冷藏宅配地址流程、email、會員區） | 3–4 天 |
| 4 | ✅ **已完成 2026-08-19**：A2–A5（訂單管理商品分頁、確認收款／標記出貨／取消／重寄、四條 shop notify route） | 2.5–3.5 天 |
| 5 | 全流程實測：正式下單→收款→出貨，**常溫／冷凍／冷藏各實寄一件**走到取貨；上線 | 1–2 天 |
| 合計 | | **11–15 人天** |

### 升級路徑：之後申請 PayNow 再補（估 +3–4 天）

| # | 升級任務 | 內容 |
|---|---|---|
| U1 | 站內電子地圖選店 | 取代 F5 的手填：form POST 導向 PayNow 電子地圖＋callback route `app/api/shop/cvs-map/route.js`（§1.4） |
| U2 | 一鍵開單＋託運單列印 | A4 加「建立物流單」：frontend `POST /api/admin/shop/create-logistics`（D7 的 JWT 驗證）呼叫 PayNow 建單、回填 `logistics_no`、開新視窗列印託運單 |
| U3 | 貨態自動回傳 | webhook `app/api/shop/logistics-status/route.js` 更新 arrived／picked_up＋通知信（需公開網址） |
| U4 | 開放 7-11 冷凍 | 放開 RPC 與結帳 UI 的「冷凍限全家」限制 |

資料結構已預留（門市欄位、`logistics_no`、狀態機皆不變），**升級不需要 migration**。

## 8. 需要先拍板的問題

| # | 問題 | 建議 |
|---|---|---|
| Q1 | 冷藏商品怎麼辦？ | ✅ **已拍板：走黑貓低溫宅配**——v1 半自動（D10：系統管訂單／地址／運費，人工寄件回填託運單號），綠界 API 自動建單列 backlog |
| Q2 | 要接金流嗎？ | ✅ **已拍板：不接，僅轉帳**（日後有需要再評估 PayNow 金流） |
| Q3 | 超商**取貨付款**（代收貨款）？ | ✅ **已拍板：不做**——付款只走轉帳 |
| Q4 | 要管庫存嗎？ | 要（`stock`，null=不限量），成本極低且防超賣 |
| Q5 | 運費由誰負擔／免運門檻金額？ | ✅ **已拍板：運費後台手動輸入修改**（預設牌價 66／150／190／冷藏宅配 180）＋**各溫層可設「滿 X 元免運」門檻**；實際數字上線前在後台填 |
| Q6 | 發票／收據？ | 沿用現況（訂房也未開立）；若需要，PayNow 有電子發票加值服務 |
| Q7 | 退貨流程？ | v1 人工處理（後台取消＋自行退款），不做線上退貨 |
| Q8 | 要先申請物流商（PayNow）嗎？ | ✅ **已拍板（2026-08-18）：v1 不申請、全手動寄件**（個人戶亦可辦，但先不辦）；之後單量大或想要站內選店再辦，補 U1–U4（§7 升級路徑） |

## 9. 風險與注意事項

1. **手填門市的寄錯風險**——店名／店號打錯會寄錯店：結帳表單要求「門市名稱＋店號」都必填並做店號格式檢核（F5），出貨時一律以後台顯示的門市資訊在機台上重新核對（A4）。升級 U1（站內地圖選店）後此風險消失。
2. **既有安全問題，本期不沿用但值得另開工單**：`VITE_NOTIFY_SECRET` 被編譯進公開 admin bundle，任何人可取出並打 `/api/notify/*` 對顧客亂寄信；`vite.config.js` 的 `define: {"process.env": process.env}` 會把整個 shell 環境 inline 進 bundle。日後升級串接時，新的 `/api/admin/shop/*` 一律用 Supabase JWT 驗證（D7），物流密鑰只放 frontend server 的 `.env.local`。
3. **migration 位置**：repo 有兩個 migrations 資料夾，新檔案一律放 `minsu-admin/supabase/migrations/`；動 schema 前先確認（CLAUDE.md 慣例）。另外 `.claude/worktrees/epic-chaum-75a9f1/` 是舊 worktree 殘留副本，**不要改到那份**。
4. **RLS 不能漏**：anon key 公開在 bundle 裡，新表沒掛 policy 就是全世界可寫。
5. `data-service.js` 的 select 是指名欄位——products 之後每加欄位都要記得補 select 清單（rooms 的 `is_active` 踩過這個坑）。
6. 低溫物流是**營運重活**：冷凍超取（預冷 24h、專用箱、防水標籤、7 天內寄件）、冷藏宅配（黑貓低溫需保冷包材，牌價依材積 60／90／120cm 與地區計）——上線前務必各真寄一件走完全程（Phase 5）。
7. v1 運費成本以門市櫃檯現場牌價為準（向客人收的運費在 A6 後台手動維護）；文中 PayNow 費率為 2026-08 公開資訊，供日後升級參考。
8. email 寄送保持 try/catch 不擋主流程（現有慣例），並用 `*_email_sent_at` 防重複。

## 10. 參考資料

- 綠界物流 API：[門市電子地圖](https://developers.ecpay.com.tw/?p=8795)、[全方位物流服務](https://developers.ecpay.com.tw/10075/)、[物流整合](https://developers.ecpay.com.tw/7380/)、[物流服務介紹](https://www.ecpay.com.tw/IntroTransport)
- PayNow 立吉富：[物流網站](https://logistic.paynow.com.tw)、[開發者文件](https://docs.paynow.com.tw/)、[7-11 大宗串接 PDF 範例](https://paynow-public.s3.ap-northeast-1.amazonaws.com/docs/PayNow_Logistic_v2.4_711Bulk.pdf)
- PayNow 實務教學：[WACA 超商物流申請](https://www.waca.net/support/id/226)、[WACA 全家冷凍申請及出貨](https://www.waca.net/support/id/328)、[meepShop 物流串接設定](https://supportmeepshop.com/knowledgebase/paynow-%E7%89%A9%E6%B5%81%E4%B8%B2%E6%8E%A5%E6%93%8D%E4%BD%9C%E8%A8%AD%E5%AE%9A/)、[ShopStore 教學](https://shopstore.tw/teachinfo/543)
- PAYUNi：[物流服務](https://www.payuni.com.tw/shipping)、[寄件教學](https://www.payuni.com.tw/shipping-send)
- 全家冷凍店到店（平台實作參考）：[CYBERBIZ 說明](https://help.cyberbiz.io/ec/orders/cvs-shipping/family-mart-frozen-c2c/)
- 7-11 電子地圖（官方，需 eshopid）：[c2cemap.ashx](https://emap.presco.com.tw/c2cemap.ashx)、[串接討論](https://ithelp.ithome.com.tw/questions/10194953)
