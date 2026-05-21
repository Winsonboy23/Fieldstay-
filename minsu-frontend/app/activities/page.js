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

const SOLAR_TERMS = [
  { startMonth: 2, startDay: 4, zh: "立春", en: "Lìchūn" },
  { startMonth: 2, startDay: 19, zh: "雨水", en: "Yǔshuǐ" },
  { startMonth: 3, startDay: 5, zh: "驚蟄", en: "Jīngzhé" },
  { startMonth: 3, startDay: 20, zh: "春分", en: "Chūnfēn" },
  { startMonth: 4, startDay: 5, zh: "清明", en: "Qīngmíng" },
  { startMonth: 4, startDay: 20, zh: "穀雨", en: "Gǔyǔ" },
  { startMonth: 5, startDay: 5, zh: "立夏", en: "Lìxià" },
  { startMonth: 5, startDay: 21, zh: "小滿", en: "Xiǎomǎn" },
  { startMonth: 6, startDay: 5, zh: "芒種", en: "Mángzhòng" },
  { startMonth: 6, startDay: 21, zh: "夏至", en: "Xiàzhì" },
  { startMonth: 7, startDay: 7, zh: "小暑", en: "Xiǎoshǔ" },
  { startMonth: 7, startDay: 23, zh: "大暑", en: "Dàshǔ" },
  { startMonth: 8, startDay: 7, zh: "立秋", en: "Lìqiū" },
  { startMonth: 8, startDay: 23, zh: "處暑", en: "Chǔshǔ" },
  { startMonth: 9, startDay: 7, zh: "白露", en: "Báilù" },
  { startMonth: 9, startDay: 23, zh: "秋分", en: "Qiūfēn" },
  { startMonth: 10, startDay: 8, zh: "寒露", en: "Hánlù" },
  { startMonth: 10, startDay: 23, zh: "霜降", en: "Shuāngjiàng" },
  { startMonth: 11, startDay: 7, zh: "立冬", en: "Lìdōng" },
  { startMonth: 11, startDay: 22, zh: "小雪", en: "Xiǎoxuě" },
  { startMonth: 12, startDay: 7, zh: "大雪", en: "Dàxuě" },
  { startMonth: 12, startDay: 22, zh: "冬至", en: "Dōngzhì" },
  { startMonth: 1, startDay: 5, zh: "小寒", en: "Xiǎohán" },
  { startMonth: 1, startDay: 20, zh: "大寒", en: "Dàhán" },
];

function getCurrentSolarTerm(date = new Date()) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const key = m * 100 + d;
  let current = SOLAR_TERMS.find((t) => t.zh === "冬至");
  for (const term of SOLAR_TERMS) {
    if (key >= term.startMonth * 100 + term.startDay) current = term;
  }
  return current;
}

const BRAND_LOGO_URL =
  "https://wnvqbozqsdvaszfgumkg.supabase.co/storage/v1/object/public/site-images/1778689945313-0.1766648174384008-528684274_18019731992746464_3668865358020989427_n--1-.jpg";

function Logo({ small = false }) {
  const size = small ? 36 : 38;
  return (
    <img
      src={BRAND_LOGO_URL}
      alt="山田寓所"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        borderRadius: "50%",
      }}
    />
  );
}

export default async function ActivitiesPage() {
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email || "會員中心";
  const activities = await getActivities();
  const solarTerm = getCurrentSolarTerm();
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
              <Link href="/account" className="btn btn-ghost nav-desktop-only">會員中心</Link>
              <Link href="/account" className="btn btn-primary nav-desktop-only">{userName}</Link>
            </>
          ) : (
            <>
              <Link href="/account" className="btn btn-ghost nav-desktop-only">會員中心</Link>
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
              依照節氣與田裡的狀態，
              不定期安排幾場手作課程、田間勞動與在地小旅行。
            </p>
          </div>

          <div className="solar-card" aria-label="當前節氣資訊">
            <div className="solar-card-label">本期節氣 · CURRENT</div>
            <div className="solar-card-name">
              <span className="zh">{solarTerm.zh}</span>
              <span className="en">{solarTerm.en}</span>
            </div>
            <p className="solar-card-poem">
              —— 在田邊住下，聽見季節 ——
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
