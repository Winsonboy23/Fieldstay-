"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "./CartContext";

// 首頁 nav 是伺服器端組好的 HTML 字串，無法直接放 React 的 CartLink；
// 這裡把即時數量 badge portal 進 #homeCartLink（樣式同 CartLink 的 badge）
export default function HomeCartBadge() {
  const { totalCount, isLoaded } = useCart();
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    setSlot(document.getElementById("homeCartLink"));
  }, []);

  if (!slot || !isLoaded || totalCount === 0) return null;

  return createPortal(
    <span
      key={totalCount}
      className="cart-badge-pop absolute -right-1.5 -top-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-semibold leading-[18px] text-white"
    >
      {totalCount > 99 ? "99+" : totalCount}
    </span>,
    slot
  );
}
