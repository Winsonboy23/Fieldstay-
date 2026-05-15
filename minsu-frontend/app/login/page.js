export const metadata = { title: "登入 | 山田寓所 FIELDSTAY" };

function getNextPath(next) {
  if (!next || next === "booking") return "/account";
  if (typeof next !== "string" || !next.startsWith("/")) return "/account";
  if (next.startsWith("//")) return "/account";
  return next;
}

export default function Page({ searchParams }) {
  const nextPath = getNextPath(searchParams?.next);
  const encodedNext = encodeURIComponent(nextPath);
  const shouldShowBookingNotice =
    searchParams?.next === "booking" || nextPath.includes("/confirm");
  const errorCode = searchParams?.error;
  const shouldShowLoginError = !!errorCode && errorCode !== "email_not_confirmed";
  const shouldShowUnverifiedNotice = errorCode === "email_not_confirmed";
  const shouldShowRegisteredNotice = searchParams?.registered === "1";
  const shouldShowResetDoneNotice = searchParams?.reset === "1";

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
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    /* LEFT PANEL — brand visual */
    .panel-visual {
      background:
        linear-gradient(
          160deg,
          oklch(24% 0.08 190) 0%,
          oklch(36% 0.12 183) 45%,
          oklch(38% 0.08 130) 80%,
          oklch(34% 0.06 90) 100%
        );
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 3rem;
      position: relative;
      overflow: hidden;
    }

    .panel-visual::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(1px 1px at 20% 25%, rgba(255,255,255,0.3) 0%, transparent 100%),
        radial-gradient(1.5px 1.5px at 70% 18%, rgba(255,255,255,0.2) 0%, transparent 100%),
        radial-gradient(1px 1px at 50% 65%, rgba(255,255,255,0.12) 0%, transparent 100%),
        radial-gradient(2px 2px at 85% 45%, rgba(255,255,255,0.18) 0%, transparent 100%);
      pointer-events: none;
    }

    .panel-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      position: relative;
      z-index: 1;
    }

    .panel-logo .logo-zh { color: white; font-family: var(--font-serif); font-size: 16px; font-weight: 600; letter-spacing: 0.08em; display: block; }
    .panel-logo .logo-en { color: rgba(255,255,255,0.45); font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; display: block; margin-top: 2px; }

    .panel-quote {
      position: relative;
      z-index: 1;
    }

    .panel-quote blockquote {
      font-family: var(--font-serif);
      font-size: clamp(1.4rem, 3vw, 2rem);
      font-weight: 600;
      color: white;
      line-height: 1.5;
      letter-spacing: 0.03em;
      margin-bottom: 1rem;
    }

    .panel-quote cite {
      font-size: 12px;
      color: rgba(255,255,255,0.45);
      letter-spacing: 0.08em;
      font-style: normal;
    }

    /* Decorative hills */
    .panel-hills {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }

    /* RIGHT PANEL — login form */
    .panel-form {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 4rem 3rem;
      background: var(--surface);
    }

    .form-wrap {
      width: 100%;
      max-width: 380px;
    }

    .form-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .form-header h1 {
      font-family: var(--font-serif);
      font-size: 1.7rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .form-header p {
      font-size: 14px;
      color: var(--muted);
      line-height: 1.7;
    }

    /* Context notice (when coming from booking) */
    .context-notice {
      background: oklch(96% 0.015 183);
      border: 1px solid oklch(82% 0.04 183);
      border-radius: 10px;
      padding: 0.9rem 1rem;
      font-size: 13px;
      color: oklch(36% 0.10 183);
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      margin-bottom: 2rem;
    }

    .context-notice svg { flex-shrink: 0; margin-top: 1px; }

    .login-error {
      background: oklch(96% 0.03 25);
      border: 1px solid oklch(72% 0.16 25);
      border-radius: 10px;
      padding: 0.75rem 0.9rem;
      color: oklch(45% 0.16 25);
      font-size: 13px;
      margin-bottom: 1rem;
    }

    /* Divider */
    .divider {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1.25rem 0;
      font-size: 12px;
      color: var(--muted);
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    /* Email form */
    .form-group { margin-bottom: 1rem; }

    .form-group label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
      color: var(--fg);
    }

    .form-group input {
      width: 100%;
      padding: 11px 14px;
      border: 1.5px solid var(--border);
      border-radius: 9px;
      font-size: 14px;
      font-family: var(--font-sans);
      color: var(--fg);
      background: var(--bg);
      outline: none;
      transition: border-color 0.2s;
    }

    .form-group input:focus {
      border-color: var(--accent);
      background: white;
    }

    .form-extras {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      font-size: 13px;
    }

    .form-extras label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--muted);
      cursor: pointer;
    }

    .form-extras a {
      color: var(--accent);
      text-decoration: none;
      font-size: 13px;
    }

    .form-extras a:hover { text-decoration: underline; }

    .btn-submit {
      width: 100%;
      padding: 13px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-family: var(--font-serif);
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      margin-bottom: 1.25rem;
    }

    .btn-submit:hover { background: var(--accent-d); }

    .form-footer {
      text-align: center;
      font-size: 13px;
      color: var(--muted);
    }

    .form-footer a { color: var(--accent); text-decoration: none; }
    .form-footer a:hover { text-decoration: underline; }

    .form-terms {
      text-align: center;
      font-size: 11px;
      color: oklch(65% 0.006 80);
      line-height: 1.7;
      margin-top: 2rem;
    }

    .form-terms a { color: var(--muted); text-decoration: underline; }

    /* Mobile: stack panels */
    @media (max-width: 768px) {
      body { grid-template-columns: 1fr; }
      .panel-visual { display: none; }
      .panel-form { padding: 3rem 1.5rem; min-height: 100vh; }
    }
  ` }} />
      <div className="login-body" dangerouslySetInnerHTML={{ __html: `

  <!-- LEFT: Visual Panel -->
  <div class="panel-visual">
    <a href="/" class="panel-logo">
      <svg width="40" height="40" viewBox="0 0 38 38" fill="none" aria-hidden="true">
        <circle cx="19" cy="19" r="19" fill="rgba(255,255,255,0.15)"/>
        <path d="M6 28 C9 28 13 16 19 19.5 C25 16 29 28 32 28 Z" fill="white" opacity="0.9"/>
        <path d="M23.5 13 L24.4 15.5 L27 16.4 L24.4 17.3 L23.5 19.8 L22.6 17.3 L20 16.4 L22.6 15.5 Z" fill="white"/>
      </svg>
      <div>
        <span class="logo-zh">山田寓所</span>
        <span class="logo-en">FIELDSTAY</span>
      </div>
    </a>

    <!-- Decorative hills SVG -->
    <svg class="panel-hills" viewBox="0 0 600 200" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      <path d="M0 200 C50 200 100 120 200 140 C300 160 350 80 450 100 C520 115 570 200 600 200 Z" fill="rgba(255,255,255,0.05)"/>
      <path d="M0 200 C80 200 140 150 250 160 C360 170 420 130 500 145 C560 156 590 200 600 200 Z" fill="rgba(255,255,255,0.04)"/>
    </svg>

    <div class="panel-quote">
      <blockquote>
        「離開城市的最好方式<br>是找回田間生活的節奏」
      </blockquote>
      <cite>— 山田寓所 FIELDSTAY</cite>
    </div>
  </div>

  <!-- RIGHT: Login Form -->
  <div class="panel-form">
    <div class="form-wrap">

      <div class="form-header">
        <h1>歡迎回來</h1>
        <p>登入後即可管理訂單、查看入住資訊</p>
      </div>

      <div class="login-error" style="display:${shouldShowLoginError ? "block" : "none"};">
        Email 或密碼錯誤，請重新確認。
      </div>
      <div class="login-error" style="display:${shouldShowUnverifiedNotice ? "block" : "none"}; background: oklch(96% 0.04 80); border-color: oklch(70% 0.14 80); color: oklch(45% 0.16 80);">
        此帳號尚未完成 email 驗證，請至信箱點擊確認連結後再登入。
      </div>
      <div class="login-error" style="display:${shouldShowRegisteredNotice ? "block" : "none"}; background: oklch(96% 0.03 148); border-color: oklch(70% 0.12 148); color: oklch(36% 0.12 148);">
        註冊成功！我們已將驗證信寄到你的信箱，點擊連結完成驗證後即可登入。
      </div>
      <div class="login-error" style="display:${shouldShowResetDoneNotice ? "block" : "none"}; background: oklch(96% 0.03 148); border-color: oklch(70% 0.12 148); color: oklch(36% 0.12 148);">
        密碼已重設，請用新密碼登入。
      </div>

      <!-- Booking context notice (shown when coming from booking flow) -->
      <div class="context-notice" id="contextNotice" style="display:${shouldShowBookingNotice ? "flex" : "none"};">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2"/>
          <path d="M8 7v4M8 5h.01" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        <span>請先登入以完成訂房，登入後將自動返回訂房頁面</span>
      </div>

      <!-- Email Form -->
      <form method="post" action="/login/email?next=${encodedNext}">
        <div class="form-group">
          <label for="email">電子郵件</label>
          <input type="email" id="email" name="email" placeholder="your@email.com" required autocomplete="email">
        </div>
        <div class="form-group">
          <label for="password">密碼</label>
          <input type="password" id="password" name="password" placeholder="••••••••" required autocomplete="current-password">
        </div>

        <div class="form-extras">
          <label>
            <input type="checkbox" checked>
            記住我
          </label>
          <a href="/forgot-password">忘記密碼？</a>
        </div>

        <button class="btn-submit" type="submit">登入</button>
      </form>

      <p class="form-footer">
        還沒有帳號？<a href="/register">立即註冊</a>
      </p>

      <p class="form-terms">
        登入即代表您同意我們的<a href="#">服務條款</a>及<a href="#">隱私政策</a>
      </p>

    </div>
  </div>

` }} />

    </>
  );
}
