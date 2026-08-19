"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartContext";

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="cart-check"
    >
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

export default function AddToCartButton({
  variantId,
  disabled = false,
  quantity = 1,
  stock = null,
  className = "",
  children = "加入購物車",
}) {
  const { addItem, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef(null);

  // 元件卸載時清掉計時器，避免對已卸載元件 setState
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const inCart =
    items.find((item) => item.variantId === Number(variantId))?.qty || 0;
  // 有限庫存時，購物車內數量不可超過庫存（真正的把關在結帳的 RPC）
  // stock 為 0 屬於售完，由 disabled 處理，不算「達上限」
  const reachedStock =
    stock !== null && stock !== undefined && stock > 0 && inCart >= stock;
  const isDisabled = disabled || reachedStock;

  function handleClick() {
    if (isDisabled || !variantId) return;
    addItem(variantId, quantity);
    setJustAdded(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      aria-live="polite"
      className={`btn-press inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold ${
        isDisabled
          ? "cursor-not-allowed bg-primary-200 text-primary-500"
          : justAdded
          ? "bg-accent-700 text-white"
          : "bg-accent-500 text-white hover:bg-accent-700"
      } ${className}`}
    >
      {reachedStock ? (
        "已達庫存上限"
      ) : justAdded ? (
        <span className="cart-added inline-flex items-center gap-2">
          <CheckIcon />
          已加入購物車
        </span>
      ) : (
        children
      )}
    </button>
  );
}
