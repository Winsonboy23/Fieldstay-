import fs from "fs";
import path from "path";
import { getRooms } from "./_lib/data-service";
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
  const rooms = await getRooms();
  const featuredRooms = rooms.slice(0, 4);
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
  const heroImages = getBannerImages();
  const heroDuration = Math.max(heroImages.length, 1) * 6;
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
      --font-serif: 'Noto Serif TC', 'Georgia', 'Iowan Old Style', serif;
      --font-sans:  'Noto Sans TC', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
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
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      background: var(--bg);
    }

    .exp-thumb { height: 168px; }

    .exp-body { padding: 1.25rem; }

    .exp-body h3 {
      font-family: var(--font-serif);
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .exp-body p {
      font-size: 13px;
      color: var(--muted);
      line-height: 1.75;
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
      color: rgba(255,255,255,0.55);
      padding: 64px 2.5rem 36px;
    }

    .footer-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.6fr 1fr 1fr 1fr;
      gap: 3rem;
      padding-bottom: 2.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      margin-bottom: 2rem;
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
      color: rgba(255,255,255,0.85);
      margin-bottom: 1rem;
    }

    .footer-col ul { list-style: none; }

    .footer-col li { margin-bottom: 0.6rem; }

    .footer-col a {
      color: rgba(255,255,255,0.45);
      text-decoration: none;
      font-size: 13px;
      transition: color 0.2s;
    }

    .footer-col a:hover { color: white; }

    .footer-bottom {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: rgba(255,255,255,0.25);
    }

    /* ── RESPONSIVE ──────────────────────────────── */
    @media (max-width: 1024px) {
      .exp-grid { grid-template-columns: repeat(2, 1fr); }
      .footer-grid { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 768px) {
      .nav { padding: 0 1.25rem; }
      .nav-links { display: none; }
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
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
        <circle cx="19" cy="19" r="19" fill="oklch(44% 0.13 183)"/>
        <path d="M6 28 C9 28 13 16 19 19.5 C25 16 29 28 32 28 Z" fill="white" opacity="0.95"/>
        <path d="M23.5 13 L24.4 15.5 L27 16.4 L24.4 17.3 L23.5 19.8 L22.6 17.3 L20 16.4 L22.6 15.5 Z" fill="white"/>
      </svg>
      <div class="logo-wordmark">
        <span class="logo-zh">山田寓所</span>
        <span class="logo-en">FIELDSTAY</span>
      </div>
    </a>

    <ul class="nav-links">
      <li><a href="#rooms">房型選擇</a></li>
      <li><a href="#experience">田間體驗</a></li>
      <li><a href="#about">關於我們</a></li>
      <li><a href="#">交通資訊</a></li>
    </ul>

    <div class="nav-actions">
      <a href="/account" class="btn btn-ghost">會員中心</a>
      ${authActionHtml}
    </div>
  </nav>

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

      <!-- Search Widget -->
      <div class="search-widget" role="search">
        <div class="sw-field">
          <label for="checkin">入住日期</label>
          <input type="date" id="checkin" value="2026-05-10" aria-label="入住日期">
        </div>
        <div class="sw-divider" aria-hidden="true"></div>
        <div class="sw-field">
          <label for="checkout">退房日期</label>
          <input type="date" id="checkout" value="2026-05-12" aria-label="退房日期">
        </div>
        <div class="sw-divider" aria-hidden="true"></div>
        <div class="sw-field">
          <label for="guests">房客人數</label>
          <select id="guests" aria-label="房客人數">
            <option>1 位大人</option>
            <option selected>2 位大人</option>
            <option>2 大人 1 兒童</option>
            <option>4 位大人</option>
          </select>
        </div>
        <button class="sw-btn" id="searchBtn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" stroke="white" stroke-width="1.5"/>
            <path d="M10.5 10.5 L14 14" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          查詢空房
        </button>
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

      <div class="filter-tabs" role="tablist" aria-label="房型篩選">
        <button class="filter-tab active" onclick="filterRooms('all', this)" role="tab">全部</button>
        <button class="filter-tab" onclick="filterRooms('double', this)" role="tab">雙人</button>
        <button class="filter-tab" onclick="filterRooms('family', this)" role="tab">家庭</button>
        <button class="filter-tab" onclick="filterRooms('whole', this)" role="tab">包棟</button>
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
        <a href="/activities" class="see-all">查看活動行事曆 →</a>
      </div>

      <div class="exp-grid">
        <div class="exp-card">
          <div class="exp-thumb" style="background: linear-gradient(155deg, oklch(42% 0.08 72) 0%, oklch(58% 0.10 80) 100%);"></div>
          <div class="exp-body">
            <h3>傳統炊粿體驗</h3>
            <p>使用百年大灶，與長輩一起學習傳統紅龜粿、草仔粿的製作，感受節氣食物文化的溫度。每次 2 小時，需提前預約。</p>
          </div>
        </div>
        <div class="exp-card">
          <div class="exp-thumb" style="background: linear-gradient(155deg, oklch(38% 0.10 162) 0%, oklch(52% 0.11 152) 100%);"></div>
          <div class="exp-body">
            <h3>農事體驗 · 米食文化</h3>
            <p>跟隨農人認識稻米生長週期，親手體驗農事勞作，了解台灣農村的日常節奏與土地間流傳的智慧。</p>
          </div>
        </div>
        <div class="exp-card">
          <div class="exp-thumb" style="background: linear-gradient(155deg, oklch(36% 0.10 28) 0%, oklch(50% 0.12 35) 100%);"></div>
          <div class="exp-body">
            <h3>節氣料理工作坊</h3>
            <p>依二十四節氣設計的手作課程，每月主題各異。結合在地農產，製作最應時節的傳統風味食物。</p>
          </div>
        </div>
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
          <svg width="36" height="36" viewBox="0 0 38 38" fill="none" aria-hidden="true">
            <circle cx="19" cy="19" r="19" fill="oklch(44% 0.13 183)" opacity="0.6"/>
            <path d="M6 28 C9 28 13 16 19 19.5 C25 16 29 28 32 28 Z" fill="white" opacity="0.8"/>
            <path d="M23.5 13 L24.4 15.5 L27 16.4 L24.4 17.3 L23.5 19.8 L22.6 17.3 L20 16.4 L22.6 15.5 Z" fill="white" opacity="0.8"/>
          </svg>
          <div class="logo-wordmark">
            <span class="logo-zh">山田寓所</span>
            <span class="logo-en">FIELDSTAY</span>
          </div>
        </a>
        <p class="footer-desc">台南農村民宿，提供田間體驗與住宿，感受節氣文化與土地連結。</p>
      </div>

      <div class="footer-col">
        <h4>住宿</h4>
        <ul>
          <li><a href="rooms/1">房型介紹</a></li>
          <li><a href="#">訂房須知</a></li>
          <li><a href="#">取消政策</a></li>
          <li><a href="#">包棟洽詢</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>體驗</h4>
        <ul>
          <li><a href="#">炊粿體驗</a></li>
          <li><a href="#">農事體驗</a></li>
          <li><a href="#">節氣料理</a></li>
          <li><a href="#">活動行事曆</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>聯絡</h4>
        <ul>
          <li><a href="#">關於我們</a></li>
          <li><a href="#">交通資訊</a></li>
          <li><a href="#">Instagram</a></li>
          <li><a href="#">LINE 客服</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© 2026 山田寓所 FIELDSTAY · 版權所有</span>
      <span>台南市 · 隱私政策 · 服務條款</span>
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

    document.getElementById('searchBtn')?.addEventListener('click', function() {
      const checkin  = document.getElementById('checkin').value;
      const checkout = document.getElementById('checkout').value;
      const guests   = document.getElementById('guests').value;
      if (!checkin || !checkout) { alert('請選擇入住與退房日期'); return; }
      if (new Date(checkout) <= new Date(checkin)) { alert('退房日期須晚於入住日期'); return; }
      window.location.href = 'rooms/1?checkin=' + encodeURIComponent(checkin)
        + '&checkout=' + encodeURIComponent(checkout)
        + '&guests=' + encodeURIComponent(guests);
    });
  </script>
` }} />
      <script dangerouslySetInnerHTML={{ __html: `
    window.filterRooms = function filterRooms(type, btn) {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.room-card').forEach(card => {
        card.style.display = (type === 'all' || card.dataset.type === type) ? 'block' : 'none';
      });
    }

    document.getElementById('searchBtn')?.addEventListener('click', function() {
      const checkin  = document.getElementById('checkin').value;
      const checkout = document.getElementById('checkout').value;
      const guests   = document.getElementById('guests').value;
      if (!checkin || !checkout) { alert('請選擇入住與退房日期'); return; }
      if (new Date(checkout) <= new Date(checkin)) { alert('退房日期須晚於入住日期'); return; }
      window.location.href = 'rooms/1?checkin=' + encodeURIComponent(checkin)
        + '&checkout=' + encodeURIComponent(checkout)
        + '&guests=' + encodeURIComponent(guests);
    });
  ` }} />
    </>
  );
}
