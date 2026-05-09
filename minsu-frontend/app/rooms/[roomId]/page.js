import { auth } from "@/app/_lib/auth";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export const metadata = { title: "磚瓦閣 — 老屋特色房 | 山田寓所 FIELDSTAY" };

export default async function Page({ params }) {
  const session = await auth();
  const userName = escapeHtml(session?.user?.name || session?.user?.email || "");
  const authActionHtml = session?.user
    ? `<a href="/account" class="btn btn-primary">${userName}</a>`
    : `<a href="/login" class="btn btn-primary">登入</a>`;
  const roomId = Number(params.roomId);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:       oklch(96% 0.010 75);
      --surface:  oklch(99% 0.005 75);
      --fg:       oklch(18% 0.012 80);
      --muted:    oklch(50% 0.010 80);
      --border:   oklch(88% 0.008 75);
      --accent:   oklch(44% 0.13 183);
      --accent-d: oklch(38% 0.13 183);
      --accent2:  oklch(40% 0.14 28);
      --success:  oklch(50% 0.14 148);
      --font-serif: 'Noto Serif TC', Georgia, serif;
      --font-sans:  'Noto Sans TC', -apple-system, system-ui, sans-serif;
    }

    body {
      background: var(--bg);
      color: var(--fg);
      font-family: var(--font-sans);
      font-size: 15px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    /* NAV */
    .nav {
      position: sticky;
      top: 0;
      z-index: 200;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2.5rem;
      background: rgba(253,251,249,0.92);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }
    .nav-logo { display: flex; align-items: center; gap: 0.7rem; text-decoration: none; }
    .logo-zh { font-family: var(--font-serif); font-size: 15px; font-weight: 600; letter-spacing: 0.08em; color: var(--fg); }
    .logo-en { font-size: 9px; letter-spacing: 0.22em; color: var(--muted); text-transform: uppercase; margin-top: 2px; display: block; }
    .nav-actions { display: flex; gap: 0.75rem; align-items: center; }
    .btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-family: var(--font-sans); font-weight: 500; cursor: pointer; text-decoration: none; transition: all 0.2s; border: 1px solid transparent; }
    .btn-ghost { border-color: var(--border); background: transparent; color: var(--fg); }
    .btn-ghost:hover { background: var(--fg); color: white; border-color: var(--fg); }
    .btn-primary { background: var(--accent); color: white; }
    .btn-primary:hover { background: var(--accent-d); }
    .btn-primary:disabled { background: var(--border); color: var(--muted); cursor: not-allowed; }

    /* BREADCRUMB */
    .breadcrumb {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.25rem 2.5rem;
      font-size: 13px;
      color: var(--muted);
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .breadcrumb a { color: var(--muted); text-decoration: none; }
    .breadcrumb a:hover { color: var(--accent); }
    .breadcrumb span { opacity: 0.4; }

    /* GALLERY */
    .gallery {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2.5rem 2rem;
      display: grid;
      grid-template-columns: 2fr 1fr;
      grid-template-rows: 280px 140px;
      gap: 0.5rem;
      border-radius: 16px;
      overflow: hidden;
    }
    .gallery-main {
      grid-row: 1 / 3;
      border-radius: 12px 0 0 12px;
      overflow: hidden;
      background: linear-gradient(140deg, oklch(38% 0.12 42) 0%, oklch(50% 0.13 36) 50%, oklch(56% 0.10 48) 100%);
    }
    .gallery-sub {
      border-radius: 0;
      overflow: hidden;
      background: oklch(46% 0.10 160);
    }
    .gallery-sub:first-of-type { border-top-right-radius: 12px; }
    .gallery-sub:last-child { border-bottom-right-radius: 12px; }
    .gallery-sub:nth-child(2) { background: oklch(56% 0.10 80); }
    .gallery-sub:nth-child(3) { background: oklch(44% 0.09 185); }

    /* LAYOUT */
    .room-layout {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2.5rem 5rem;
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 3rem;
      align-items: flex-start;
    }

    /* ROOM INFO */
    .room-info h1 {
      font-family: var(--font-serif);
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 700;
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }
    .room-tagline {
      font-size: 15px;
      color: var(--muted);
      margin-bottom: 1.5rem;
    }

    .room-stats {
      display: flex;
      gap: 1.5rem;
      padding: 1.25rem 0;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      margin-bottom: 2rem;
    }
    .stat { text-align: center; }
    .stat-val { font-family: var(--font-serif); font-size: 1.3rem; font-weight: 700; display: block; }
    .stat-lbl { font-size: 11px; color: var(--muted); letter-spacing: 0.04em; }

    .info-block { margin-bottom: 2rem; }
    .info-block h2 {
      font-family: var(--font-serif);
      font-size: 1.05rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border);
    }
    .info-block p { font-size: 14px; color: var(--muted); line-height: 1.85; }

    .amenities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 0.6rem;
    }
    .amen-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 13px;
      color: var(--fg);
      padding: 8px 10px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
    }
    .amen-item svg { flex-shrink: 0; color: var(--accent); }

    /* RULES */
    .rules-list { list-style: none; }
    .rules-list li {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      font-size: 13px;
      color: var(--muted);
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border);
    }
    .rules-list li:last-child { border-bottom: none; }
    .rules-list li::before { content: '·'; color: var(--accent); font-size: 1.2rem; line-height: 1.2; }

    /* BOOKING SIDEBAR */
    .booking-sidebar {
      position: sticky;
      top: 80px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.75rem;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    }

    .sidebar-price {
      font-family: var(--font-serif);
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
    }
    .sidebar-price sub {
      font-family: var(--font-sans);
      font-size: 13px;
      font-weight: 400;
      color: var(--muted);
    }

    .date-picker {
      border: 1.5px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 0.75rem;
    }
    .date-row {
      display: flex;
      border-bottom: 1px solid var(--border);
    }
    .date-row:last-child { border-bottom: none; }
    .date-field {
      flex: 1;
      padding: 10px 14px;
    }
    .date-field:first-child { border-right: 1px solid var(--border); }
    .date-field label {
      display: block;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .date-field input,
    .date-field select {
      border: none;
      background: transparent;
      font-size: 14px;
      color: var(--fg);
      font-family: var(--font-sans);
      outline: none;
      width: 100%;
    }

    .avail-check {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 0;
      margin-bottom: 0.75rem;
      font-size: 13px;
    }
    .avail-indicator {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 500;
    }
    .avail-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .price-breakdown { margin-bottom: 1rem; }
    .price-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 0.4rem 0;
      color: var(--muted);
    }
    .price-row.total {
      font-size: 15px;
      font-weight: 600;
      color: var(--fg);
      border-top: 1px solid var(--border);
      margin-top: 0.5rem;
      padding-top: 0.75rem;
    }

    .sidebar-btn {
      width: 100%;
      padding: 14px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-family: var(--font-serif);
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      margin-bottom: 0.75rem;
    }
    .sidebar-btn:hover { background: var(--accent-d); }

    .sidebar-note {
      text-align: center;
      font-size: 12px;
      color: var(--muted);
    }

    /* REVIEWS */
    .reviews-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .review-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1.1rem;
    }
    .review-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.6rem; }
    .review-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
      color: white;
      flex-shrink: 0;
    }
    .review-meta { flex: 1; }
    .review-name { font-size: 13px; font-weight: 600; }
    .review-date { font-size: 11px; color: var(--muted); }
    .review-stars { color: oklch(72% 0.18 75); font-size: 12px; letter-spacing: 1px; }
    .review-text { font-size: 13px; color: var(--muted); line-height: 1.7; }

    /* MOBILE */
    @media (max-width: 900px) {
      .room-layout { grid-template-columns: 1fr; }
      .booking-sidebar { position: static; }
      .gallery { grid-template-columns: 1fr; grid-template-rows: 240px; height: auto; }
      .gallery-main { grid-row: 1; border-radius: 12px; }
      .gallery-sub { display: none; }
      .reviews-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .nav { padding: 0 1.25rem; }
      .breadcrumb { padding: 1rem 1.25rem; }
      .gallery { padding: 0 1.25rem 1.5rem; }
      .room-layout { padding: 0 1.25rem 4rem; }
      .room-stats { flex-wrap: wrap; gap: 1rem; }
    }
  ` }} />
      <div dangerouslySetInnerHTML={{ __html: `

  <!-- NAV -->
  <nav class="nav">
    <a href="/" class="nav-logo">
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
        <circle cx="19" cy="19" r="19" fill="oklch(44% 0.13 183)"/>
        <path d="M6 28 C9 28 13 16 19 19.5 C25 16 29 28 32 28 Z" fill="white" opacity="0.95"/>
        <path d="M23.5 13 L24.4 15.5 L27 16.4 L24.4 17.3 L23.5 19.8 L22.6 17.3 L20 16.4 L22.6 15.5 Z" fill="white"/>
      </svg>
      <div style="display:flex;flex-direction:column;line-height:1;">
        <span class="logo-zh">山田寓所</span>
        <span class="logo-en">FIELDSTAY</span>
      </div>
    </a>
    <div class="nav-actions">
      <a href="/account" class="btn btn-ghost">會員中心</a>
      ${authActionHtml}
    </div>
  </nav>

  <!-- BREADCRUMB -->
  <div class="breadcrumb">
    <a href="/">首頁</a>
    <span>/</span>
    <a href="/#rooms">房型選擇</a>
    <span>/</span>
    <span style="color:var(--fg);">磚瓦閣 — 老屋特色房</span>
  </div>

  <!-- GALLERY -->
  <div class="gallery">
    <div class="gallery-main"></div>
    <div class="gallery-sub"></div>
    <div class="gallery-sub"></div>
  </div>

  <!-- MAIN LAYOUT -->
  <div class="room-layout">

    <!-- Left: Room Info -->
    <div>
      <h1>磚瓦閣 — 老屋特色房</h1>
      <p class="room-tagline">百年磚瓦老屋改建，保留原始建築紋理，融入現代舒適設備</p>

      <div class="room-stats">
        <div class="stat">
          <span class="stat-val">28</span>
          <span class="stat-lbl">㎡ 空間</span>
        </div>
        <div class="stat">
          <span class="stat-val">2</span>
          <span class="stat-lbl">位房客</span>
        </div>
        <div class="stat">
          <span class="stat-val">1</span>
          <span class="stat-lbl">張大床</span>
        </div>
        <div class="stat">
          <span class="stat-val">1</span>
          <span class="stat-lbl">衛浴</span>
        </div>
      </div>

      <div class="info-block">
        <h2>關於這間房</h2>
        <p>磚瓦閣以百年老磚、傳統竹節窗框為基底，保留老屋原始的建築溫度，同時配備現代衛浴與空調。早晨醒來，可透過木窗看見庭院的炊煙與農田。</p>
        <br>
        <p>這不是一間「設計感」強烈的房間，而是一個讓你真實感受到時間厚度的地方。適合想逃離城市節奏、尋找生活根源的旅人。</p>
      </div>

      <div class="info-block">
        <h2>房間設施</h2>
        <div class="amenities-grid">
          <div class="amen-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="8" width="12" height="6" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M4 8V5a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.2"/></svg>
            冷暖氣
          </div>
          <div class="amen-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M8 5v3l2 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            熱水淋浴
          </div>
          <div class="amen-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 10h12M4 10V7l4-4 4 4v3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            WiFi 上網
          </div>
          <div class="amen-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/></svg>
            電視
          </div>
          <div class="amen-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 13s0-2 5-2 5 2 5 2M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            早餐供應
          </div>
          <div class="amen-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.2"/><path d="M5 8h6M8 5v6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            盥洗備品
          </div>
          <div class="amen-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            老屋建築
          </div>
          <div class="amen-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            免費停車
          </div>
        </div>
      </div>

      <div class="info-block">
        <h2>入住規則</h2>
        <ul class="rules-list">
          <li>入住時間：15:00 後 &nbsp;·&nbsp; 退房時間：11:00 前</li>
          <li>禁止攜帶寵物入住</li>
          <li>禁止在房內抽菸</li>
          <li>公共區域請保持安靜，22:00 後請降低音量</li>
          <li>房內不提供廚房使用，可使用公共區域輕食空間</li>
          <li>取消政策：入住 7 日前取消可全額退款；3 日前取消退款 50%；3 日內恕不退款</li>
        </ul>
      </div>

      <div class="info-block">
        <h2>旅客評價</h2>
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
          <div style="font-family:var(--font-serif);font-size:3rem;font-weight:700;line-height:1;">4.9</div>
          <div>
            <div style="color:oklch(72% 0.18 75);font-size:1.1rem;letter-spacing:2px;">★★★★★</div>
            <div style="font-size:13px;color:var(--muted);">共 48 則評價</div>
          </div>
        </div>
        <div class="reviews-grid">
          <div class="review-card">
            <div class="review-header">
              <div class="review-avatar" style="background:oklch(44% 0.13 183);">陳</div>
              <div class="review-meta">
                <div class="review-name">陳小姐 &nbsp; <span class="review-stars">★★★★★</span></div>
                <div class="review-date">2026 年 4 月</div>
              </div>
            </div>
            <p class="review-text">真的很有老屋的感覺，不是那種刻意裝潢的，是真實的磚牆跟木窗。早餐很用心，還有當天現做的草仔粿。</p>
          </div>
          <div class="review-card">
            <div class="review-header">
              <div class="review-avatar" style="background:oklch(40% 0.14 28);">林</div>
              <div class="review-meta">
                <div class="review-name">林先生 &nbsp; <span class="review-stars">★★★★★</span></div>
                <div class="review-date">2026 年 3 月</div>
              </div>
            </div>
            <p class="review-text">在台南南部農村待了兩晚，整個節奏都慢下來了。跟著一起去炊粿，是很難忘的體驗。強力推薦！</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Booking Sidebar -->
    <div class="booking-sidebar">
      <div class="sidebar-price">NT$3,800 <sub>/ 夜</sub></div>

      <div class="date-picker">
        <div class="date-row">
          <div class="date-field">
            <label>入住日期</label>
            <input type="date" id="checkin" value="2026-05-10">
          </div>
          <div class="date-field">
            <label>退房日期</label>
            <input type="date" id="checkout" value="2026-05-12">
          </div>
        </div>
        <div class="date-row">
          <div class="date-field" style="border:none;">
            <label>房客人數</label>
            <select id="guests">
              <option value="1">1 位大人</option>
              <option value="2" selected>2 位大人</option>
              <option value="3">2 大人 1 兒童</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Availability -->
      <div class="avail-check" id="availRow">
        <span style="font-size:13px;color:var(--muted);">空房狀況</span>
        <div class="avail-indicator" style="color:var(--success);">
          <div class="avail-dot"></div>
          有空房
        </div>
      </div>

      <!-- Price Breakdown -->
      <div class="price-breakdown" id="priceBreakdown">
        <div class="price-row">
          <span>NT$3,800 × 2 晚</span>
          <span>NT$7,600</span>
        </div>
        <div class="price-row">
          <span>清潔費</span>
          <span>NT$500</span>
        </div>
        <div class="price-row">
          <span>服務費</span>
          <span>NT$380</span>
        </div>
        <div class="price-row">
          <span>付款方式</span>
          <span>轉帳</span>
        </div>
        <div class="price-row total">
          <span>總金額</span>
          <span id="totalPrice">NT$8,480</span>
        </div>
      </div>

      <button class="sidebar-btn" id="bookBtn" onclick="handleBook()">確認訂房</button>
      <p class="sidebar-note" id="bookNote">付款方式：轉帳；訂房前需先登入會員帳號</p>
    </div>

  </div>

` }} />
      <script dangerouslySetInnerHTML={{ __html: `
    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkin')) document.getElementById('checkin').value = params.get('checkin');
    if (params.get('checkout')) document.getElementById('checkout').value = params.get('checkout');

    function updatePrice() {
      const ci = new Date(document.getElementById('checkin').value);
      const co = new Date(document.getElementById('checkout').value);
      if (isNaN(ci) || isNaN(co) || co <= ci) return;
      const nights = Math.round((co - ci) / 86400000);
      const room = 3800 * nights;
      const clean = 500;
      const service = Math.round(room * 0.05);
      document.getElementById('totalPrice').textContent = 'NT$' + (room + clean + service).toLocaleString();
      // update first row
      document.querySelector('.price-row:first-child span:first-child').textContent = 'NT$3,800 × ' + nights + ' 晚';
      document.querySelector('.price-row:first-child span:last-child').textContent = 'NT$' + room.toLocaleString();
      document.querySelector('.price-row:nth-child(3) span:last-child').textContent = 'NT$' + service.toLocaleString();
    }

    document.getElementById('checkin').addEventListener('change', updatePrice);
    document.getElementById('checkout').addEventListener('change', updatePrice);
    updatePrice();

    function handleBook() {
      const checkin = document.getElementById('checkin').value;
      const checkout = document.getElementById('checkout').value;
      const guests = document.getElementById('guests').value || '1';

      if (!checkin || !checkout || new Date(checkout) <= new Date(checkin)) {
        document.getElementById('bookNote').textContent = '請選擇正確的入住與退房日期。付款方式：轉帳';
        return;
      }

      const query = new URLSearchParams({ checkin, checkout, guests });
      window.location.href = '/rooms/${roomId}/confirm?' + query.toString();
    }
  ` }} />
    </>
  );
}
