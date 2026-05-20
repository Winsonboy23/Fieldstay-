import Link from "next/link";
import { auth } from "../_lib/auth";
import FaqAccordion from "./FaqAccordion";
import AboutInteractions from "./AboutInteractions";
import SiteFooter from "../_components/SiteFooter";
import BrandMark from "../_components/BrandMark";

export const metadata = {
  title: "關於我們",
};

const PILLARS = [
  {
    num: "01",
    zh: "空間再生",
    en: "Space Renewal",
    desc: "修舊如舊，為祖厝找到新生命。保留老屋輪廓與通風動線，讓歷史的溫度與當代生活共存。",
  },
  {
    num: "02",
    zh: "美感教育",
    en: "Everyday Aesthetics",
    desc: "藝術走進日常的每個細節，從空間、器物、課程到餐桌，讓美感自然發生在生活裡。",
  },
  {
    num: "03",
    zh: "社區串連",
    en: "Community First",
    desc: "與柑仔店、地方小農、社區媽媽及鄰近酒廠互助共好，讓旅人的停留也能回到地方。",
  },
  {
    num: "04",
    zh: "永續營運",
    en: "Sustainable Mix",
    desc: "住宿、咖啡、體驗多元共好，慢慢做、不擴張，讓這間老屋能長長久久存在下去。",
  },
];

const TIMELINE = [
  {
    year: "— 源 · ORIGIN —",
    title: "江夏郡望 · 黃氏家聲",
    desc: "「江夏」為黃氏的郡望堂號，也成為老屋記憶與家族生活的起點。",
  },
  {
    year: "— 修 · RESTORE —",
    title: "極簡干預 · 修舊如舊",
    desc: "保留原建築輪廓與通風動線，用可呼吸的材料與必要結構補強，讓老屋重新使用。",
  },
  {
    year: "— 生 · LIVING NOW —",
    title: "老屋 · 新生命",
    desc: "現為住宿、咖啡、體驗與共享空間，讓旅人能在這裡慢下來，重新感受土地。",
  },
];

const PLACE_TILES = [
  { src: "/about-assets/gallery-yard.png", label: "中庭草地 · 坐下來曬太陽", featured: true },
  { src: "/about-assets/intro-yard.png", label: "老屋門廊 · 看光走動" },
  { src: "/about-assets/greens.png", label: "田間作物 · 土地導覽" },
  { src: "/about-assets/cafe.png", label: "咖啡餐桌 · 友善風味" },
  { src: "/about-assets/door.png", label: "江夏門框 · 家族記憶" },
];

const ROOMS_IMAGES = [
  { src: "/about-assets/room-1.png", alt: "山田寓所雙人房" },
  { src: "/about-assets/room-2.png", alt: "山田寓所閣樓房" },
  { src: "/about-assets/room-3.png", alt: "窗邊茶席" },
  { src: "/about-assets/room-4.png", alt: "老屋房間一角" },
  { src: "/about-assets/room-5.png", alt: "木構屋頂房間" },
  { src: "/about-assets/room-6.png", alt: "山田寓所浴室" },
];

const STATS = [
  { num: "2025", label: "Since" },
  { num: "4", label: "核心實踐" },
  { num: "1", label: "老屋再生" },
  { num: "∞", label: "慢生活想像" },
];

export default async function AboutPage() {
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email;

  return (
    <>
      {/* Header — same as /rooms */}
      <header className="sticky top-0 z-40 border-b border-primary-200 bg-primary-50">
        <div className="mx-auto flex h-20 w-full items-center justify-between px-10">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark />
            <span className="flex flex-col leading-none">
              <span className="font-serif text-[15px] font-semibold tracking-[0.08em] text-primary-900">
                山田寓所
              </span>
              <span className="mt-1 text-[9px] tracking-[0.22em] text-primary-500">
                FIELDSTAY
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="rounded-md border border-primary-200 bg-primary-50 px-5 py-3 text-sm font-semibold text-primary-900 transition hover:border-primary-400"
            >
              會員中心
            </Link>
            {session?.user ? (
              <Link
                href="/account"
                className="rounded-md bg-accent-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-800"
              >
                {userName}
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-accent-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-800"
              >
                登入
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 py-24 text-center text-white md:px-10 md:py-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/about-assets/hero.png"
          alt="山田寓所 老屋背景"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[rgba(22,28,28,0.35)] to-[rgba(18,52,50,0.68)]"
        />
        <div className="relative z-10 mx-auto max-w-[760px]">
          <p className="mb-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/70">
            關於山田寓所 · ABOUT FIELDSTAY
          </p>
          <h1 className="mb-5 font-serif text-4xl font-bold leading-[1.18] tracking-[0.05em] md:text-5xl lg:text-6xl">
            在老屋裡
            <br />
            讓時間變慢
          </h1>
          <p className="mx-auto max-w-[600px] text-base font-light leading-[2] text-white/80">
            山田寓所是一座融合住宿、咖啡、藝術課程與土地導覽的生活實驗場。
            在鐵砧山下，種一片生活。
          </p>
        </div>
        <span
          aria-hidden="true"
          className="absolute -bottom-px left-0 right-0 h-[90px] bg-primary-50"
          style={{ clipPath: "ellipse(58% 100% at 50% 100%)" }}
        />
      </section>

      {/* Manifesto */}
      <section data-reveal className="px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-[880px] text-center">
          <div className="mb-2 font-serif text-6xl leading-none text-accent-700/35">
            「
          </div>
          <h2 className="mb-8 font-serif text-2xl font-semibold leading-[1.6] tracking-wide md:text-3xl lg:text-[2.1rem]">
            山田寓所｜來自土地的溫柔邀請
            <br />
            在鐵砧山下，種一片生活
          </h2>
          <div className="mx-auto mb-8 h-px w-8 bg-accent-700/50" />
          <p className="mx-auto mb-4 max-w-[680px] text-[15px] leading-[1.95] text-primary-500">
            這裡的故事，始於一座家族老宅的呼喚。都市裡尋找歸屬的倦怠靈魂，看見了土地的呼喚。我們相信，農村不該只是泛黃的記憶，更不該是繁華的邊陲。
          </p>
          <p className="mx-auto max-w-[680px] text-[15px] leading-[1.95] text-primary-500">
            「山田寓所」是我們對生活的重新想像，也是一場溫柔的再生實驗。我們想打造的，不只是一間民宿、一間咖啡館，或一個藝術空間；而是一個「農村 × 藝術 × 慢生活」的療癒場域。
          </p>
        </div>
      </section>

      {/* Four Pillars */}
      <section data-reveal className="bg-primary-100 px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto mb-10 max-w-[640px] text-center">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-accent-700">
              四個我們在乎的事 · OUR PRACTICE
            </p>
            <h2 className="font-serif text-2xl font-bold leading-tight tracking-wide md:text-3xl lg:text-[2.2rem]">
              不為了好看，
              <br />
              而是為了能繼續
            </h2>
          </div>

          <div data-reveal-stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PILLARS.map((p) => (
              <div
                key={p.num}
                className="rounded-2xl border border-primary-200 bg-primary-50 p-7 transition hover:-translate-y-0.5 hover:border-accent-700 hover:shadow-lg"
              >
                <p className="mb-5 font-serif text-[11px] tracking-[0.22em] text-accent-700">
                  — {p.num} —
                </p>
                <h3 className="mb-2 font-serif text-xl font-bold tracking-wide text-primary-900">
                  {p.zh}
                  <span className="mt-1 block font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-primary-500">
                    {p.en}
                  </span>
                </h3>
                <p className="text-sm leading-[1.85] text-primary-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section data-reveal className="px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="relative flex min-h-[340px] items-end overflow-hidden rounded-2xl p-6 lg:min-h-[500px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/about-assets/sign.png"
              alt="江夏堂號 黃氏祖厝"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/20"
            />
            <span className="relative z-10 rounded-md bg-black/30 px-2.5 py-1.5 font-serif text-[11px] uppercase tracking-[0.16em] text-white/85">
              — 江夏堂號 · 黃氏祖厝 —
            </span>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-accent-700">
              老屋故事 · OUR STORY
            </p>
            <h2 className="mb-4 font-serif text-2xl font-bold leading-tight tracking-wide md:text-3xl lg:text-[2.2rem]">
              江夏家聲
              <br />
              黃氏祖厝的重新呼吸
            </h2>
            <p className="mb-4 text-[14.5px] leading-[1.95] text-primary-500">
              這棟屋子承載著黃氏家族的記憶，堂號為「江夏」，源自古代湖北江夏郡的郡望傳承。屋內舊木、紅磚、瓦片與窗櫺，仍留有手作修補的痕跡與時間紋理。
            </p>
            <p className="mb-4 text-[14.5px] leading-[1.95] text-primary-500">
              整修以「極簡干預」為原則：在確保結構安全下保留原輪廓與通風動線，以可呼吸的塗料與小尺度開窗引入自然光；必要部位加固梁架、修補屋瓦，讓歷史的溫度與當代的清新共存。
            </p>
            <p className="mb-4 text-[14.5px] leading-[1.95] text-primary-500">
              我們將它改建為一座小型民宿與共享空間，開放廚房與中庭讓人們在料理與陽光中交流；以自然材質、循環家具與在地工藝延續土地的質感。
            </p>

            <ul className="mt-8 space-y-6 border-l border-primary-200 pl-5">
              {TIMELINE.map((t) => (
                <li key={t.year} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[1.55rem] top-[6px] h-[9px] w-[9px] rounded-full bg-accent-700"
                  />
                  <p className="mb-1 font-serif text-[11px] tracking-[0.18em] text-accent-700">
                    {t.year}
                  </p>
                  <h4 className="mb-1 font-serif text-base font-semibold text-primary-900">
                    {t.title}
                  </h4>
                  <p className="text-[13px] leading-[1.8] text-primary-500">{t.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Place Gallery */}
      <section data-reveal className="bg-primary-100 px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto mb-8 max-w-[640px] text-center">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-accent-700">
              這座老屋 · THE PLACE
            </p>
            <h2 className="font-serif text-2xl font-bold leading-tight tracking-wide md:text-3xl lg:text-[2.2rem]">
              老屋、田野與日常風味
            </h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-primary-500">
              這裡不是刻意打造的觀光景點，而是一處依舊呼吸著村落節奏的生活場景。
            </p>
          </div>

          <div data-reveal-stagger className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr] lg:grid-rows-2">
            {PLACE_TILES.map((tile) => (
              <div
                key={tile.src}
                className={`relative flex items-end overflow-hidden rounded-xl p-4 ${
                  tile.featured
                    ? "h-[210px] md:col-span-2 lg:col-span-1 lg:row-span-2 lg:h-auto"
                    : "h-[210px] lg:h-[220px]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.src}
                  alt={tile.label}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-b from-transparent from-[35%] to-black/40"
                />
                <span className="relative z-10 rounded-md bg-black/30 px-2.5 py-1 font-serif text-[13px] tracking-wide text-white backdrop-blur-sm">
                  {tile.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms preview */}
      <section data-reveal className="px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="mx-auto mb-8 max-w-[640px] text-center">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-accent-700">
              住宿空間 · STAY
            </p>
            <h2 className="font-serif text-2xl font-bold leading-tight tracking-wide md:text-3xl lg:text-[2.2rem]">
              風格之外，我們也在乎友善
            </h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-primary-500">
              房間延續老屋材質與光線，留下紅磚、木構、窗景與安靜的空白，讓入住的人能真的休息。
            </p>
          </div>

          <div data-reveal-stagger className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {ROOMS_IMAGES.map((r) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={r.src}
                src={r.src}
                alt={r.alt}
                className="block aspect-[365/240] w-full rounded-xl border border-primary-200 object-cover"
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/rooms"
              className="rounded-md bg-accent-700 px-7 py-3 text-sm font-semibold text-white transition hover:bg-accent-800"
            >
              房型介紹
            </Link>
          </div>
        </div>
      </section>

      {/* Band */}
      <section data-reveal className="bg-accent-700 px-5 py-14 text-white md:px-10 md:py-20">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="mb-5 font-serif text-2xl font-bold leading-tight md:text-3xl lg:text-[2.2rem]">
              慢慢做
              <br />
              從土地長出新的生活風景
            </h2>
            <p className="mb-4 text-[15px] leading-[1.95] text-white/85">
              我們用設計的語彙，為老宅梳理出新的光影；用藝術的澆灌，讓這片土地長出新的文化風景。
            </p>
            <p className="mb-4 text-[15px] leading-[1.95] text-white/85">
              放進口中的，不只是咖啡與餐點。每一個選擇，都是對土地的溫柔回應：在地食材、季節風味、友善互動，以及剛剛好的生活節奏。
            </p>

            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 border-t border-white/20 pt-6">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="mb-1 font-serif text-4xl font-bold leading-none tracking-wide">
                    {s.num}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex min-h-[340px] items-end overflow-hidden rounded-2xl border border-white/15 p-5 font-serif text-[13px] tracking-[0.16em] text-white/85 lg:min-h-[430px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/about-assets/person.png"
              alt="田間採集 土地風味"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/20"
            />
            <span className="relative z-10">— 田間採集 · 土地風味 —</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section data-reveal id="faq" className="px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="mx-auto mb-8 max-w-[580px] text-center">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-accent-700">
              常見問題 · FAQ
            </p>
            <h2 className="font-serif text-2xl font-bold leading-tight tracking-wide md:text-3xl lg:text-[2.2rem]">
              入住前你可能會問
            </h2>
          </div>

          <FaqAccordion />
        </div>
      </section>

      <SiteFooter />
      <AboutInteractions />
    </>
  );
}
