const GRADIENT =
  "linear-gradient(180deg, oklch(34% 0.10 145) 0%, oklch(40% 0.11 130) 45%, oklch(46% 0.10 110) 80%, oklch(50% 0.09 100) 100%)";

// 比照 /activities 的 header：綠色漸層 + 底部弧線
export default function PageHero({ eyebrow, title, sub, breadcrumb, curveColor = "#f5efe8" }) {
  return (
    <section
      data-site-banner
      className="relative overflow-hidden px-5 pb-28 pt-[140px] text-white md:px-10 md:pt-[172px]"
    >
      <span aria-hidden="true" className="absolute inset-0" style={{ background: GRADIENT }} />
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
          <p className="max-w-[480px] text-[15px] font-light leading-[1.9] text-white/70">{sub}</p>
        ) : null}
      </div>
    </section>
  );
}
