import fs from "fs";
import path from "path";
import { getRooms, getActivities, getSettings } from "./_lib/data-service";
import { auth } from "./_lib/auth";

export const metadata = { title: "山田寓所 FIELDSTAY — 田間民宿訂房" };

const bannerExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function getBannerImages() {
  const publicDir = path.join(process.cwd(), "public");

  try {
    return fs
      .readdirSync(publicDir)
      .filter((file) => {
        const lowerFile = file.toLowerCase();
        return (
          lowerFile.startsWith("banner") &&
          bannerExtensions.has(path.extname(lowerFile))
        );
      })
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((file) => `/${file}`);
  } catch {
    return [];
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getRoomType(maxCapacity) {
  if (maxCapacity <= 3) return "double";
  if (maxCapacity <= 7) return "family";
  return "whole";
}

function getRoomTypeLabel(type) {
  if (type === "double") return "雙人";
  if (type === "family") return "家庭";
  return "包棟";
}

function getRoomBadge(type) {
  if (type === "double") return "立即訂房";
  if (type === "family") return "立即訂房";
  return "詢問包棟";
}

export default async function Page() {
  const session = await auth();
  const settings = (await getSettings().catch(() => ({}))) || {};
  const brandName = settings.brand_name_zh || "山田寓所";
  const brandTagline = settings.brand_tagline || "FIELDSTAY";
  const logoUrl = settings.logo_url || "";
  const lineUrl = settings.line_url || "";
  const threadsUrl = settings.threads_url || "";
  const instagramUrl = settings.instagram_url || "";
  const contactEmail = settings.contact_email || "";
  const contactPhone = settings.contact_phone || "";
  const settingsBanners = Array.isArray(settings.banner_images)
    ? settings.banner_images.filter(Boolean)
    : [];
  const rooms = await getRooms();
  const featuredRooms = rooms.slice(0, 4);
  const allActivities = await getActivities();
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingActivities = allActivities
    .filter((a) => String(a.activity_date) >= todayStr)
    .sort((a, b) =>
      String(a.activity_date).localeCompare(String(b.activity_date))
    )
    .slice(0, 3);
  const activityCardsHtml = upcomingActivities
    .map((a) => {
      const title = escapeHtml(a.title || "");
      const summary = escapeHtml(a.summary || "");
      const category = escapeHtml(a.category || "活動");
      const date = escapeHtml(a.activity_date || "");
      const start = escapeHtml(String(a.start_time || "").slice(0, 5));
      const end = escapeHtml(String(a.end_time || "").slice(0, 5));
      const timeLabel = start && end ? `${start} – ${end}` : "";
      const price = Number(a.price || 0).toLocaleString("zh-TW");
      const thumbStyle = a.image
        ? `background-image: url('${escapeHtml(a.image)}'); background-size: cover; background-position: center;`
        : `background: linear-gradient(155deg, oklch(38% 0.10 162) 0%, oklch(54% 0.12 152) 100%);`;
      return `
        <a class="exp-card" href="/activities/${a.id}">
          <div class="exp-thumb" style="${thumbStyle}">
            <span class="exp-cat">${category}</span>
          </div>
          <div class="exp-body">
            <div class="exp-date">${date}${timeLabel ? ` · ${timeLabel}` : ""}</div>
            <h3>${title}</h3>
            <p>${summary}</p>
            <div class="exp-foot">
              <span class="exp-price">NT$${price}</span>
              <span class="exp-cta">查看詳情 →</span>
            </div>
          </div>
        </a>
      `;
    })
    .join("");
  const userName = session?.user?.name || session?.user?.email || "";
  const authActionHtml = session?.user
    ? `<a href="/account" class="btn btn-primary">${escapeHtml(userName)}</a>`
    : `<a href="/login" class="btn btn-primary">登入</a>`;
  const roomCardsHtml = featuredRooms
    .map((room) => {
      const type = getRoomType(room.maxCapacity);
      const displayPrice = Number(room.regularPrice) - Number(room.discount || 0);
      const roomName = escapeHtml(room.name);
      const roomImage = escapeHtml(room.image || "");

      return `
        <a class="room-card" href="/rooms/${room.id}" data-type="${type}" aria-label="${roomName}，NT$${displayPrice}起">
          <div class="room-thumb" style="background-image: linear-gradient(120deg, rgba(0,0,0,0.20), rgba(0,0,0,0.35)), url('${roomImage}'); background-size: cover; background-position: center;"></div>
          <div class="room-body">
            <h3>${roomName}</h3>
            <p class="room-meta">最多 ${room.maxCapacity} 位</p>
            <div class="room-foot">
              <div class="room-price">NT$${displayPrice} <sub>/ 夜</sub></div>
              <span class="btn btn-primary btn-sm">${getRoomBadge(type)}</span>
            </div>
          </div>
        </a>
      `;
    })
    .join("");
  const heroImages = settingsBanners.length > 0 ? settingsBanners : getBannerImages();
  const heroDuration = Math.max(heroImages.length, 1) * 6;
  const brandNameSafe = escapeHtml(brandName);
  const brandTaglineSafe = escapeHtml(brandTagline);
  const logoUrlSafe = escapeHtml(logoUrl);
  const navLogoMarkHtml = logoUrl
    ? `<img src="${logoUrlSafe}" alt="${brandNameSafe}" style="width:38px;height:38px;object-fit:contain;border-radius:50%;" />`
    : `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
        <circle cx="19" cy="19" r="19" fill="oklch(44% 0.13 183)"/>
        <path d="M6 28 C9 28 13 16 19 19.5 C25 16 29 28 32 28 Z" fill="white" opacity="0.95"/>
        <path d="M23.5 13 L24.4 15.5 L27 16.4 L24.4 17.3 L23.5 19.8 L22.6 17.3 L20 16.4 L22.6 15.5 Z" fill="white"/>
      </svg>`;
  const footerLogoMarkHtml = logoUrl
    ? `<img src="${logoUrlSafe}" alt="${brandNameSafe}" style="width:36px;height:36px;object-fit:contain;border-radius:50%;background:rgba(255,255,255,0.05);" />`
    : `<svg width="36" height="36" viewBox="0 0 38 38" fill="none" aria-hidden="true">
        <circle cx="19" cy="19" r="19" fill="oklch(44% 0.13 183)" opacity="0.6"/>
        <path d="M6 28 C9 28 13 16 19 19.5 C25 16 29 28 32 28 Z" fill="white" opacity="0.8"/>
        <path d="M23.5 13 L24.4 15.5 L27 16.4 L24.4 17.3 L23.5 19.8 L22.6 17.3 L20 16.4 L22.6 15.5 Z" fill="white" opacity="0.8"/>
      </svg>`;
  const socialItems = [
    instagramUrl && {
      href: instagramUrl,
      label: "Instagram",
      svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>`,
    },
    threadsUrl && {
      href: threadsUrl,
      label: "Threads",
      svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <circle cx="12" cy="12" r="4"/>
        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
      </svg>`,
    },
    lineUrl && {
      href: lineUrl,
      label: "LINE",
      svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.494.25l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.628-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
      </svg>`,
    },
  ].filter(Boolean);
  const socialListHtml = socialItems
    .map(
      (s) =>
        `<li><a href="${escapeHtml(s.href)}" target="_blank" rel="noopener noreferrer" aria-label="${s.label}">${s.svg}</a></li>`
    )
    .join("");
  const mailIconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`;
  const phoneIconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
  const contactBlockHtml =
    contactEmail || contactPhone
      ? `<ul class="footer-contact">
          ${contactEmail ? `<li><a href="mailto:${escapeHtml(contactEmail)}">${mailIconSvg}<span>${escapeHtml(contactEmail)}</span></a></li>` : ""}
          ${contactPhone ? `<li><a href="tel:${escapeHtml(contactPhone.replace(/\s+/g, ""))}">${phoneIconSvg}<span>${escapeHtml(contactPhone)}</span></a></li>` : ""}
        </ul>`
      : "";
  const heroSlidesHtml = heroImages
    .map(
      (image, index) => `
        <div
          class="hero-slide"
          style="background-image: url('${escapeHtml(image)}'); --hero-duration: ${heroDuration}s; animation-delay: ${index * 6}s;"
          aria-hidden="true"
        ></div>
      `
    )
    .join("");

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
      --font-serif: Georgia, serif;
      --font-sans:  system-ui, sans-serif;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--bg);
      color: var(--fg);
      font-family: var(--font-sans);
      font-size: 15px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    /* ── NAV ─────────────────────────────────────── */
    .nav {
      position: sticky;
      top: 0;
      z-index: 200;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2.5rem;
      background: rgba(253, 251, 249, 0.92);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }

    .nav-logo {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      text-decoration: none;
    }

    .logo-wordmark {
      display: flex;
      flex-direction: column;
      line-height: 1;
    }

    .logo-zh {
      font-family: var(--font-serif);
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: var(--fg);
    }

    .logo-en {
      font-size: 9px;
      letter-spacing: 0.22em;
      color: var(--muted);
      text-transform: uppercase;
      margin-top: 2px;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 2.2rem;
      list-style: none;
    }

    .nav-links a {
      color: var(--muted);
      text-decoration: none;
      font-size: 14px;
      font-weight: 400;
      letter-spacing: 0.02em;
      transition: color 0.2s;
    }

    .nav-links a:hover { color: var(--fg); }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-family: var(--font-sans);
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .btn-ghost {
      border: 1px solid var(--border);
      background: transparent;
      color: var(--fg);
    }

    .btn-ghost:hover {
      border-color: var(--fg);
      background: var(--fg);
      color: var(--surface);
    }

    .btn-primary {
      background: var(--accent);
      color: white;
      border: 1px solid transparent;
    }

    .btn-primary:hover { background: var(--accent-d); }

    /* ── HERO ────────────────────────────────────── */
    .hero {
      position: relative;
      min-height: calc(100vh - 64px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 6rem 2rem 8rem;
      overflow: hidden;
      background: oklch(24% 0.08 190);
    }

    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 1;
      background:
        linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.36) 48%, rgba(0,0,0,0.46) 100%),
        radial-gradient(circle at 50% 42%, rgba(0,0,0,0.08), rgba(0,0,0,0.42));
      pointer-events: none;
    }

    .hero-slides {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .hero-slide {
      position: absolute;
      inset: 0;
      opacity: 0;
      background-position: center;
      background-size: cover;
      animation: heroFade var(--hero-duration, 18s) infinite ease-in-out;
      transform: scale(1.03);
    }


    @keyframes heroFade {
      0% { opacity: 0; }
      8% { opacity: 1; }
      34% { opacity: 1; }
      44% { opacity: 0; }
      100% { opacity: 0; }
    }

    .hero-content {
      position: relative;
      z-index: 3;
      max-width: 700px;
      width: 100%;
    }

    .hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 11px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.55);
      margin-bottom: 1.5rem;
    }

    .hero-eyebrow svg { opacity: 0.6; }

    .hero h1 {
      font-family: var(--font-serif);
      font-size: clamp(2.4rem, 6vw, 4rem);
      font-weight: 700;
      color: white;
      line-height: 1.15;
      letter-spacing: 0.04em;
      margin-bottom: 1.2rem;
    }

    .hero-sub {
      font-size: 15px;
      color: rgba(255,255,255,0.68);
      line-height: 1.9;
      margin-bottom: 3rem;
      font-weight: 300;
    }

    /* ── SEARCH WIDGET ──────────────────────────── */
    .search-widget {
      display: flex;
      align-items: center;
      background: var(--surface);
      border-radius: 16px;
      padding: 6px 6px 6px 0;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
    }

    .sw-field {
      flex: 1;
      padding: 12px 20px;
      text-align: start;
      cursor: pointer;
      border-radius: 12px;
      transition: background 0.15s;
    }

    .sw-field:hover { background: var(--bg); }

    .sw-field label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      color: var(--fg);
      margin-bottom: 3px;
      cursor: pointer;
    }

    .sw-field input,
    .sw-field select {
      border: none;
      background: transparent;
      font-size: 13px;
      color: var(--muted);
      font-family: var(--font-sans);
      outline: none;
      width: 100%;
      padding: 0;
      cursor: pointer;
    }

    .sw-divider {
      width: 1px;
      height: 36px;
      background: var(--border);
      flex-shrink: 0;
    }

    .sw-btn {
      padding: 14px 26px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-family: var(--font-serif);
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-inline-start: 6px;
      transition: background 0.2s;
      flex-shrink: 0;
    }

    .sw-btn:hover { background: var(--accent-d); }

    /* ── SECTIONS ───────────────────────────────── */
    .section { padding: 80px 2.5rem; scroll-margin-top: 80px; }
    .section-alt { background: var(--surface); }
    .container { max-width: 1200px; margin: 0 auto; }

    /* 房型選擇 / 田間體驗 色塊區分 */
    #rooms {
      background: oklch(94% 0.018 75);
      padding: 110px 2.5rem;
      margin-bottom: 40px;
    }
    #experience {
      background: var(--surface);
      padding: 110px 2.5rem;
      margin-top: 40px;
    }
    #transport {
      background: oklch(94% 0.018 75);
      padding: 110px 2.5rem;
      margin-top: 40px;
    }

    /* ── HAMBURGER ──────────────────────────────── */
    .nav-toggle {
      display: none;
      width: 40px;
      height: 40px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface);
      cursor: pointer;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    .nav-toggle span,
    .nav-toggle span::before,
    .nav-toggle span::after {
      display: block;
      width: 18px;
      height: 2px;
      background: var(--fg);
      border-radius: 2px;
      position: relative;
      transition: transform 0.2s, opacity 0.2s;
    }
    .nav-toggle span::before,
    .nav-toggle span::after {
      content: '';
      position: absolute;
      left: 0;
    }
    .nav-toggle span::before { top: -6px; }
    .nav-toggle span::after { top: 6px; }
    .nav-toggle[aria-expanded="true"] span { background: transparent; }
    .nav-toggle[aria-expanded="true"] span::before { top: 0; transform: rotate(45deg); }
    .nav-toggle[aria-expanded="true"] span::after { top: 0; transform: rotate(-45deg); }

    .mobile-menu {
      display: none;
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      z-index: 199;
      padding: 1rem 1.25rem 1.5rem;
      box-shadow: 0 12px 28px rgba(0,0,0,0.08);
    }
    .mobile-menu.open { display: block; }
    .mobile-menu ul { list-style: none; display: flex; flex-direction: column; gap: 0.25rem; }
    .mobile-menu a {
      display: block;
      padding: 12px 8px;
      color: var(--fg);
      text-decoration: none;
      font-size: 15px;
      border-bottom: 1px solid var(--border);
    }
    .mobile-menu .mobile-actions {
      display: flex;
      gap: 0.6rem;
      margin-top: 1rem;
    }
    .mobile-menu .mobile-actions .btn { flex: 1; justify-content: center; }

    .section-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 2rem;
    }

    .section-title {
      font-family: var(--font-serif);
      font-size: clamp(1.4rem, 2.5vw, 1.9rem);
      font-weight: 700;
      line-height: 1.2;
    }

    .section-title small {
      display: block;
      font-family: var(--font-sans);
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 0.5rem;
    }

    .see-all {
      font-size: 13px;
      color: var(--muted);
      text-decoration: none;
      letter-spacing: 0.02em;
      transition: color 0.2s;
    }

    .see-all:hover { color: var(--accent); }

    /* ── FILTER TABS ─────────────────────────────── */
    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }

    .filter-tab {
      padding: 7px 18px;
      border-radius: 24px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--muted);
      font-size: 13px;
      font-family: var(--font-sans);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-tab.active,
    .filter-tab:hover {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }

    /* ── ROOM GRID ───────────────────────────────── */
    .room-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
      gap: 1.5rem;
    }

    .room-card {
      display: block;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .room-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.07);
    }

    .room-card[style*="display: none"] { display: none !important; }

    .room-thumb {
      height: 196px;
      position: relative;
      display: flex;
      align-items: flex-end;
      padding: 1rem;
    }

    .room-body { padding: 1.25rem; }

    .room-body h3 {
      font-family: var(--font-serif);
      font-size: 1.05rem;
      font-weight: 600;
      margin-bottom: 0.3rem;
      letter-spacing: 0.01em;
    }

    .room-meta {
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 0.9rem;
    }

    .room-amenities {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      margin-bottom: 1rem;
    }

    .amenity {
      font-size: 11px;
      color: var(--muted);
      background: var(--bg);
      padding: 3px 8px;
      border-radius: 4px;
    }

    .room-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.9rem;
      border-top: 1px solid var(--border);
    }

    .room-price {
      font-family: var(--font-serif);
      font-size: 1.1rem;
      font-weight: 700;
    }

    .room-price sub {
      font-family: var(--font-sans);
      font-size: 11px;
      font-weight: 400;
      color: var(--muted);
    }

    .btn-sm {
      padding: 7px 14px;
      border-radius: 7px;
      font-size: 12px;
      font-weight: 500;
    }

    /* ── EXPERIENCE GRID ─────────────────────────── */
    .exp-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .exp-card {
      display: block;
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      background: var(--bg);
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .exp-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.07);
    }

    .exp-thumb {
      height: 168px;
      position: relative;
      display: flex;
      align-items: flex-start;
      padding: 0.75rem;
    }

    .exp-cat {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      background: rgba(0,0,0,0.55);
      color: white;
      font-size: 11px;
      letter-spacing: 0.08em;
      border-radius: 999px;
    }

    .exp-body { padding: 1.25rem; }

    .exp-date {
      font-size: 11px;
      color: var(--accent);
      letter-spacing: 0.06em;
      font-weight: 600;
      margin-bottom: 0.4rem;
    }

    .exp-body h3 {
      font-family: var(--font-serif);
      font-size: 1.05rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .exp-body p {
      font-size: 13px;
      color: var(--muted);
      line-height: 1.75;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .exp-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.9rem;
      padding-top: 0.9rem;
      border-top: 1px solid var(--border);
    }

    .exp-price {
      font-family: var(--font-serif);
      font-size: 1rem;
      font-weight: 700;
    }

    .exp-cta {
      font-size: 12px;
      color: var(--accent);
      font-weight: 500;
    }

    /* ── ABOUT BAND ──────────────────────────────── */
    .about-band {
      background: var(--accent);
      color: white;
      padding: 80px 2.5rem;
    }

    .about-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5rem;
      align-items: center;
    }

    .about-copy h2 {
      font-family: var(--font-serif);
      font-size: clamp(1.5rem, 3vw, 2.2rem);
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 1.2rem;
    }

    .about-copy p {
      font-size: 15px;
      line-height: 1.9;
      opacity: 0.8;
      margin-bottom: 1rem;
    }

    .about-copy p:last-of-type { margin-bottom: 1.75rem; }

    .btn-outline {
      display: inline-flex;
      padding: 10px 24px;
      border: 1.5px solid rgba(255,255,255,0.55);
      border-radius: 8px;
      color: white;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-outline:hover {
      background: white;
      color: var(--accent);
      border-color: white;
    }

    .about-visual {
      height: 340px;
      border-radius: 12px;
      background: oklch(38% 0.11 180);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-serif);
      font-size: 1rem;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.3);
      border: 1px solid rgba(255,255,255,0.1);
    }

    /* ── FOOTER ──────────────────────────────────── */
    footer {
      background: oklch(14% 0.014 80);
      color: white;
      padding: 64px 2.5rem 36px;
    }
    footer a { color: white; }

    .footer-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 3rem;
      padding-bottom: 2.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      margin-bottom: 2rem;
    }

    .footer-social { display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 1rem; }
    .footer-contact {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      text-align: right;
    }
    .footer-col .footer-contact li { margin: 0; }
    .footer-contact a {
      color: white;
      text-decoration: none;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: opacity 0.2s;
    }
    .footer-contact a:hover { opacity: 0.75; }
    .footer-contact svg { flex-shrink: 0; }
    .footer-social .social-list {
      list-style: none;
      display: flex;
      gap: 1rem;
    }
    .footer-social .social-list a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      transition: background 0.2s, color 0.2s;
    }
    .footer-social .social-list a:hover {
      background: rgba(255,255,255,0.18);
      color: white;
    }
    @media (max-width: 768px) {
      .footer-social { align-items: flex-start; }
      .footer-contact { text-align: left; }
    }

    .footer-brand-logo .logo-zh { color: white; }
    .footer-brand-logo .logo-en { color: rgba(255,255,255,0.35); }

    .footer-desc {
      font-size: 13px;
      line-height: 1.75;
      margin-top: 1rem;
      max-width: 200px;
    }

    .footer-col h4 {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: white;
      margin-bottom: 1rem;
    }

    .footer-col ul { list-style: none; }

    .footer-col li { margin-bottom: 0.6rem; }

    .footer-col a {
      color: white;
      text-decoration: none;
      font-size: 13px;
      transition: opacity 0.2s;
    }

    .footer-col a:hover { opacity: 0.75; }

    .footer-bottom {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: center;
      font-size: 12px;
      color: white;
    }

    /* ── RESPONSIVE ──────────────────────────────── */
    @media (max-width: 1024px) {
      .exp-grid { grid-template-columns: repeat(2, 1fr); }
      .footer-grid { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 768px) {
      .nav { padding: 0 1.25rem; }
      .nav-links { display: none; }
      .nav-actions .btn-ghost { display: none; }
      .nav-toggle { display: inline-flex; }
      #rooms, #experience, #transport { padding: 60px 1.25rem; }
      .hero { padding: 4rem 1.25rem 6rem; min-height: calc(100vh - 64px); }
      .hero h1 { font-size: 2.2rem; }
      .search-widget {
        flex-direction: column;
        border-radius: 12px;
        padding: 6px;
      }
      .sw-field { width: 100%; border-radius: 8px; }
      .sw-divider { width: 100%; height: 1px; }
      .sw-btn { width: 100%; justify-content: center; margin-inline-start: 0; border-radius: 8px; }
      .section { padding: 48px 1.25rem; }
      .room-grid { grid-template-columns: 1fr; }
      .exp-grid { grid-template-columns: 1fr; }
      .about-inner { grid-template-columns: 1fr; gap: 2rem; }
      .about-visual { display: none; }
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
      .footer-bottom { flex-direction: column; gap: 0.5rem; }
    }
  ` }} />
      <div dangerouslySetInnerHTML={{ __html: `

  <!-- ═══ NAV ═══════════════════════════════════════ -->
  <nav class="nav">
    <a href="/" class="nav-logo">
      ${navLogoMarkHtml}
      <div class="logo-wordmark">
        <span class="logo-zh">${brandNameSafe}</span>
        ${brandTaglineSafe ? `<span class="logo-en">${brandTaglineSafe}</span>` : ""}
      </div>
    </a>

    <ul class="nav-links">
      <li><a href="#rooms">房型選擇</a></li>
      <li><a href="#experience">田間體驗</a></li>
      <li><a href="#about">關於我們</a></li>
      <li><a href="#transport">交通資訊</a></li>
    </ul>

    <div class="nav-actions">
      <a href="/account" class="btn btn-ghost">會員中心</a>
      ${authActionHtml}
      <button class="nav-toggle" id="navToggle" aria-label="開啟選單" aria-expanded="false" aria-controls="mobileMenu">
        <span></span>
      </button>
    </div>
  </nav>

  <div class="mobile-menu" id="mobileMenu" role="menu" aria-label="行動版選單">
    <ul>
      <li><a href="#rooms">房型選擇</a></li>
      <li><a href="#experience">田間體驗</a></li>
      <li><a href="#about">關於我們</a></li>
      <li><a href="#transport">交通資訊</a></li>
    </ul>
    <div class="mobile-actions">
      <a href="/account" class="btn btn-ghost">會員中心</a>
      ${authActionHtml}
    </div>
  </div>

  <!-- ═══ HERO ════════════════════════════════════════ -->
  <section class="hero">
    <div class="hero-slides">
      ${heroSlidesHtml}
    </div>
    <div class="hero-content">
      <div class="hero-eyebrow">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="5" stroke="rgba(255,255,255,0.55)" stroke-width="1"/>
          <circle cx="6" cy="6" r="1.5" fill="rgba(255,255,255,0.55)"/>
        </svg>
        台南市 · 田間民宿 · 體驗農村生活
      </div>

      <h1>山田之間<br>生活的起點</h1>
      <p class="hero-sub">
        在傳統磚瓦老屋中，感受台灣土地的四季節奏<br>
        與我們共度一段慢速的田間時光
      </p>

    </div>
  </section>

  <!-- ═══ ROOMS ════════════════════════════════════════ -->
  <section class="section" id="rooms">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">
          <small>ROOMS &amp; STAYS</small>
          房型選擇
        </h2>
        <a href="/rooms" class="see-all">查看全部房型 →</a>
      </div>

      <div class="room-grid" id="roomGrid">
        ${roomCardsHtml}
      </div>
    </div>
  </section>

  <!-- ═══ EXPERIENCE ════════════════════════════════════ -->
  <section class="section section-alt" id="experience">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">
          <small>FIELD ACTIVITIES</small>
          田間體驗
        </h2>
        <a href="/activities" class="see-all">查看所有活動 →</a>
      </div>

      <div class="exp-grid">
        ${activityCardsHtml || '<p style="color:var(--muted);">目前沒有即將舉辦的活動。</p>'}
      </div>
    </div>
  </section>

  <!-- ═══ TRANSPORT ════════════════════════════════════ -->
  <section class="section" id="transport">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">
          <small>TRANSPORT · 抵達方式</small>
          交通資訊
        </h2>
      </div>
      <div style="border-radius:12px;overflow:hidden;border:1px solid var(--border);background:var(--surface);">
        <iframe
          title="山田寓所交通地圖"
          src="https://www.google.com/maps?q=台南市&output=embed"
          width="100%"
          height="420"
          style="border:0;display:block;"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </section>

  <!-- ═══ ABOUT BAND ════════════════════════════════════ -->
  <section class="about-band" id="about">
    <div class="about-inner">
      <div class="about-copy">
        <h2>田間的家<br>慢速的生活</h2>
        <p>山田寓所坐落於台南農村，以百年磚瓦老屋為本，提供一個回歸土地的落腳之所。我們相信，離開城市的最好方式，是找回田間生活的節奏。</p>
        <p>這裡不是度假村，是一個讓你真正放慢腳步、親近農事、體驗節氣文化的地方。</p>
        <a href="#" class="btn-outline">了解我們的故事</a>
      </div>
      <div class="about-visual" aria-hidden="true">
        — 老屋影像 —
      </div>
    </div>
  </section>

  <!-- ═══ FOOTER ════════════════════════════════════════ -->
  <footer>
    <div class="footer-grid">
      <div>
        <a href="/" class="nav-logo footer-brand-logo" style="text-decoration:none;">
          ${footerLogoMarkHtml}
          <div class="logo-wordmark">
            <span class="logo-zh">${brandNameSafe}</span>
            ${brandTaglineSafe ? `<span class="logo-en">${brandTaglineSafe}</span>` : ""}
          </div>
        </a>
        <p class="footer-desc">台南農村民宿，提供田間體驗與住宿，感受節氣文化與土地連結。</p>
      </div>

      <div class="footer-col footer-social">
        ${socialListHtml ? `<ul class="social-list">${socialListHtml}</ul>` : ""}
        ${contactBlockHtml}
      </div>
    </div>

    <div class="footer-bottom">
      <span>© 2026 ${brandNameSafe}${brandTaglineSafe ? ` ${brandTaglineSafe}` : ""} · 版權所有</span>
    </div>
  </footer>

  <script>
    window.filterRooms = function filterRooms(type, btn) {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.room-card').forEach(card => {
        card.style.display = (type === 'all' || card.dataset.type === type) ? 'block' : 'none';
      });
    }

  </script>
` }} />
      <script dangerouslySetInnerHTML={{ __html: `
    (function() {
      var btn = document.getElementById('navToggle');
      var menu = document.getElementById('mobileMenu');
      if (btn && menu) {
        btn.addEventListener('click', function() {
          var open = menu.classList.toggle('open');
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
          btn.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
        });
        menu.querySelectorAll('a').forEach(function(a) {
          a.addEventListener('click', function() {
            menu.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', '開啟選單');
          });
        });
      }
    })();

  ` }} />
    </>
  );
}
