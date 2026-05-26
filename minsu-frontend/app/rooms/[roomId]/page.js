import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/app/_lib/auth";
import { getRoom } from "@/app/_lib/data-service";
import BookingSidebar from "./BookingSidebar";
import BrandMark from "@/app/_components/BrandMark";

export async function generateMetadata({ params }) {
  try {
    const room = await getRoom(params.roomId);
    return { title: `${room.name} | 山田寓所 FIELDSTAY` };
  } catch {
    return { title: "房型 | 山田寓所 FIELDSTAY" };
  }
}

const AMENITY_ICONS = {
  aircon: (
    <>
      <rect x="2" y="8" width="12" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 8V5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.2" />
    </>
  ),
  shower: (
    <>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  wifi: (
    <path d="M2 10h12M4 10V7l4-4 4 4v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  ),
  tv: (
    <>
      <rect x="3" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
    </>
  ),
  breakfast: (
    <path d="M3 13s0-2 5-2 5 2 5 2M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  ),
  toiletries: (
    <>
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  building: (
    <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  ),
  parking: (
    <>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  default: (
    <path d="M4 8l3 3 5-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  ),
};

function iconForAmenity(label) {
  const s = String(label).toLowerCase();
  if (/(冷氣|暖氣|空調|aircon|air condition)/i.test(s)) return AMENITY_ICONS.aircon;
  if (/(wifi|無線|網路)/i.test(s)) return AMENITY_ICONS.wifi;
  if (/(淋浴|熱水|浴室|shower)/i.test(s)) return AMENITY_ICONS.shower;
  if (/(電視|tv)/i.test(s)) return AMENITY_ICONS.tv;
  if (/(早餐|餐具|餐|kitchen|廚房|breakfast)/i.test(s)) return AMENITY_ICONS.breakfast;
  if (/(盥洗|備品|沐浴|toiletries)/i.test(s)) return AMENITY_ICONS.toiletries;
  if (/(停車|parking)/i.test(s)) return AMENITY_ICONS.parking;
  if (/(老屋|建築|building)/i.test(s)) return AMENITY_ICONS.building;
  return AMENITY_ICONS.default;
}

export default async function Page({ params }) {
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email || "";
  const roomId = Number(params.roomId);

  let room;
  try {
    room = await getRoom(params.roomId);
  } catch {
    notFound();
  }
  if (!room) notFound();

  const pricePerNight = Math.max(
    0,
    Number(room.regularPrice || 0) - Number(room.discount || 0)
  );
  const cleaningFee = room.cleaning_fee != null ? Number(room.cleaning_fee) : 500;
  const serviceFeeRate =
    room.service_fee_rate != null ? Number(room.service_fee_rate) : 0.05;
  const galleryImages = Array.isArray(room.gallery_images)
    ? room.gallery_images
    : [];
  const coverImage = room.image || galleryImages[0];
  const subImages = galleryImages
    .filter((url) => url && url !== coverImage)
    .slice(0, 2);
  const amenities = Array.isArray(room.amenities) ? room.amenities : [];
  const houseRules = Array.isArray(room.house_rules) ? room.house_rules : [];
  const descriptionParagraphs = String(room.description || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      <nav className="nav">
        <Link href="/" className="nav-logo">
          <BrandMark size={38} />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span className="logo-zh">山田寓所</span>
            <span className="logo-en">FIELDSTAY</span>
          </div>
        </Link>
        <div className="nav-actions">
          <Link href="/account" className="btn btn-ghost">會員中心</Link>
          {session?.user ? (
            <Link href="/account" className="btn btn-primary">{userName}</Link>
          ) : (
            <Link href="/login" className="btn btn-primary">登入</Link>
          )}
        </div>
      </nav>

      <div className="breadcrumb">
        <Link href="/">首頁</Link>
        <span>/</span>
        <Link href="/#rooms">房型選擇</Link>
        <span>/</span>
        <span style={{ color: "var(--fg)" }}>{room.name}</span>
      </div>

      <div className="gallery">
        <div className="gallery-main">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt={room.name} />
          ) : null}
        </div>
        {[0, 1].map((idx) => (
          <div key={idx} className="gallery-sub">
            {subImages[idx] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={subImages[idx]} alt="" />
            ) : null}
          </div>
        ))}
      </div>

      <div className="room-layout">
        <div>
          {room.is_active === false ? (
            <div
              role="status"
              style={{
                marginBottom: "1.25rem",
                padding: "0.85rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid oklch(80% 0.05 65)",
                background: "oklch(95% 0.04 65)",
                color: "oklch(35% 0.12 65)",
                fontSize: "0.9rem",
              }}
            >
              此房型目前暫停接受訂房，敬請見諒。
            </div>
          ) : null}
          <h1>{room.name}</h1>
          {room.subtitle ? (
            <p className="room-tagline">{room.subtitle}</p>
          ) : null}

          <div className="room-stats">
            <div className="stat">
              <span className="stat-val">{room.area_sqm || "-"}</span>
              <span className="stat-lbl">㎡ 空間</span>
            </div>
            <div className="stat">
              <span className="stat-val">{room.maxCapacity || "-"}</span>
              <span className="stat-lbl">位房客</span>
            </div>
            <div className="stat">
              <span className="stat-val">{room.bed_text || "-"}</span>
              <span className="stat-lbl">床型</span>
            </div>
            <div className="stat">
              <span className="stat-val">{room.bathroom_text || "-"}</span>
              <span className="stat-lbl">衛浴</span>
            </div>
          </div>

          {descriptionParagraphs.length > 0 ? (
            <div className="info-block">
              <h2>關於這間房</h2>
              {descriptionParagraphs.map((p, i) => (
                <p key={i} style={i > 0 ? { marginTop: "0.75rem" } : undefined}>
                  {p}
                </p>
              ))}
            </div>
          ) : null}

          {(room.check_in_time || room.check_out_time) ? (
            <div className="info-block">
              <h2>入住資訊</h2>
              <p>
                入住時間：{room.check_in_time || "15:00"} 後 ・ 退房時間：
                {room.check_out_time || "11:00"} 前
              </p>
            </div>
          ) : null}

          {amenities.length > 0 ? (
            <div className="info-block">
              <h2>房間設施</h2>
              <div className="amenities-grid">
                {amenities.map((label) => (
                  <div key={label} className="amen-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      {iconForAmenity(label)}
                    </svg>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {houseRules.length > 0 ? (
            <div className="info-block">
              <h2>入住規則</h2>
              <ul className="rules-list">
                {houseRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          ) : null}

        </div>

        <BookingSidebar
          roomId={roomId}
          pricePerNight={pricePerNight}
          cleaningFee={cleaningFee}
          serviceFeeRate={serviceFeeRate}
          maxCapacity={room.maxCapacity || 4}
          isActive={room.is_active !== false}
        />
      </div>
    </>
  );
}

const PAGE_CSS = `
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
      --font-serif: Georgia, serif;
      --font-sans:  system-ui, sans-serif;
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
      width: min(1200px, 100%);
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
      background-color: oklch(46% 0.10 160);
    }
    .gallery-sub:first-of-type { border-top-right-radius: 12px; }
    .gallery-sub:last-child { border-bottom-right-radius: 12px; }
    .gallery-sub:nth-child(2) { background-color: oklch(56% 0.10 80); }
    .gallery-sub:nth-child(3) { background-color: oklch(44% 0.09 185); }
    .gallery-main img,
    .gallery-sub img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
    }

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
      position: relative;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      margin-bottom: 0.75rem;
    }

    /* Day-picker trigger button (looks like the old input) */
    button.dp-trigger {
      appearance: none;
      background: transparent;
      border: none;
      text-align: left;
      cursor: pointer;
      font-family: inherit;
      color: inherit;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    button.dp-trigger:hover { background: oklch(96% 0.010 75); }
    button.dp-trigger:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
    .dp-label {
      display: block;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .dp-value {
      font-size: 14px;
      color: var(--fg);
      font-variant-numeric: tabular-nums;
    }

    /* Day-picker popover */
    .dp-popover {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      z-index: 50;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 14px 40px rgba(0, 0, 0, 0.12);
      padding: 0.5rem 0.5rem 0;
    }
    .dp-popover .rdp { --rdp-accent-color: var(--accent); margin: 0; }
    .dp-popover .rdp-day_selected,
    .dp-popover .rdp-day_selected:focus-visible,
    .dp-popover .rdp-day_selected:hover {
      background-color: var(--accent);
      color: white;
    }
    .dp-popover .rdp-day_range_middle {
      background-color: oklch(94% 0.04 183);
      color: var(--fg);
    }
    .dp-popover-foot {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0.75rem 0.75rem;
      border-top: 1px solid var(--border);
      margin-top: 0.25rem;
      font-size: 13px;
      color: var(--muted);
    }
    .dp-close {
      border: none;
      background: var(--accent);
      color: white;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .dp-close:hover { background: var(--accent-d); }
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

    /* Mobile-only elements — hidden on desktop */
    .mobile-cta { display: none; }
    .mobile-sheet-handle,
    .mobile-sheet-close,
    .mobile-sheet-backdrop,
    .mobile-cta-expand { display: none; }

    /* MOBILE */
    @media (max-width: 900px) {
      .room-layout { grid-template-columns: 1fr; padding-bottom: 6rem; }
      .gallery { grid-template-columns: 1fr; grid-template-rows: 240px; height: auto; }
      .gallery-main { grid-row: 1; border-radius: 12px; }
      .gallery-sub { display: none; }

      /* Sidebar 變 bottom sheet：預設藏在畫面下方 */
      .booking-sidebar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        max-height: 85vh;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        background: var(--surface);
        border: 1px solid var(--border);
        border-bottom: none;
        border-radius: 20px 20px 0 0;
        box-shadow: 0 -10px 32px rgba(0, 0, 0, 0.18);
        transform: translateY(110%);
        visibility: hidden;
        pointer-events: none;
        transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1),
                    visibility 0s linear 0.32s;
        z-index: 110;
        padding: 1.25rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom));
        margin: 0;
        width: auto;
        will-change: transform;
      }
      .booking-sidebar.is-sheet-open {
        transform: translateY(0);
        visibility: visible;
        pointer-events: auto;
        transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1),
                    visibility 0s linear 0s;
      }

      .mobile-sheet-handle {
        display: block;
        width: 44px;
        height: 4px;
        background: oklch(82% 0.01 75);
        border-radius: 2px;
        margin: 0 auto 1rem;
      }
      .mobile-sheet-close {
        display: grid;
        place-items: center;
        position: absolute;
        top: 10px;
        right: 12px;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        font-size: 22px;
        line-height: 1;
        color: var(--muted);
        cursor: pointer;
      }
      .mobile-sheet-close:hover { color: var(--fg); }

      .mobile-sheet-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 105;
        background: rgba(0, 0, 0, 0.45);
        border: none;
        padding: 0;
        cursor: pointer;
        animation: sheetFadeIn 0.2s ease;
      }
      @keyframes sheetFadeIn { from { opacity: 0; } to { opacity: 1; } }

      /* Sticky CTA */
      .mobile-cta {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 90;
        align-items: center;
        gap: 10px;
        padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
        background: var(--surface);
        border-top: 1px solid var(--border);
        box-shadow: 0 -6px 22px rgba(0, 0, 0, 0.08);
      }
      .mobile-cta-expand {
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--fg);
        cursor: pointer;
        flex-shrink: 0;
      }
      .mobile-cta-expand:hover { background: oklch(96% 0.010 75); }
      .mobile-cta-info {
        display: flex;
        flex-direction: column;
        line-height: 1.25;
        flex: 1;
        min-width: 0;
      }
      .mobile-cta-price {
        font-family: var(--font-serif);
        font-size: 18px;
        font-weight: 700;
        color: var(--fg);
      }
      .mobile-cta-meta {
        font-size: 12px;
        color: var(--muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .mobile-cta-btn {
        flex-shrink: 0;
        border: none;
        background: var(--accent);
        color: white;
        padding: 12px 22px;
        border-radius: 999px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
      }
      .mobile-cta-btn:hover { background: var(--accent-d); }
    }
    @media (max-width: 640px) {
      .nav { padding: 0 1.25rem; }
      .breadcrumb { padding: 1rem 1.25rem; }
      .gallery { padding: 0 1.25rem 1.5rem; }
      .room-layout { padding: 0 1.25rem 4rem; }
      .room-stats { flex-wrap: wrap; gap: 1rem; }
    }
  `;
