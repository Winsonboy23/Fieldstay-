"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

export default function CartLink() {
  const { totalCount, isLoaded } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`購物車，${totalCount} 件商品`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary-200 text-primary-900 transition hover:border-primary-900"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="20" r="1.2" />
        <circle cx="18" cy="20" r="1.2" />
        <path d="M2 3h3l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21 7H6" />
      </svg>

      {isLoaded && totalCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-semibold leading-[18px] text-white">
          {totalCount > 99 ? "99+" : totalCount}
        </span>
      )}
    </Link>
  );
}
