import Link from "next/link";
import { auth } from "../_lib/auth";
import { getActivities } from "../_lib/data-service";
import { pageStyle } from "./_styles";
import ActivitiesGrid from "./ActivitiesGrid";
import SiteFooter from "../_components/SiteFooter";

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
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = activities.find((a) => String(a.activity_date) >= todayStr);
  const lastPast = [...activities]
    .reverse()
    .find((a) => String(a.activity_date) < todayStr);
  const featured = upcoming || lastPast;
  const isPastFeatured = !upcoming && !!lastPast;

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
                {isPastFeatured ? (
                  <span className="featured-badge">已結束</span>
                ) : featured.registered >= featured.capacity ? (
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
                    {isPastFeatured
                      ? `查看活動回顧 · ${fmtPrice(featured.price)}`
                      : `立即報名 · ${fmtPrice(featured.price)}`}
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

      <SiteFooter />
    </>
  );
}
