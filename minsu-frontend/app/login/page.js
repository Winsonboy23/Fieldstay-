import BrandMark from "../_components/BrandMark";

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
    .login-page {
      --txt: #ffffff;
      --txt-muted: rgba(255,255,255,0.82);
      --txt-soft: rgba(255,255,255,0.6);
      --font-sans: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      --font-serif: 'Noto Serif TC', Georgia, serif;
      position: fixed;
      inset: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: var(--txt);
      font-family: var(--font-sans);
      background: #1c1814;
      overflow-y: auto;
      -webkit-font-smoothing: antialiased;
    }
    .login-page * { box-sizing: border-box; }
    .login-page .bg {
      position: absolute; inset: 0; z-index: 0;
      background: url('/banner4.jpg') center/cover no-repeat;
    }
    .login-page .bg-overlay {
      position: absolute; inset: 0; z-index: 1; pointer-events: none;
      background: linear-gradient(180deg,
        oklch(38% 0.05 60 / 0.20) 0%,
        oklch(28% 0.06 50 / 0.32) 100%);
    }
    .login-page .bg-noise {
      position: absolute; inset: 0; z-index: 2; pointer-events: none;
      mix-blend-mode: overlay; opacity: 0.5;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }
    .login-page > main { position: relative; z-index: 3; }
    .login-page > .top-bar { z-index: 5; }
    .login-page h1, .login-page p, .login-page a, .login-page span, .login-page label, .login-page button { color: inherit; }
    .login-page input { color: white; }
    .top-bar {
      position: fixed; top: 0; left: 0; right: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.75rem 2.5rem;
      font-size: 12px; letter-spacing: 0.06em;
      color: var(--txt-muted); z-index: 5;
      text-shadow: 0 1px 4px rgba(0,0,0,0.35);
    }
    .top-bar .brand { display: inline-flex; align-items: center; gap: 0.65rem; text-decoration: none; color: white; }
    .top-bar .brand-zh { font-family: var(--font-serif); font-size: 14px; font-weight: 600; letter-spacing: 0.12em; }
    .top-bar .brand-en { font-size: 9px; letter-spacing: 0.22em; color: rgba(255,255,255,0.62); text-transform: uppercase; margin-top: 2px; display: block; }

    .glass {
      position: relative; width: 100%; max-width: 440px;
      padding: 2.5rem 2.5rem 2.25rem; border-radius: 32px;
      background: radial-gradient(ellipse 90% 80% at 50% 50%,
        rgba(255,255,255,0) 0%, rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.06) 100%);
      backdrop-filter: blur(16px) saturate(140%) brightness(1.03);
      -webkit-backdrop-filter: blur(16px) saturate(140%) brightness(1.03);
      border: 1px solid rgba(255,255,255,0.30);
      box-shadow:
        inset 4px 4px 12px 0 rgba(255,255,255,0.25),
        inset -2px -2px 15px 0 rgba(255,255,255,0.25),
        inset 0 0 18px 0 rgba(255,255,255,0.18),
        0 30px 60px -20px rgba(0,0,0,0.45),
        0 8px 24px -8px rgba(0,0,0,0.25);
    }
    .glass::before {
      content: ''; position: absolute; top: 0; left: 8%; right: 8%; height: 26%;
      border-radius: 32px 32px 60% 60% / 32px 32px 100% 100%;
      background: linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.06) 70%, rgba(255,255,255,0) 100%);
      filter: blur(8px); pointer-events: none; opacity: 0.7;
    }
    .glass::after {
      content: ''; position: absolute; bottom: 0; left: 6%; right: 6%; height: 14%;
      border-radius: 60% 60% 32px 32px / 100% 100% 32px 32px;
      background: linear-gradient(0deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%);
      filter: blur(6px); pointer-events: none; opacity: 0.55;
    }
    .glass > * { position: relative; z-index: 1; }

    .form-title {
      font-family: var(--font-serif); font-weight: 700;
      font-size: 2.6rem; letter-spacing: 0.06em; line-height: 1.05;
      margin-bottom: 0.7rem; color: white;
      text-shadow: 0 2px 12px rgba(0,0,0,0.3);
    }
    .form-sub {
      font-size: 14px; color: var(--txt-muted);
      margin-bottom: 1.85rem; letter-spacing: 0.04em; line-height: 1.65;
    }

    .login-notice {
      border-radius: 14px;
      padding: 0.8rem 1rem;
      font-size: 13px;
      margin-bottom: 1.1rem;
      letter-spacing: 0.03em;
      display: flex; align-items: flex-start; gap: 0.55rem;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }
    .login-notice svg { flex-shrink: 0; margin-top: 1px; }
    .login-notice.error { background: rgba(229, 90, 90, 0.18); border: 1px solid rgba(255, 180, 180, 0.4); color: #ffe2e2; }
    .login-notice.warn { background: rgba(229, 175, 90, 0.20); border: 1px solid rgba(255, 220, 160, 0.45); color: #fff1d6; }
    .login-notice.success { background: rgba(120, 200, 130, 0.18); border: 1px solid rgba(190, 240, 200, 0.45); color: #e1ffe4; }
    .login-notice.info { background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.30); color: var(--txt-muted); }

    .field { position: relative; margin-bottom: 0.65rem; }
    .field input {
      width: 100%; padding: 17px 20px 17px 22px;
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,0.28);
      background: rgba(255,255,255,0.06);
      backdrop-filter: blur(8px) saturate(150%);
      -webkit-backdrop-filter: blur(8px) saturate(150%);
      font-family: var(--font-sans); font-size: 14.5px;
      color: white; letter-spacing: 0.04em; outline: none;
      transition: all 0.25s ease;
      box-shadow:
        inset 2px 2px 8px 1px rgba(255,255,255,0.16),
        inset -1px -1px 8px 0 rgba(255,255,255,0.10),
        inset 0 0 10px 1px rgba(255,255,255,0.10);
    }
    .field input::placeholder { color: rgba(255,255,255,0.78); font-weight: 400; }
    .field input:focus {
      border-color: rgba(255,255,255,0.55);
      background: rgba(255,255,255,0.20);
      box-shadow:
        inset 2px 2px 10px 1px rgba(255,255,255,0.26),
        inset -1px -1px 10px 0 rgba(255,255,255,0.18),
        inset 0 0 12px 1px rgba(255,255,255,0.18),
        0 0 0 4px rgba(255,255,255,0.10);
    }
    .field .eye {
      position: absolute; right: 18px; top: 50%;
      transform: translateY(-50%);
      background: transparent; border: none;
      color: rgba(255,255,255,0.65);
      cursor: pointer; padding: 4px;
      display: flex; align-items: center;
      transition: color 0.2s;
    }
    .field .eye:hover { color: white; }

    .row-flex {
      display: flex; align-items: center;
      justify-content: space-between;
      margin: 1rem 0.4rem 1.85rem;
      font-size: 13.5px;
    }
    .check { display: inline-flex; align-items: center; gap: 0.55rem; cursor: pointer; color: var(--txt-muted); user-select: none; }
    .check input { display: none; }
    .check .box {
      width: 16px; height: 16px;
      border: 1.5px solid rgba(255,255,255,0.55);
      border-radius: 4px;
      background: rgba(255,255,255,0.10);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .check input:checked + .box {
      background: rgba(255,255,255,0.95);
      border-color: rgba(255,255,255,0.95);
      color: oklch(36% 0.08 50);
    }
    .check input:not(:checked) + .box svg { opacity: 0; }
    .forgot {
      color: white; text-decoration: underline;
      text-underline-offset: 3px; text-decoration-thickness: 1px;
      letter-spacing: 0.04em; transition: opacity 0.2s;
    }
    .forgot:hover { opacity: 0.78; }

    .submit-wrap { display: flex; justify-content: center; margin-bottom: 1.5rem; }
    .btn-submit {
      min-width: 230px; padding: 15px 32px;
      border-radius: 999px;
      background: rgba(255,255,255,0.10);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1.5px solid rgba(255,255,255,0.62);
      font-family: var(--font-serif);
      font-size: 15.5px; font-weight: 600; letter-spacing: 0.18em;
      color: white; cursor: pointer;
      transition: all 0.25s ease;
      box-shadow:
        inset 2px 2px 10px 1px rgba(255,255,255,0.26),
        inset -1px -1px 10px 0 rgba(255,255,255,0.18),
        inset 0 0 12px 1px rgba(255,255,255,0.18),
        0 8px 24px -8px rgba(0,0,0,0.35);
      display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem;
    }
    .btn-submit:hover {
      background: rgba(255,255,255,0.95);
      color: oklch(28% 0.08 60);
      border-color: white;
      transform: translateY(-1px);
      box-shadow:
        0 12px 32px -8px rgba(0,0,0,0.4),
        inset 0 1.5px 1px rgba(255,255,255,0.9);
    }
    .btn-submit:active { transform: translateY(0); }

    .glass-foot { text-align: center; font-size: 13.5px; color: var(--txt-muted); letter-spacing: 0.04em; }
    .glass-foot a {
      color: white; text-decoration: underline;
      text-underline-offset: 3px; text-decoration-thickness: 1px;
      margin-inline-start: 4px; transition: opacity 0.2s;
    }
    .glass-foot a:hover { opacity: 0.78; }

    @media (max-width: 560px) {
      body { padding: 1rem; }
      .top-bar { padding: 1.25rem 1.5rem; }
      .glass { padding: 2rem 1.75rem 1.75rem; border-radius: 26px; }
      .form-title { font-size: 2rem; }
    }
  ` }} />

      <div className="login-page">
      <div className="bg" aria-hidden="true" />
      <div className="bg-overlay" aria-hidden="true" />
      <div className="bg-noise" aria-hidden="true" />

      <header className="top-bar">
        <a href="/" className="brand">
          <BrandMark />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span className="brand-zh">山田寓所</span>
            <span className="brand-en">FIELDSTAY</span>
          </div>
        </a>
      </header>

      <main className="glass" role="main">
        <h1 className="form-title">歡迎回來</h1>
        <p className="form-sub">登入後即可管理訂單、查看入住資訊</p>

        {shouldShowLoginError && (
          <div className="login-notice error">Email 或密碼錯誤，請重新確認。</div>
        )}
        {shouldShowUnverifiedNotice && (
          <div className="login-notice warn">此帳號尚未完成 email 驗證，請至信箱點擊確認連結後再登入。</div>
        )}
        {shouldShowRegisteredNotice && (
          <div className="login-notice success">註冊成功！我們已將驗證信寄到你的信箱，點擊連結完成驗證後即可登入。</div>
        )}
        {shouldShowResetDoneNotice && (
          <div className="login-notice success">密碼已重設，請用新密碼登入。</div>
        )}
        {shouldShowBookingNotice && (
          <div className="login-notice info">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M8 7v4M8 5h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span>請先登入以完成訂房，登入後將自動返回訂房頁面</span>
          </div>
        )}

        <form method="post" action={`/login/email?next=${encodedNext}`}>
          <div className="field">
            <input type="email" id="email" name="email" placeholder="電子信箱" autoComplete="email" required />
          </div>
          <div className="field">
            <input type="password" id="password" name="password" placeholder="密碼" autoComplete="current-password" required />
            <button type="button" className="eye" data-eye aria-label="顯示密碼">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>

          <div className="row-flex">
            <label className="check">
              <input type="checkbox" defaultChecked />
              <span className="box">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </span>
              記住我
            </label>
            <a href="/forgot-password" className="forgot">忘記密碼</a>
          </div>

          <div className="submit-wrap">
            <button type="submit" className="btn-submit">
              <span>登　入</span>
            </button>
          </div>

          <div className="glass-foot">
            還沒有帳號？<a href="/register">立即註冊</a>
          </div>
        </form>
      </main>

      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `document.querySelectorAll('[data-eye]').forEach(function(b){b.addEventListener('click',function(){var i=b.parentNode.querySelector('input');i.type=i.type==='password'?'text':'password';});});`,
        }}
      />
    </>
  );
}
