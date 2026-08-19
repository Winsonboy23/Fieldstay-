"use client";

import { useState } from "react";

import AddToCartButton from "../../_components/AddToCartButton";
import {
  firstAvailableVariant,
  formatPrice,
  hasVariantChoice,
  isSoldOut,
  unitPrice,
  variantsOf,
} from "../../_lib/product-utils";

export default function ProductPurchase({ product }) {
  const variants = variantsOf(product);
  const showPicker = hasVariantChoice(product);
  // 預設選第一個還買得到的規格，客人一進來就看得到價格
  const [selectedId, setSelectedId] = useState(
    () => firstAvailableVariant(product)?.id ?? null
  );
  const [quantity, setQuantity] = useState(1);

  const selected = variants.find((v) => v.id === selectedId) || null;
  const soldOut = !selected || isSoldOut(selected);
  const price = unitPrice(selected);
  const hasDiscount = Number(selected?.discount) > 0;
  const max =
    selected?.stock === null || selected?.stock === undefined
      ? 99
      : selected.stock;

  function pick(variant) {
    setSelectedId(variant.id);
    setQuantity(1); // 換規格後數量歸 1，避免超過新規格的庫存
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 規格選擇 */}
      {showPicker && (
        <div>
          <p className="text-sm text-primary-700">
            規格
            {selected?.name && (
              <span className="ml-2 font-medium text-primary-900">
                {selected.name}
              </span>
            )}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {variants.map((variant) => {
              const on = variant.id === selectedId;
              const out = isSoldOut(variant);
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => !out && pick(variant)}
                  disabled={out}
                  aria-pressed={on}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                    out
                      ? "cursor-not-allowed border-primary-200 text-primary-300 line-through"
                      : on
                      ? "border-accent-500 bg-accent-50 text-accent-700"
                      : "border-primary-200 text-primary-700 hover:border-primary-400"
                  }`}
                >
                  {variant.name || "標準"}
                  {out && <span className="ml-1.5 text-xs">售完</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 價格（跟著規格變動） */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold text-primary-900">
          {formatPrice(price)}
        </span>
        {hasDiscount && (
          <span className="text-base text-primary-400 line-through">
            {formatPrice(selected.price)}
          </span>
        )}
      </div>

      {/* 數量 */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-primary-700">數量</span>
        <div className="flex items-center rounded-lg border border-primary-200">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
            disabled={soldOut || quantity <= 1}
            aria-label="減少數量"
            className="btn-press px-4 py-2 text-lg text-primary-700 hover:text-primary-900 disabled:cursor-not-allowed disabled:text-primary-300"
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
            className="btn-press px-4 py-2 text-lg text-primary-700 hover:text-primary-900 disabled:cursor-not-allowed disabled:text-primary-300"
          >
            +
          </button>
        </div>
        <span className="text-xs text-primary-500">
          {selected?.stock === null || selected?.stock === undefined
            ? "供應中"
            : soldOut
            ? "此規格已售完"
            : `尚有 ${selected.stock} 件`}
        </span>
      </div>

      <AddToCartButton
        variantId={selected?.id}
        quantity={quantity}
        disabled={soldOut}
        stock={selected?.stock}
        className="w-full sm:w-auto sm:self-start sm:px-10"
      >
        {soldOut ? "此規格已售完" : "加入購物車"}
      </AddToCartButton>
    </div>
  );
}
