"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BrandMark from "./BrandMark";
import CartLink from "./CartLink";
import NavIconButton from "./NavIconButton";
import SiteNavLinks from "./SiteNavLinks";

function UserIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

/**
 * overlay：頁面最上方有深色 banner 時傳 true，導覽列會先浮在 banner 上（透明白字），
 * 捲過 banner 之後才換成米白實心 —— 邏輯與配色比照首頁。
 * banner 元素要加上 data-site-banner。
 */
export default function SiteHeader({ overlay = false }) {
  const [solid, setSolid] = useState(!overlay);

  useEffect(() => {
    if (!overlay) return;
    const banner = document.querySelector("[data-site-banner]");
    if (!banner) {
      setSolid(true);
      return;
    }
    // 與首頁相同：banner 底邊捲到導覽列高度以內就換色
    const onScroll = () => setSolid(banner.getBoundingClientRect().bottom <= 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  return (
    <nav
      className={`z-[200] flex h-[100px] items-center gap-4 px-5 transition-colors md:px-10 ${
        overlay ? "fixed inset-x-0 top-0" : "sticky top-0"
      } ${solid ? "backdrop-blur-md" : ""}`}
      style={
        solid
          ? {
              background: "rgba(253, 251, 249, 0.92)",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }
          : { background: "transparent" }
      }
    >
      <Link href="/" className="mr-auto flex shrink-0 items-center gap-[0.7rem] no-underline">
        <BrandMark />
        <div className="flex flex-col leading-none">
          <span
            className={`font-serif text-[15px] font-semibold tracking-[0.08em] ${
              solid ? "text-primary-900" : "text-white"
            }`}
          >
            山田寓所
          </span>
          <span
            className={`mt-[2px] text-[9px] uppercase tracking-[0.22em] ${
              solid ? "text-primary-500" : "text-white/60"
            }`}
          >
            FIELDSTAY
          </span>
        </div>
      </Link>

      <SiteNavLinks solid={solid} />

      <div className="hidden shrink-0 items-center gap-3 md:flex">
        <CartLink solid={solid} />
        <NavIconButton href="/account" label="會員中心" solid={solid}>
          <UserIcon />
        </NavIconButton>
      </div>
    </nav>
  );
}
