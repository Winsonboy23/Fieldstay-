export const pageStyle = `

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
      --warn:     oklch(56% 0.16 56);
      --success:  oklch(50% 0.14 148);
      --warm-block: #f5efe8;
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

    /* ── NAV ─────────────────────────────────────── */
    .nav {
      position: sticky; top: 0; z-index: 200; height: 64px;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 2.5rem;
      background: rgba(253, 251, 249, 0.92);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .nav-logo { display: flex; align-items: center; gap: 0.7rem; text-decoration: none; }
    .logo-wordmark { display: flex; flex-direction: column; line-height: 1; }
    .logo-zh { font-family: var(--font-serif); font-size: 15px; font-weight: 600; letter-spacing: 0.08em; color: var(--fg); }
    .logo-en { font-size: 9px; letter-spacing: 0.22em; color: var(--muted); text-transform: uppercase; margin-top: 2px; }
    .nav-links { display: flex; align-items: center; gap: 2.2rem; list-style: none; }
    .nav-links a { color: var(--muted); text-decoration: none; font-size: 14px; letter-spacing: 0.02em; transition: color 0.2s; }
    .nav-links a:hover, .nav-links a.active { color: var(--fg); }
    .nav-links a.active { font-weight: 500; }
    .nav-actions { display: flex; align-items: center; gap: 0.75rem; }
    .btn {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 8px 18px; border-radius: 8px;
      font-size: 14px; font-family: var(--font-sans); font-weight: 500;
      cursor: pointer; text-decoration: none;
      transition: all 0.2s; white-space: nowrap;
      border: 1px solid transparent;
    }
    .btn-ghost { border-color: var(--border); background: transparent; color: var(--fg); }
    .btn-ghost:hover { border-color: var(--fg); background: var(--fg); color: var(--surface); }
    .btn-primary { background: var(--accent); color: white; }
    .btn-primary:hover { background: var(--accent-d); }
    .btn-primary:disabled { background: var(--border); color: var(--muted); cursor: not-allowed; }

    /* ── HERO ────────────────────────────────────── */
    .hero {
      position: relative;
      padding: 5rem 2.5rem 7rem;
      overflow: hidden;
      background:
        linear-gradient(180deg,
          oklch(34% 0.10 145) 0%,
          oklch(40% 0.11 130) 45%,
          oklch(46% 0.10 110) 80%,
          oklch(50% 0.09 100) 100%);
      color: white;
    }
    .hero::before {
      content: '';
      position: absolute; inset: 0;
      background-image:
        radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 100%),
        radial-gradient(1.5px 1.5px at 78% 18%, rgba(255,255,255,0.22) 0%, transparent 100%),
        radial-gradient(1px 1px at 58% 70%, rgba(255,255,255,0.16) 0%, transparent 100%),
        radial-gradient(2px 2px at 12% 80%, rgba(255,255,255,0.18) 0%, transparent 100%);
      pointer-events: none;
    }
    .hero::after {
      content: '';
      position: absolute; bottom: -1px; left: 0; right: 0;
      height: 80px;
      background: var(--warm-block);
      clip-path: ellipse(60% 100% at 50% 100%);
    }
    .hero-inner {
      position: relative; z-index: 1;
      max-width: 1200px; margin: 0 auto;
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 4rem; align-items: end;
    }
    .hero-eyebrow {
      display: inline-flex; align-items: center; gap: 0.5rem;
      font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
      color: rgba(255,255,255,0.6); margin-bottom: 1.5rem;
    }
    .hero h1 {
      font-family: var(--font-serif);
      font-size: clamp(2.2rem, 5vw, 3.4rem);
      font-weight: 700; line-height: 1.18;
      letter-spacing: 0.04em; margin-bottom: 1.2rem;
    }
    .hero-sub {
      font-size: 15px; line-height: 1.9;
      color: rgba(255,255,255,0.72);
      max-width: 480px; font-weight: 300;
    }
    .solar-card {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.16);
      border-radius: 14px;
      padding: 1.5rem 1.75rem;
      backdrop-filter: blur(8px);
      max-width: 360px;
    }
    .solar-card-label {
      font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
      color: rgba(255,255,255,0.55); margin-bottom: 0.75rem;
    }
    .solar-card-name {
      display: flex; align-items: baseline; gap: 0.7rem;
      font-family: var(--font-serif);
      margin-bottom: 0.6rem;
    }
    .solar-card-name .zh { font-size: 1.9rem; font-weight: 700; letter-spacing: 0.06em; }
    .solar-card-name .en { font-size: 11px; letter-spacing: 0.22em; opacity: 0.5; text-transform: uppercase; }
    .solar-card-meta { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 1rem; }
    .solar-card-poem {
      font-family: var(--font-serif); font-size: 13px;
      line-height: 1.9; color: rgba(255,255,255,0.78);
      border-top: 1px solid rgba(255,255,255,0.12);
      padding-top: 1rem;
    }

    /* ── BREADCRUMB ───────────────────────────────── */
    .breadcrumb {
      max-width: none; margin: 0;
      padding: 1.25rem calc((100% - 1200px) / 2 + 2.5rem) 0;
      font-size: 13px; color: var(--muted);
      display: flex; gap: 0.5rem; align-items: center;
      background: var(--warm-block);
    }
    .breadcrumb a { color: var(--muted); text-decoration: none; }
    .breadcrumb a:hover { color: var(--accent); }
    .breadcrumb span { opacity: 0.4; }

    /* ── SECTIONS ─────────────────────────────────── */
    .section { padding: 64px 2.5rem; background: var(--warm-block); }
    .section-alt { background: var(--surface); }
    .container { max-width: 1200px; margin: 0 auto; }

    .section-header {
      display: flex; align-items: flex-end;
      justify-content: space-between; margin-bottom: 2rem;
      flex-wrap: wrap; gap: 1rem;
    }
    .section-title {
      font-family: var(--font-serif);
      font-size: clamp(1.4rem, 2.5vw, 1.9rem);
      font-weight: 700; line-height: 1.2;
    }
    .section-title small {
      display: block; font-family: var(--font-sans);
      font-size: 10px; font-weight: 500;
      letter-spacing: 0.22em; text-transform: uppercase;
      color: var(--accent); margin-bottom: 0.5rem;
    }

    /* ── FEATURED EVENT CARD ──────────────────────── */
    .featured {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.04);
    }
    .featured-img {
      min-height: 380px;
      background: var(--warm-block);
      position: relative;
      display: flex; align-items: flex-start; padding: 1.5rem;
    }
    .featured-badge {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 6px 12px; border-radius: 6px;
      background: rgba(255,255,255,0.92);
      color: var(--fg); font-size: 11px; font-weight: 600;
      letter-spacing: 0.1em;
    }
    .featured-badge::before {
      content: ''; width: 6px; height: 6px; border-radius: 50%;
      background: var(--accent2);
    }
    .featured-body {
      padding: 2.25rem 2.5rem;
      display: flex; flex-direction: column;
      justify-content: center;
    }
    .featured-tag {
      font-size: 11px; letter-spacing: 0.18em;
      text-transform: uppercase; color: var(--accent);
      margin-bottom: 0.75rem;
    }
    .featured-body h2 {
      font-family: var(--font-serif);
      font-size: 1.85rem; font-weight: 700;
      line-height: 1.25; margin-bottom: 1rem;
      letter-spacing: 0.02em;
    }
    .featured-body p {
      color: var(--muted); font-size: 14px;
      line-height: 1.85; margin-bottom: 1.5rem;
    }
    .featured-meta {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem; padding: 1rem 0;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      margin-bottom: 1.5rem;
    }
    .meta-item-label {
      font-size: 10px; letter-spacing: 0.16em;
      text-transform: uppercase; color: var(--muted);
      margin-bottom: 0.25rem;
    }
    .meta-item-value {
      font-family: var(--font-serif);
      font-size: 14px; font-weight: 600;
      letter-spacing: 0.02em;
    }
    .featured-actions { display: flex; gap: 0.5rem; align-items: center; }
    .featured-actions .btn { padding: 11px 22px; }

    /* ── FILTER ROW ───────────────────────────────── */
    .filter-row {
      display: flex; align-items: center;
      gap: 0.75rem; flex-wrap: wrap;
      margin: 2rem 0 1.5rem;
    }
    .filter-tabs {
      display: flex; gap: 0.4rem;
      flex-wrap: wrap; flex: 1;
    }
    .filter-tab {
      padding: 7px 16px; border-radius: 24px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--muted);
      font-size: 13px; font-family: var(--font-sans);
      font-weight: 500; cursor: pointer;
      transition: all 0.2s;
    }
    .filter-tab.active, .filter-tab:hover {
      background: var(--accent); color: white; border-color: var(--accent);
    }
    .sort-select {
      padding: 7px 12px; border-radius: 20px;
      border: 1px solid var(--border);
      background: var(--surface);
      font-family: var(--font-sans); font-size: 13px;
      color: var(--fg); cursor: pointer;
    }

    /* ── ACTIVITY GRID ────────────────────────────── */
    .activity-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 1.5rem;
    }

    .act-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      display: flex; flex-direction: column;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .act-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 32px rgba(0,0,0,0.07);
    }

    .act-thumb {
      height: 184px; position: relative;
      display: flex; align-items: flex-start;
      padding: 1rem; gap: 0.5rem;
    }
    .act-tag {
      padding: 4px 10px; border-radius: 6px;
      font-size: 11px; font-weight: 600;
      letter-spacing: 0.04em;
      background: rgba(255,255,255,0.93);
      color: var(--fg);
    }
    .act-fav {
      margin-inline-start: auto;
      width: 32px; height: 32px;
      border-radius: 50%;
      background: rgba(255,255,255,0.93);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .act-fav:hover { background: white; transform: scale(1.05); }
    .act-fav.faved svg { fill: var(--accent2); stroke: var(--accent2); }

    .act-body {
      padding: 1.25rem 1.25rem 0;
      flex: 1;
      display: flex; flex-direction: column;
    }
    .act-date {
      font-family: var(--font-serif);
      display: flex; align-items: baseline;
      gap: 0.5rem; margin-bottom: 0.6rem;
    }
    .act-date .day {
      font-size: 1.7rem; font-weight: 700;
      letter-spacing: 0.02em; line-height: 1;
    }
    .act-date .month {
      font-size: 11px; letter-spacing: 0.18em;
      text-transform: uppercase; color: var(--muted);
    }
    .act-date .time {
      margin-inline-start: auto; font-family: var(--font-sans);
      font-size: 12px; color: rgba(255,255,255,0.25);
      letter-spacing: 0.04em;
    }

    .act-card h3 {
      font-family: var(--font-serif);
      font-size: 1.05rem; font-weight: 600;
      letter-spacing: 0.02em;
      margin-bottom: 0.4rem;
    }
    .act-desc {
      font-size: 13px; color: var(--muted);
      line-height: 1.7; margin-bottom: 0.9rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .act-info {
      display: flex; gap: 1rem;
      font-size: 12px; color: var(--muted);
      margin-bottom: 1rem;
    }
    .act-info span { display: inline-flex; align-items: center; gap: 0.3rem; }
    .act-info svg { opacity: 0.6; }

    .act-foot {
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 0.9rem 1.25rem;
      border-top: 1px solid var(--border);
      margin-top: auto;
    }
    .act-price {
      font-family: var(--font-serif);
      font-size: 1.05rem; font-weight: 700;
    }
    .act-price sub {
      font-family: var(--font-sans);
      font-size: 11px; font-weight: 400;
      color: var(--muted);
    }
    .seat-tag {
      font-size: 11px; letter-spacing: 0.04em;
      padding: 3px 8px; border-radius: 4px;
    }
    .seat-tag.ok    { color: var(--success); background: oklch(92% 0.04 148); }
    .seat-tag.few   { color: var(--warn);    background: oklch(94% 0.04 56); }
    .seat-tag.full  { color: var(--muted);   background: var(--bg); }
    .btn-sm { padding: 7px 14px; border-radius: 7px; font-size: 12px; font-weight: 500; }

    /* ── INFO BAND ────────────────────────────────── */
    .info-band {
      background: var(--accent);
      color: white;
      padding: 64px 2.5rem;
    }
    .info-inner {
      max-width: 1200px; margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 3rem;
    }
    .info-block h3 {
      font-family: var(--font-serif);
      font-size: 1.05rem; font-weight: 600;
      margin-bottom: 0.6rem;
      letter-spacing: 0.04em;
    }
    .info-block p {
      font-size: 13px; line-height: 1.85;
      color: rgba(255,255,255,0.72);
    }
    .info-num {
      font-family: var(--font-serif);
      font-size: 11px; letter-spacing: 0.22em;
      color: var(--muted);
      margin-bottom: 0.75rem;
      text-transform: uppercase;
    }

    /* ── CTA BAND ─────────────────────────────────── */
    .cta-band {
      padding: 80px 2.5rem;
      text-align: center;
      background: var(--warm-block);
    }
    .cta-band h2 {
      font-family: var(--font-serif);
      font-size: clamp(1.5rem, 3vw, 2.1rem);
      font-weight: 700; line-height: 1.3;
      margin-bottom: 1rem;
    }
    .cta-band p {
      color: var(--muted);
      max-width: 520px; margin: 0 auto 1.75rem;
      line-height: 1.85;
    }
    .cta-form {
      display: flex; gap: 0.5rem;
      max-width: 460px; margin: 0 auto;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 6px;
    }
    .cta-form input {
      flex: 1; border: none; background: transparent;
      font-family: var(--font-sans); font-size: 14px;
      padding: 8px 12px; outline: none;
      color: var(--fg);
    }
    .cta-form button {
      background: var(--accent); color: white;
      border: none; border-radius: 8px;
      padding: 9px 22px; font-size: 14px;
      font-family: var(--font-sans); font-weight: 500;
      cursor: pointer; transition: background 0.2s;
    }
    .cta-form button:hover { background: var(--accent-d); }

    /* ── FOOTER ──────────────────────────────────── */
    footer {
      background: oklch(14% 0.014 80);
      color: rgba(255,255,255,0.55);
      padding: 64px 2.5rem 36px;
    }
    .footer-grid {
      max-width: 1200px; margin: 0 auto;
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 3rem;
      padding-bottom: 2.5rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 2rem;
    }
    .footer-brand-logo .logo-zh { color: white; }
    .footer-brand-logo .logo-en { color: rgba(255,255,255,0.35); }
    .footer-desc { font-size: 13px; line-height: 1.75; margin-top: 1rem; max-width: 200px; }
    .footer-col h4 {
      font-size: 11px; font-weight: 600;
      letter-spacing: 0.14em; text-transform: uppercase;
      color: rgba(255,255,255,0.85); margin-bottom: 1rem;
    }
    .footer-col ul { list-style: none; }
    .footer-col li { margin-bottom: 0.6rem; }
    .footer-col a {
      color: rgba(255,255,255,0.45);
      text-decoration: none; font-size: 13px;
      transition: color 0.2s;
    }
    .footer-col a:hover { color: white; }
    .footer-social { display: flex; align-items: center; justify-content: flex-end; }
    .footer-social .social-list { list-style: none; display: flex; gap: 1rem; }
    .footer-social .social-list a {
      display: inline-flex; align-items: center; justify-content: center;
      width: 44px; height: 44px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      transition: background 0.2s, color 0.2s;
    }
    .footer-social .social-list a:hover { background: rgba(255,255,255,0.18); color: white; }
    @media (max-width: 768px) { .footer-social { justify-content: flex-start; } }
    .footer-bottom {
      max-width: 1200px; margin: 0 auto;
      display: flex; justify-content: space-between;
      font-size: 12px; color: var(--muted);
    }

    /* ── TOAST ───────────────────────────────────── */
    .toast {
      position: fixed; bottom: 24px; left: 50%;
      transform: translateX(-50%) translateY(150%);
      background: var(--fg); color: var(--surface);
      padding: 12px 22px; border-radius: 10px;
      font-size: 13px; letter-spacing: 0.02em;
      box-shadow: 0 10px 40px rgba(0,0,0,0.18);
      transition: transform 0.35s cubic-bezier(.6,.2,.1,1.2);
      z-index: 400; pointer-events: none;
    }
    .toast.show { transform: translateX(-50%) translateY(0); }

    /* ── RESPONSIVE ───────────────────────────────── */
    @media (max-width: 1024px) {
      .hero-inner { grid-template-columns: 1fr; gap: 2.5rem; }
      .featured { grid-template-columns: 1fr; }
      .featured-img { min-height: 240px; }
      .info-inner { grid-template-columns: 1fr; gap: 2rem; }
      .footer-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 768px) {
      .nav { padding: 0 1.25rem; }
      .nav-links { display: none; }
      .hero { padding: 3.5rem 1.25rem 5rem; }
      .section { padding: 48px 1.25rem; }
      .breadcrumb { padding: 1rem 1.25rem 0; }
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
      .footer-bottom { flex-direction: column; gap: 0.5rem; }
      .featured-meta { grid-template-columns: 1fr; gap: 0.75rem; }
      .info-band, .cta-band { padding: 56px 1.25rem; }
    }
  `;
