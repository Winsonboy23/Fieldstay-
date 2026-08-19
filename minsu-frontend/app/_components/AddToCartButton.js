"use client";

import { useState } from "react";
import { useCart } from "./CartContext";

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
    setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition ${
        isDisabled
          ? "cursor-not-allowed bg-primary-200 text-primary-500"
          : "bg-accent-500 text-white hover:bg-accent-700"
      } ${className}`}
    >
      {reachedStock ? "已達庫存上限" : justAdded ? "已加入購物車 ✓" : children}
    </button>
  );
}
