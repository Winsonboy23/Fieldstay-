import fs from "fs";
import path from "path";
import { getRooms, getActivities, getSettings } from "./_lib/data-service";
import { auth } from "./_lib/auth";
import HomeInteractions from "./_components/HomeInteractions";
import SiteFooter from "./_components/SiteFooter";

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
  const BRAND_LOGO_URL =
    "https://wnvqbozqsdvaszfgumkg.supabase.co/storage/v1/object/public/site-images/1778689945313-0.1766648174384008-528684274_18019731992746464_3668865358020989427_n--1-.jpg";
  const navLogoMarkHtml = `<img src="${BRAND_LOGO_URL}" alt="${brandNameSafe}" style="width:38px;height:38px;object-fit:contain;border-radius:50%;" />`;
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
      --brand-color: oklch(44% 0.13 183);
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
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 200;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2.5rem;
      background: transparent;
      border-bottom: none;
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
      color: white;
      padding-bottom: 0.25rem;
    }

    .logo-en {
      font-size: 9px;
      letter-spacing: 0.22em;
      color: rgba(255, 255, 255, 0.72);
      text-transform: uppercase;
      margin-top: 2px;
    }

    .nav-links {
      margin-left: auto;
      margin-right: 1rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      list-style: none;
      padding: 8px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.22);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-radius: 999px;
    }

    .nav-links a {
      color: white;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.02em;
      padding: 8px 18px;
      border-radius: 999px;
      transition: background 0.2s, color 0.2s;
    }

    .nav-links a:hover,
    .nav-links a.active {
      background: var(--brand-color);
      color: white;
    }

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

    .nav .btn-ghost {
      border-color: rgba(255, 255, 255, 0.45);
      background: transparent;
      color: white;
    }
    .nav .btn-ghost:hover {
      background: rgba(255, 255, 255, 0.18);
      border-color: white;
      color: white;
    }
    .nav .btn-primary {
      background: rgba(255, 255, 255, 0.92);
      color: var(--fg);
      border: 1px solid transparent;
    }
    .nav .btn-primary:hover { background: white; }

    .user-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      color: white;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.22);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      text-decoration: none;
      transition: background 0.2s;
    }
    .user-icon:hover {
      background: rgba(30, 30, 30, 0.78);
    }

    /* nav state after scrolling past hero */
    .nav.scrolled {
      background: rgba(253, 251, 249, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }
    .nav.scrolled .logo-zh { color: var(--fg); }
    .nav.scrolled .logo-en { color: var(--muted); }
    .nav.scrolled .nav-links {
      background: rgba(0, 0, 0, 0.04);
      border-color: rgba(0, 0, 0, 0.08);
    }
    .nav.scrolled .nav-links a { color: var(--fg); }
    .nav.scrolled .nav-links a:hover,
    .nav.scrolled .nav-links a.active {
      background: var(--brand-color);
      color: white;
    }
    .nav.scrolled .user-icon {
      color: var(--fg);
      background: rgba(0, 0, 0, 0.04);
      border-color: rgba(0, 0, 0, 0.08);
    }
    .nav.scrolled .user-icon:hover {
      background: var(--fg);
      color: white;
    }

    /* ── HERO ────────────────────────────────────── */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
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
      color: white;
      margin-bottom: 1.5rem;
    }

    .hero-eyebrow svg { opacity: 1; }

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
      color: white;
      line-height: 1.9;
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
    .section {
      padding: 80px 2.5rem;
      scroll-margin-top: 80px;
      min-height: 80vh;
      display: flex;
      align-items: center;
    }
    .section-alt { background: var(--surface); }
    .container { max-width: 1200px; margin: 0 auto; width: 100%; }

    /* 房型選擇 / 田間體驗 色塊區分 */
    #rooms {
      background: oklch(94% 0.018 75);
    }
    #experience {
      background: var(--surface);
    }
    #transport {
      background: oklch(94% 0.018 75);
    }

    /* ── HAMBURGER ──────────────────────────────── */
    .nav-toggle {
      display: none !important;
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

    /* ── TRANSPORT ───────────────────────────────── */
    .transport-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    .transport-eyebrow {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.22em;
      color: var(--brand-color);
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    .transport-title {
      font-family: var(--font-serif);
      font-size: clamp(1.8rem, 3vw, 2.4rem);
      font-weight: 700;
      color: var(--fg);
    }

    .transport-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: stretch;
    }

    .transport-map {
      position: relative;
      min-height: 100%;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border);
      background: var(--surface);
    }
    .transport-map iframe {
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
    }

    .transport-info {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .info-block { display: flex; flex-direction: column; gap: 0.5rem; }
    .info-eyebrow {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.22em;
      color: var(--muted);
      text-transform: uppercase;
    }
    .info-main {
      font-family: var(--font-serif);
      font-size: 16px;
      font-weight: 600;
      color: var(--fg);
    }
    .info-sub {
      font-size: 12px;
      color: var(--muted);
      line-height: 1.7;
    }

    /* ── ABOUT BAND ──────────────────────────────── */
    .about-band {
      background: white;
      color: var(--fg);
      padding: 80px 2.5rem;
      min-height: 70dvh;
      display: flex;
      align-items: center;
    }

    .about-inner {
      max-width: 1200px;
      width: 100%;
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
      color: var(--muted);
      margin-bottom: 1rem;
    }
    .about-copy p.about-eyebrow { color: var(--brand-color); }

    .about-copy p:last-of-type { margin-bottom: 1.75rem; }

    .btn-outline {
      display: inline-flex;
      padding: 10px 24px;
      border: 1.5px solid var(--brand-color);
      border-radius: 8px;
      color: var(--brand-color);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-outline:hover {
      background: var(--brand-color);
      color: white;
      border-color: var(--brand-color);
    }

    .about-visual {
      height: 420px;
      border-radius: 12px;
      overflow: hidden;
      background: oklch(38% 0.11 180);
    }
    .about-visual img {
      width: 100%;
      height: 135%;
      object-fit: cover;
      display: block;
      will-change: transform;
      transform: translate3d(0, -12%, 0);
    }

    /* Section reveal (fade-up stagger) */
    .about-band .about-copy > *,
    .about-band .about-visual,
    .section .container > * {
      opacity: 0;
      transform: translateY(18px);
      transition: opacity 0.8s ease, transform 0.8s ease;
    }
    .about-band .about-visual {
      transform: translateY(24px) scale(1.04);
      transition: opacity 1s ease, transform 1s ease;
    }
    .about-band.in-view .about-copy > *,
    .section.in-view .container > * {
      opacity: 1;
      transform: none;
    }
    .about-band.in-view .about-visual {
      opacity: 1;
      transform: scale(1);
    }
    .about-band .about-copy > *:nth-child(1),
    .section .container > *:nth-child(1) { transition-delay: 0ms; }
    .about-band .about-copy > *:nth-child(2),
    .section .container > *:nth-child(2) { transition-delay: 120ms; }
    .about-band .about-copy > *:nth-child(3),
    .section .container > *:nth-child(3) { transition-delay: 240ms; }
    .about-band .about-copy > *:nth-child(4),
    .section .container > *:nth-child(4) { transition-delay: 360ms; }
    .about-band .about-visual { transition-delay: 150ms; }

    /* grid 本身不漸入，由內部 cards 自己 stagger */
    .section .container > .room-grid,
    .section .container > .exp-grid {
      opacity: 1;
      transform: none;
      transition: none;
    }
    .section .room-grid > *,
    .section .exp-grid > *,
    .section .transport-info > * {
      opacity: 0;
      transform: translateY(-60px);
      transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .section.in-view .room-grid > *,
    .section.in-view .exp-grid > *,
    .section.in-view .transport-info > * {
      opacity: 1;
      transform: none;
    }
    .section.in-view .room-grid > *:nth-child(1),
    .section.in-view .exp-grid > *:nth-child(1),
    .section.in-view .transport-info > *:nth-child(1) { transition-delay: 200ms; }
    .section.in-view .room-grid > *:nth-child(2),
    .section.in-view .exp-grid > *:nth-child(2),
    .section.in-view .transport-info > *:nth-child(2) { transition-delay: 320ms; }
    .section.in-view .room-grid > *:nth-child(3),
    .section.in-view .exp-grid > *:nth-child(3),
    .section.in-view .transport-info > *:nth-child(3) { transition-delay: 440ms; }
    .section.in-view .room-grid > *:nth-child(4),
    .section.in-view .exp-grid > *:nth-child(4),
    .section.in-view .transport-info > *:nth-child(4) { transition-delay: 560ms; }

    @media (prefers-reduced-motion: reduce) {
      .about-band .about-copy > *,
      .about-band .about-visual,
      .section .container > *,
      .section .room-grid > *,
      .section .exp-grid > *,
      .section .transport-info > *,
      .about-visual img {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
      }
    }

    .about-eyebrow {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.22em;
      color: var(--brand-color);
      text-transform: uppercase;
      margin-bottom: 1rem;
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
      .user-icon { display: none; }
      #rooms, #experience, #transport { padding: 60px 1.25rem; }
      .hero { padding: 4rem 1.25rem 6rem; min-height: 100dvh; }
      .hero h1 { font-size: 2.2rem; }
      .search-widget {
        flex-direction: column;
        border-radius: 12px;
        padding: 6px;
      }
      .sw-field { width: 100%; border-radius: 8px; }
      .sw-divider { width: 100%; height: 1px; }
      .sw-btn { width: 100%; justify-content: center; margin-inline-start: 0; border-radius: 8px; }
      .section, .about-band { padding: 48px 1.25rem; min-height: auto; display: block; }
      .about-inner { grid-template-columns: 1fr; gap: 2rem; }
      .transport-grid { grid-template-columns: 1fr; gap: 2rem; }
      .transport-map { aspect-ratio: 1 / 1; min-height: 0; }
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
      .footer-bottom { flex-direction: column; gap: 0.5rem; }

      /* about-band: 圖片變整塊背景、文字版型不變直接壓上 */
      .about-band {
        position: relative;
        overflow: hidden;
        min-height: 70dvh;
        padding: 48px 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .about-band .about-inner {
        position: static;
        display: block;
        width: 100%;
      }
      /* 圖片進場動畫的 scale / translateY 在手機關掉，避免視覺位移 */
      .about-band .about-visual,
      .about-band.in-view .about-visual {
        display: block;
        position: absolute;
        inset: 0;
        z-index: 0;
        height: 100%;
        border-radius: 0;
        background: #000;
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
      }
      .about-band .about-visual img {
        width: 100%;
        height: 100%;
        will-change: object-position;
        object-fit: cover;
        object-position: 0% center;
        transform: none;
      }
      .about-band .about-copy {
        position: relative;
        z-index: 2;
        padding: 1.5rem 1.25rem;
        border-radius: 8px;
        background: linear-gradient(180deg,
          rgba(0,0,0,0.45) 0%,
          rgba(0,0,0,0.6) 100%);
      }
      .about-band .about-copy h2,
      .about-band .about-copy p,
      .about-band .about-copy .about-eyebrow {
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
      }
      .about-band .about-copy .btn-outline {
        color: white;
        border-color: rgba(255, 255, 255, 0.8);
      }
      .about-band .about-copy .btn-outline:hover {
        background: white;
        color: var(--brand-color);
        border-color: white;
      }

      /* room / exp 卡片改成手機輪轉，露出下一張 */
      .room-grid,
      .exp-grid {
        display: flex;
        grid-template-columns: none;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        gap: 0.75rem;
        padding: 0 1.25rem;
        margin: 0 -1.25rem;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
      }
      .room-grid::-webkit-scrollbar,
      .exp-grid::-webkit-scrollbar { display: none; }
      .room-grid > *,
      .exp-grid > * {
        flex: 0 0 85%;
        scroll-snap-align: start;
      }

      .carousel-dots {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1.4rem;
      }
      .carousel-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: none;
        background: rgba(0, 0, 0, 0.15);
        padding: 0;
        cursor: pointer;
        transition: background 0.2s, transform 0.2s;
      }
      .carousel-dot.active {
        background: var(--brand-color);
        transform: scale(1.25);
      }
    }
    /* 桌機隱藏 dots */
    @media (min-width: 769px) {
      .carousel-dots { display: none; }
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
      <li><a href="#about">關於我們</a></li>
      <li><a href="#rooms">房型選擇</a></li>
      <li><a href="#experience">田間體驗</a></li>
      <li><a href="#transport">交通資訊</a></li>
    </ul>

    <div class="nav-actions">
      <a href="/account" class="user-icon" aria-label="會員中心">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </a>
      <button class="nav-toggle" id="navToggle" aria-label="開啟選單" aria-expanded="false" aria-controls="mobileMenu">
        <span></span>
      </button>
    </div>
  </nav>

  <div class="mobile-menu" id="mobileMenu" role="menu" aria-label="行動版選單">
    <ul>
      <li><a href="#about">關於我們</a></li>
      <li><a href="#rooms">房型選擇</a></li>
      <li><a href="#experience">田間體驗</a></li>
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
        台中大甲 · 田間民宿 · 體驗農村生活
      </div>

      <h1>山田之間<br>生活的起點</h1>
      <p class="hero-sub">
        在傳統磚瓦老屋中，感受台灣土地的四季節奏<br>
        與我們共度一段慢速的田間時光
      </p>

    </div>
  </section>

  <!-- ═══ ABOUT BAND ════════════════════════════════════ -->
  <section class="about-band" id="about">
    <div class="about-inner">
      <div class="about-copy">
        <h2>在老屋裡，讓時間變慢</h2>
        <p class="about-eyebrow">STOP AND SMELL THE EARTH.</p>
        <p>山田寓所是一座結合住宿、咖啡、藝術課程與社區導覽的生活實驗場。我們以設計與美感教育，串起土地、風土飲食與人之間的連結。</p>
        <a href="/about" class="btn-outline">了解我們的故事</a>
      </div>
      <div class="about-visual">
        <img src="/about-1.jpg" alt="老屋影像" />
      </div>
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

      <div class="room-grid" id="roomGrid" data-carousel>
        ${roomCardsHtml}
      </div>
      <div class="carousel-dots" data-dots-for="roomGrid">
        ${featuredRooms.map((_, i) => `<button type="button" class="carousel-dot${i === 0 ? " active" : ""}" data-idx="${i}" aria-label="第 ${i + 1} 張"></button>`).join("")}
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

      <div class="exp-grid" id="expGrid" data-carousel>
        ${activityCardsHtml || '<p style="color:var(--muted);">目前沒有即將舉辦的活動。</p>'}
      </div>
      ${upcomingActivities.length ? `<div class="carousel-dots" data-dots-for="expGrid">
        ${upcomingActivities.map((_, i) => `<button type="button" class="carousel-dot${i === 0 ? " active" : ""}" data-idx="${i}" aria-label="第 ${i + 1} 張"></button>`).join("")}
      </div>` : ""}
    </div>
  </section>

  <!-- ═══ TRANSPORT ════════════════════════════════════ -->
  <section class="section" id="transport">
    <div class="container">
      <div class="transport-header">
        <p class="transport-eyebrow">交通與聯絡 · VISIT US</p>
        <h2 class="transport-title">交通資訊</h2>
      </div>

      <div class="transport-grid">
        <div class="transport-map">
          <iframe
            title="山田寓所地圖"
            src="https://www.google.com/maps?q=山田寓所&output=embed"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
          ></iframe>
        </div>

        <div class="transport-info">
          <div class="info-block">
            <p class="info-eyebrow">地址 · ADDRESS</p>
            <p class="info-main">台南市後壁區後山里田心 23 號</p>
            <p class="info-sub">抵達前 24 小時將以 LINE 提供詳細導引</p>
          </div>

          <div class="info-block">
            <p class="info-eyebrow">聯絡 · CONTACT</p>
            <p class="info-main">LINE：@fieldstay　・　電話：06-XXX-XXXX</p>
            <p class="info-sub">週一至週日 09:00–20:00（建議優先以 LINE 聯繫）</p>
          </div>

          <div class="info-block">
            <p class="info-eyebrow">大眾運輸 · BY TRANSIT</p>
            <p class="info-main">新營高鐵站 → 計程車 18 分鐘</p>
            <p class="info-sub">或搭 7211 公車於「土溝」站下車，步行 12 分鐘</p>
          </div>

          <div class="info-block">
            <p class="info-eyebrow">自駕 · BY CAR</p>
            <p class="info-main">國道 1 號 → 新營交流道 → 172 縣道</p>
            <p class="info-sub">提供 4 個免費停車位，包棟住客優先</p>
          </div>
        </div>
      </div>
    </div>
  </section>

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
      <SiteFooter />
      <HomeInteractions />
    </>
  );
}
