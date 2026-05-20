"use client";

import { useEffect } from "react";

export default function HomeInteractions() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const forceTop = () => {
      if (window.location.hash) return;
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch {
        window.scrollTo(0, 0);
      }
    };
    forceTop();
    window.addEventListener("pageshow", forceTop);

    const nav = document.querySelector(".nav");
    const hero = document.querySelector(".hero");

    const cleanups = [];

    if (nav && hero) {
      const onScroll = () => {
        const bottom = hero.getBoundingClientRect().bottom;
        if (bottom <= 100) nav.classList.add("scrolled");
        else nav.classList.remove("scrolled");
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    const sectionMap = {};
    links.forEach((a) => {
      const id = a.getAttribute("href").slice(1);
      const sec = document.getElementById(id);
      if (sec) sectionMap[id] = { link: a, el: sec };
    });
    const ids = Object.keys(sectionMap);
    if (ids.length) {
      const setActive = (id) => {
        ids.forEach((k) => {
          sectionMap[k].link.classList.toggle("active", k === id);
        });
      };
      const onSpy = () => {
        const offset = 120;
        let current = null;
        ids.forEach((id) => {
          const top = sectionMap[id].el.getBoundingClientRect().top;
          if (top - offset <= 0) current = id;
        });
        if (current) setActive(current);
        else ids.forEach((k) => sectionMap[k].link.classList.remove("active"));
      };
      window.addEventListener("scroll", onSpy, { passive: true });
      onSpy();
      cleanups.push(() => window.removeEventListener("scroll", onSpy));
    }

    const revealTargets = document.querySelectorAll(".about-band, .section");
    const aboutSec = document.querySelector(".about-band");
    const aboutImg = aboutSec && aboutSec.querySelector(".about-visual img");

    if (revealTargets.length) {
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
      revealTargets.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    if (aboutSec && aboutImg) {
      let ticking = false;
      const update = () => {
        ticking = false;
        const rect = aboutSec.getBoundingClientRect();
        const vh = window.innerHeight;
        let progress = 1 - rect.bottom / (vh + rect.height);
        progress = Math.max(0, Math.min(1, progress));
        if (window.innerWidth <= 768) {
          // 手機：水平視差用 object-position 平移，無放大
          aboutImg.style.transform = "none";
          aboutImg.style.objectPosition = `${progress * 100}% center`;
          return;
        }
        const offset = -12 + (progress - 0.5) * 22;
        aboutImg.style.transform = `translate3d(0,${offset}%,0)`;
      };
      const onParallax = () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      };
      window.addEventListener("scroll", onParallax, { passive: true });
      update();
      cleanups.push(() => window.removeEventListener("scroll", onParallax));
    }

    const btn = document.getElementById("navToggle");
    const menu = document.getElementById("mobileMenu");
    if (btn && menu) {
      const onToggle = () => {
        const open = menu.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.setAttribute("aria-label", open ? "關閉選單" : "開啟選單");
      };
      btn.addEventListener("click", onToggle);
      const closers = [];
      menu.querySelectorAll("a").forEach((a) => {
        const close = () => {
          menu.classList.remove("open");
          btn.setAttribute("aria-expanded", "false");
          btn.setAttribute("aria-label", "開啟選單");
        };
        a.addEventListener("click", close);
        closers.push(() => a.removeEventListener("click", close));
      });
      cleanups.push(() => {
        btn.removeEventListener("click", onToggle);
        closers.forEach((fn) => fn());
      });
    }

    // 手機輪轉 dot indicator
    document.querySelectorAll(".carousel-dots").forEach((dotsWrap) => {
      const targetId = dotsWrap.getAttribute("data-dots-for");
      const carousel = targetId && document.getElementById(targetId);
      if (!carousel) return;
      const dots = Array.from(dotsWrap.querySelectorAll(".carousel-dot"));
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
      dots.forEach((d, i) =>
        d.addEventListener("click", () => {
          const card = carousel.children[i];
          if (card) {
            carousel.scrollTo({
              left: card.offsetLeft - carousel.offsetLeft,
              behavior: "smooth",
            });
          }
        })
      );
      update();
      cleanups.push(() => carousel.removeEventListener("scroll", onScroll));
    });

    return () => {
      window.removeEventListener("pageshow", forceTop);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
