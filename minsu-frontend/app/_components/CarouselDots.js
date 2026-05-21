"use client";

import { useEffect, useRef } from "react";

export default function CarouselDots({ targetId, count }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!targetId || !count) return;
    const carousel = document.getElementById(targetId);
    const wrap = wrapRef.current;
    if (!carousel || !wrap) return;

    const dots = Array.from(wrap.querySelectorAll(".carousel-dot"));
    if (!dots.length) return;

    const update = () => {
      const cards = Array.from(carousel.children);
      if (!cards.length) return;
      let bestIdx = 0;
      let bestDist = Infinity;
      const left = carousel.scrollLeft;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft - carousel.offsetLeft - left);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      });
      dots.forEach((d, i) => d.classList.toggle("active", i === bestIdx));
    };
    const onScroll = () => requestAnimationFrame(update);
    carousel.addEventListener("scroll", onScroll, { passive: true });

    const clickHandlers = dots.map((d, i) => {
      const fn = () => {
        const card = carousel.children[i];
        if (card) {
          carousel.scrollTo({
            left: card.offsetLeft - carousel.offsetLeft,
            behavior: "smooth",
          });
        }
      };
      d.addEventListener("click", fn);
      return [d, fn];
    });

    update();

    return () => {
      carousel.removeEventListener("scroll", onScroll);
      clickHandlers.forEach(([d, fn]) => d.removeEventListener("click", fn));
    };
  }, [targetId, count]);

  if (!count) return null;

  return (
    <div ref={wrapRef} className="carousel-dots" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          className={`carousel-dot${i === 0 ? " active" : ""}`}
          aria-label={`第 ${i + 1} 張`}
        />
      ))}
    </div>
  );
}
