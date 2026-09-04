import Link from "next/link";
import { getActivities } from "../_lib/data-service";
import { pageStyle } from "./_styles";
import ActivitiesGrid from "./ActivitiesGrid";
import SiteFooter from "../_components/SiteFooter";
import SiteHeader from "../_components/SiteHeader";

export const metadata = {
  title: "田間體驗 | 山田寓所 FIELDSTAY",
};

function fmtPrice(p) {
  return `NT$${Number(p || 0).toLocaleString("zh-TW")}`;
}

const SOLAR_TERMS = [
  { startMonth: 1, startDay: 5, zh: "小寒", en: "Xiǎohán", saying: "小寒大寒，冷成一團。", note: "小寒大寒這兩個節氣，是一年中最冷的時候。" },
  { startMonth: 1, startDay: 20, zh: "大寒", en: "Dàhán", saying: "大寒未寒，人馬未安。", note: "大寒不冷，害蟲沒死，人畜一定不平安。" },
  { startMonth: 2, startDay: 4, zh: "立春", en: "Lìchūn", saying: "立春落雨，到清明。", note: "立春日若下雨，直到清明前都會多雨。" },
  { startMonth: 2, startDay: 19, zh: "雨水", en: "Yǔshuǐ", saying: "雨水，海水卡冷鬼。", note: "雨水時節，海水冷得比想到鬼還讓人發抖。" },
  { startMonth: 3, startDay: 5, zh: "驚蟄", en: "Jīngzhé", saying: "驚蟄，鳥仔曝翅。", note: "驚蟄天氣轉暖，鳥兒出來曬太陽。" },
  { startMonth: 3, startDay: 20, zh: "春分", en: "Chūnfēn", saying: "春分，日夜對分。", note: "春分這一天，白天與晚上一樣長。" },
  { startMonth: 4, startDay: 5, zh: "清明", en: "Qīngmíng", saying: "清明、穀雨，寒死老豬母。", note: "清明到穀雨會出現寒冷的天氣，連母豬都會被冷死。" },
  { startMonth: 4, startDay: 20, zh: "穀雨", en: "Gǔyǔ", saying: "穀雨落雨，年冬好。", note: "穀雨這天下雨，今年收成好。" },
  { startMonth: 5, startDay: 5, zh: "立夏", en: "Lìxià", saying: "立夏北，沒水通磨墨。", note: "立夏這天刮北風，表示會乾旱得連磨墨的水都沒有。" },
  { startMonth: 5, startDay: 21, zh: "小滿", en: "Xiǎomǎn", saying: "小滿，雨水相趕。", note: "小滿時進入梅雨季節，雨水會接連著下。" },
  { startMonth: 6, startDay: 5, zh: "芒種", en: "Mángzhòng", saying: "四月芒種雨，五月無乾土，六月火燒埔。", note: "芒種下雨連著下到農曆五月是梅雨季，六月就沒雨了。" },
  { startMonth: 6, startDay: 21, zh: "夏至", en: "Xiàzhì", saying: "夏至，風颱就出世。", note: "夏至後梅雨季結束，開始進入颱風季節。" },
  { startMonth: 7, startDay: 7, zh: "小暑", en: "Xiǎoshǔ", saying: "小暑一聲雷，翻轉倒黃梅。", note: "小暑有時打雷下雨，像梅雨季節去了又回來。" },
  { startMonth: 7, startDay: 23, zh: "大暑", en: "Dàshǔ", saying: "大暑熱不夠，大水風颱到。", note: "大暑不夠熱，天氣不順，會有水災或風災。" },
  { startMonth: 8, startDay: 7, zh: "立秋", en: "Lìqiū", saying: "雷拍秋，冬半收。", note: "立秋打雷，這一年的收成會不好。" },
  { startMonth: 8, startDay: 23, zh: "處暑", en: "Chǔshǔ", saying: "處暑處暑，曝死老鼠。", note: "處暑還是會有熱天氣，熱得曬死老鼠。" },
  { startMonth: 9, startDay: 7, zh: "白露", en: "Báilù", saying: "白露水，卡毒鬼。", note: "白露的雨水毒，稻子淋到結實不飽滿，蔬果淋到有苦味。" },
  { startMonth: 9, startDay: 23, zh: "秋分", en: "Qiūfēn", saying: "白露秋分，稻仔倒蹲。", note: "白露秋分稻子成熟，穗實而重，稻穗自然彎下來。" },
  { startMonth: 10, startDay: 8, zh: "寒露", en: "Hánlù", saying: "寒露開花，不結籽。", note: "寒露常刮大風，稻子這時開花將無法結成果實。" },
  { startMonth: 10, startDay: 23, zh: "霜降", en: "Shuāngjiàng", saying: "霜降，風颱走去藏。", note: "霜降之後，颱風季節也跟著結束。" },
  { startMonth: 11, startDay: 7, zh: "立冬", en: "Lìdōng", saying: "立冬田頭空。", note: "立冬時農作物都收成完畢，田裡空空的。" },
  { startMonth: 11, startDay: 22, zh: "小雪", en: "Xiǎoxuě", saying: "月內若陳雷，豬牛飼不肥。", note: "農曆十月本不該打雷，打雷表示氣候不順，豬牛都養不肥。" },
  { startMonth: 12, startDay: 7, zh: "大雪", en: "Dàxuě", saying: "小雪小到，大雪大到，冬至過十工烏魚就沒了。", note: "小雪烏魚來，大雪烏魚多，冬至後十天烏魚就沒有了。" },
  { startMonth: 12, startDay: 22, zh: "冬至", en: "Dōngzhì", saying: "冬至紅，過年濛；冬至烏，過年酥。", note: "冬至天晴，過年下雨；冬至下雨，過年放晴。" },
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

export default async function ActivitiesPage() {
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

      <SiteHeader overlay />

      {/* HERO */}
      <section className="hero" data-site-banner>
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="5" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
                <circle cx="6" cy="6" r="1.5" fill="rgba(255,255,255,0.6)" />
              </svg>
              二十四節氣 · 山與田之間的活動行事曆
            </div>
            <h1>
              順著節氣
              <br />
              過一段慢下來的日子
            </h1>
            <p className="hero-sub">
              依照節氣與土地的狀態，不定期安排手作課程、田間勞動、
              食農與米食體驗、藝術創作，以及道卡斯文化小旅行。
            </p>
          </div>

          <div className="solar-card" aria-label="當前節氣資訊">
            <div className="solar-card-label">本期節氣 · CURRENT</div>
            <div className="solar-card-name">
              <span className="zh">{solarTerm.zh}</span>
              <span className="en">{solarTerm.en}</span>
            </div>
            <p className="solar-card-poem">
              —— {solarTerm.saying} ——
              <span className="solar-card-note">{solarTerm.note}</span>
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
