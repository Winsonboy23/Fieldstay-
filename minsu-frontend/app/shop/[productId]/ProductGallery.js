"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function ProductGallery({ images = [], name = "", soldOut = false }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStartX = useRef(null);

  const count = images.length;
  const current = images[active] || images[0];

  const goPrev = useCallback(
    () => setActive((i) => (i - 1 + count) % count),
    [count]
  );
  const goNext = useCallback(() => setActive((i) => (i + 1) % count), [count]);

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

  function onTouchStart(e) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(e) {
    if (touchStartX.current === null || count <= 1) return;
    const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(delta) > 40) (delta > 0 ? goPrev : goNext)();
    touchStartX.current = null;
  }

  if (count === 0) {
    return (
      <div className="aspect-square w-full rounded-xl border border-primary-200 bg-primary-100" />
    );
  }

  return (
    <div>
      {/* 主圖 */}
      <button
        type="button"
        onClick={() => setLightbox(true)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-label="放大檢視商品圖片"
        className="relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-xl border border-primary-200 bg-primary-100 bg-cover bg-center"
        style={{ backgroundImage: `url(${current})` }}
      >
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-primary-900/45 text-lg font-semibold tracking-widest text-white">
            已售完
          </span>
        )}
        {count > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-primary-900/55 px-2.5 py-1 text-[11px] font-medium text-white">
            {active + 1} / {count}
          </span>
        )}
      </button>

      {/* 縮圖列 */}
      {count > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {images.map((url, idx) => (
            <button
              key={`${url}-${idx}`}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={`檢視第 ${idx + 1} 張圖片`}
              className={`aspect-square rounded-lg border bg-primary-100 bg-cover bg-center transition ${
                idx === active
                  ? "border-accent-500 ring-2 ring-accent-500 ring-offset-2 ring-offset-primary-50"
                  : "border-primary-200 hover:border-primary-400"
              }`}
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
        </div>
      )}

      {count > 1 && (
        <p className="mt-2 text-center text-xs text-primary-400">
          點縮圖切換．點大圖放大檢視
        </p>
      )}

      {/* 燈箱 */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-primary-950/90 p-4"
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
