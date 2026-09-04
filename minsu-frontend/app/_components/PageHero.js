// 每個色調 4 個停點：[明度%, 彩度, 色相]
const TONES = {
  green: [
    [52, 0.075, 168],
    [58, 0.075, 152],
    [64, 0.07, 132],
    [69, 0.065, 116],
  ],
  // 商店走暖陶土色，跟房型的綠色分開
  clay: [
    [60, 0.065, 52],
    [67, 0.058, 66],
    [73, 0.048, 78],
    [78, 0.038, 88],
  ],
};

function gradient(tone, alpha) {
  const a = alpha == null ? "" : ` / ${alpha}`;
  const stops = [0, 45, 80, 100];
  const parts = TONES[tone].map(
    ([l, c, h], i) => `oklch(${l}% ${c} ${h}${a}) ${stops[i]}%`
  );
  return `linear-gradient(180deg, ${parts.join(", ")})`;
}

// 比照 /activities 的 header：綠色漸層 + 底部弧線
export default function PageHero({
  eyebrow,
  title,
  sub,
  breadcrumb,
  curveColor = "#f5efe8",
  image,
  imagePosition = "center",
  overlay = 0.78,
  tone = "green",
}) {
  // 有照片時左側加一層薄暗幕，讓白字在淺漸層上仍讀得清楚
  const scrim =
    "linear-gradient(100deg, rgba(14,22,16,0.50) 0%, rgba(14,22,16,0.22) 48%, rgba(14,22,16,0) 78%)";
  const background = image
    ? `${scrim}, ${gradient(tone, overlay)}, url('${image}')`
    : gradient(tone);

  return (
    <section
      data-site-banner
      className="relative overflow-hidden px-5 pb-28 pt-[140px] text-white md:px-10 md:pt-[172px]"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{ background, backgroundSize: "cover", backgroundPosition: imagePosition }}
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-px left-0 right-0 h-20"
        style={{ background: curveColor, clipPath: "ellipse(60% 100% at 50% 100%)" }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1200px]">
        {breadcrumb ? (
          <div className="mb-6 flex items-center gap-2 text-xs text-white/55">{breadcrumb}</div>
        ) : null}
        <p className="mb-6 text-[11px] uppercase tracking-[0.22em] text-white/60">{eyebrow}</p>
        <h1 className="mb-5 font-serif text-4xl font-bold leading-[1.18] tracking-[0.04em] md:text-5xl lg:text-[3.4rem]">
          {title}
        </h1>
        {sub ? (
          <p className="max-w-[480px] text-[15px] font-light leading-[1.9] text-white/80">{sub}</p>
        ) : null}
      </div>
    </section>
  );
}
