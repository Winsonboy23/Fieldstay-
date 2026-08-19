"use client";

import { useState } from "react";

import AddToCartButton from "../../_components/AddToCartButton";

export default function ProductPurchase({ product, soldOut }) {
  const [quantity, setQuantity] = useState(1);
  const max =
    product.stock === null || product.stock === undefined ? 99 : product.stock;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-primary-700">數量</span>
        <div className="flex items-center rounded-lg border border-primary-200">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
            disabled={soldOut || quantity <= 1}
            aria-label="減少數量"
            className="px-4 py-2 text-lg text-primary-700 transition hover:text-primary-900 disabled:cursor-not-allowed disabled:text-primary-300"
          >
            −
          </button>
          <span className="min-w-[3rem] text-center text-sm font-semibold text-primary-900">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(q + 1, max))}
            disabled={soldOut || quantity >= max}
            aria-label="增加數量"
            className="px-4 py-2 text-lg text-primary-700 transition hover:text-primary-900 disabled:cursor-not-allowed disabled:text-primary-300"
          >
            +
          </button>
        </div>
      </div>

      <AddToCartButton
        productId={product.id}
        quantity={quantity}
        disabled={soldOut}
        stock={product.stock}
        className="w-full sm:w-auto sm:self-start sm:px-10"
      >
        {soldOut ? "已售完" : "加入購物車"}
      </AddToCartButton>
    </div>
  );
}
