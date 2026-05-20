"use client";

import { useEffect } from "react";

export default function AboutInteractions() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const targets = document.querySelectorAll(
      "[data-reveal], [data-reveal-stagger]"
    );
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in-view");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -25% 0px" }
    );
    targets.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  return null;
}
