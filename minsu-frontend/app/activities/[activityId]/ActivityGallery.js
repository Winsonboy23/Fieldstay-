"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function ActivityGallery({ images = [], name = "", category = "" }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [mobileIdx, setMobileIdx] = useState(0);
  const touchStartX = useRef(null);
  const trackRef = useRef(null);

  const count = images.length;
  const current = images[active] || images[0];
  const cover = images[0];
  const subImages = images.slice(1, 3);
  const extra = Math.max(0, count - 3);

  const goPrev = useCallback(
    () => setActive((i) => (i - 1 + count) % count),
    [count]
  );
  const goNext = useCallback(() => setActive((i) => (i + 1) % count), [count]);

  function open(idx) {
    setActive(idx);
    setLightbox(true);
  }

  // 燈箱開啟時鎖住背景捲動＋鍵盤操作
  useEffect(() => {
    if (!lightbox) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e) {
      if (e.key === "Escape") setLightbox(false);
      if (count > 1 && e.key === "ArrowLeft") goPrev();
      if (count > 1 && e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = orig || "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, count, goPrev, goNext]);

  // 手機版橫向滑動：追蹤目前在第幾張
  function onTrackScroll() {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    setMobileIdx(Math.round(el.scrollLeft / el.clientWidth));
  }

  function onTouchStart(e) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(e) {
    if (touchStartX.current === null || count <= 1) return;
    const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(delta) > 40) (delta > 0 ? goPrev : goNext)();
    touchStartX.current = null;
  }

  const categoryBadge = category ? (
    <span className="pointer-events-none absolute left-5 top-5 rounded-md bg-white px-3 py-1 text-xs font-bold text-[#007d6f]">
      {category}
    </span>
  ) : null;

  if (count === 0) {
    return (
      <div className="relative mb-7 h-[260px] rounded-2xl bg-[#0f4d3f] md:h-[390px]">
        {categoryBadge}
      </div>
    );
  }

  return (
    <div className="mb-7">
      {/* 手機版：橫向滑動看全部 */}
      <div className="relative md:hidden">
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((url, idx) => (
            <button
              key={`${url}-${idx}`}
              type="button"
              onClick={() => open(idx)}
              aria-label={`放大檢視第 ${idx + 1} 張圖片`}
              className="h-[260px] w-full shrink-0 snap-start bg-[#0f4d3f] bg-cover bg-center"
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
        </div>
        {categoryBadge}
        {count > 1 && (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white">
            {mobileIdx + 1} / {count}
          </span>
        )}
      </div>

      {/* 桌機版：封面＋兩張小圖，超過三張顯示「+N」 */}
      <div
        className={`hidden h-[390px] gap-2 md:grid ${
          subImages.length > 0 ? "md:grid-cols-[2fr_1fr]" : "md:grid-cols-1"
        }`}
      >
        <button
          type="button"
          onClick={() => open(0)}
          aria-label="放大檢視封面圖片"
          className="relative cursor-zoom-in overflow-hidden rounded-2xl bg-[#0f4d3f] bg-cover bg-center"
          style={{ backgroundImage: `url(${cover})` }}
        >
          {categoryBadge}
        </button>
        {subImages.length > 0 && (
          <div className="flex flex-col gap-2">
            {subImages.map((url, i) => {
              const idx = i + 1;
              const showMore = idx === 2 && extra > 0;
              return (
                <button
                  key={`${url}-${idx}`}
                  type="button"
                  onClick={() => open(idx)}
                  aria-label={
                    showMore
                      ? `查看全部 ${count} 張圖片`
                      : `放大檢視第 ${idx + 1} 張圖片`
                  }
                  className="relative flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-[#0f4d3f] bg-cover bg-center"
                  style={{ backgroundImage: `url(${url})` }}
                >
                  {showMore && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-2xl font-bold text-white">
                      +{extra}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 桌機版：超過三張時列出所有縮圖 */}
      {count > 3 && (
        <div className="mt-3 hidden grid-cols-8 gap-2 md:grid">
          {images.map((url, idx) => (
            <button
              key={`thumb-${url}-${idx}`}
              type="button"
              onClick={() => open(idx)}
              aria-label={`放大檢視第 ${idx + 1} 張圖片`}
              className="aspect-square rounded-lg border border-[#ddd7cf] bg-[#0f4d3f] bg-cover bg-center transition hover:border-[#009b73]"
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
        </div>
      )}

      {/* 燈箱 */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label={`${name} 圖片檢視`}
        >
          <img
            src={current}
            alt={name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[86vh] max-w-full rounded-lg object-contain"
          />

          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="關閉"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition hover:bg-white/25"
          >
            ×
          </button>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="上一張"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/25"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="下一張"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/25"
              >
                ›
              </button>
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                {active + 1} / {count}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
