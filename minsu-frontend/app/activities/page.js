import Link from "next/link";
import { auth } from "../_lib/auth";
import { getActivities } from "../_lib/data-service";
import { pageStyle } from "./_styles";
import ActivitiesGrid from "./ActivitiesGrid";

export const metadata = {
  title: "田間體驗 | 山田寓所 FIELDSTAY",
};

function fmtPrice(p) {
  return `NT$${Number(p || 0).toLocaleString("zh-TW")}`;
}

function Logo({ small = false, opacity = 1 }) {
  const size = small ? 36 : 38;
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" fill="none" aria-hidden="true">
      <circle cx="19" cy="19" r="19" fill="oklch(44% 0.13 183)" opacity={opacity} />
      <path
        d="M6 28 C9 28 13 16 19 19.5 C25 16 29 28 32 28 Z"
        fill="white"
        opacity={opacity * 0.95}
      />
      <path
        d="M23.5 13 L24.4 15.5 L27 16.4 L24.4 17.3 L23.5 19.8 L22.6 17.3 L20 16.4 L22.6 15.5 Z"
        fill="white"
        opacity={opacity}
      />
    </svg>
  );
}

export default async function ActivitiesPage() {
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email || "會員中心";
  const activities = await getActivities();
  const featured = activities[0];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyle }} />

      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="nav-logo">
          <Logo />
          <div className="logo-wordmark">
            <span className="logo-zh">山田寓所</span>
            <span className="logo-en">FIELDSTAY</span>
          </div>
        </Link>

        <div className="nav-actions">
          {session?.user ? (
            <>
              <Link href="/account" className="btn btn-ghost">會員中心</Link>
              <Link href="/account" className="btn btn-primary">{userName}</Link>
            </>
          ) : (
            <>
              <Link href="/account" className="btn btn-ghost">會員中心</Link>
              <Link href="/login" className="btn btn-primary">登入</Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="5" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
                <circle cx="6" cy="6" r="1.5" fill="rgba(255,255,255,0.6)" />
              </svg>
              二十四節氣 · 田間活動行事曆
            </div>
            <h1>
              順著節氣
              <br />
              過一段田裡的日子
            </h1>
            <p className="hero-sub">
              每月依時令推出 6–10 場手作課程與田間勞動
              結合在地長輩、農夫與在地職人
              讓你在來訪的兩天，留下一份土地的記憶
            </p>
          </div>

          <div className="solar-card" aria-label="當前節氣資訊">
            <div className="solar-card-label">本期節氣 · CURRENT</div>
            <div className="solar-card-name">
              <span className="zh">立夏</span>
              <span className="en">Lìxià</span>
            </div>
            <div className="solar-card-meta">
              2026.05.05 — 05.20 &nbsp;·&nbsp; 第 7 個節氣
            </div>
            <p className="solar-card-poem">
              —— 蛙始鳴，蚯蚓出，王瓜生 ——
              <br />
              綠蔭漸密，是收筍、製醃菜、釀梅酒的時節。
            </p>
          </div>
        </div>
      </section>

      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link href="/">首頁</Link>
        <span>/</span>
        <Link href="/activities">田間體驗</Link>
        <span>/</span>
        <span style={{ color: "var(--fg)", opacity: 1 }}>活動行事曆</span>
      </div>

      {/* FEATURED EVENT (first DB activity) */}
      {featured && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                <small>FEATURED · 近期活動</small>
                {featured.title}
              </h2>
            </div>

            <article className="featured">
              <div
                className="featured-img"
                style={
                  featured.image
                    ? {
                        backgroundImage: `url(${featured.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                {featured.registered >= featured.capacity ? (
                  <span className="featured-badge">已額滿</span>
                ) : featured.capacity - featured.registered <= 2 ? (
                  <span className="featured-badge">即將額滿</span>
                ) : (
                  <span className="featured-badge">熱門場次</span>
                )}
              </div>
              <div className="featured-body">
                {featured.category && (
                  <div className="featured-tag">{featured.category} · WORKSHOP</div>
                )}
                <h2>{featured.title}</h2>
                <p>{featured.summary}</p>

                <div className="featured-meta">
                  <div>
                    <div className="meta-item-label">日期 · DATE</div>
                    <div className="meta-item-value">{featured.activity_date}</div>
                  </div>
                  <div>
                    <div className="meta-item-label">時長 · DURATION</div>
                    <div className="meta-item-value">{featured.duration || "—"}</div>
                  </div>
                  <div>
                    <div className="meta-item-label">名額 · CAPACITY</div>
                    <div className="meta-item-value">
                      {featured.registered} / {featured.capacity} 已報名
                    </div>
                  </div>
                </div>

                <div className="featured-actions">
                  <Link
                    href={`/activities/${featured.id}`}
                    className="btn btn-primary"
                  >
                    立即報名 · {fmtPrice(featured.price)}
                  </Link>
                  <a href="#calendar" className="btn btn-ghost">
                    查看其他場次
                  </a>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* GRID */}
      <section className="section section-alt" id="calendar">
        <div className="container">
          <ActivitiesGrid activities={activities} />
        </div>
      </section>

      {/* CTA BAND */}
      <section className="cta-band">
        <div className="container">
          <h2>
            每月寄給你的
            <br />
            節氣行事曆
          </h2>
          <p>
            每月初寄一封信，整理當月開課、新進活動、與後山的近況。隨時可退訂。
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div>
            <Link
              href="/"
              className="nav-logo footer-brand-logo"
              style={{ textDecoration: "none" }}
            >
              <Logo small opacity={0.6} />
              <div className="logo-wordmark">
                <span className="logo-zh">山田寓所</span>
                <span className="logo-en">FIELDSTAY</span>
              </div>
            </Link>
            <p className="footer-desc">
              台南農村民宿，提供田間體驗與住宿，感受節氣文化與土地連結。
            </p>
          </div>
          <div className="footer-col footer-social">
            <ul className="social-list">
              <li>
                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              </li>
              <li>
                <a href="https://www.threads.net/" target="_blank" rel="noopener noreferrer" aria-label="Threads">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                  </svg>
                </a>
              </li>
              <li>
                <a href="https://line.me/" target="_blank" rel="noopener noreferrer" aria-label="LINE">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.494.25l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.628-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 山田寓所 FIELDSTAY · 版權所有</span>
          <span>台南市 · 隱私政策 · 服務條款</span>
        </div>
      </footer>
    </>
  );
}
