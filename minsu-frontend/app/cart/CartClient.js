"use client";

import Link from "next/link";

import { useCart } from "../_components/CartContext";
import {
  TEMPERATURE_ORDER,
  formatPrice,
  getFreeShippingGap,
  getShippingFee,
  getTemperature,
  isSoldOut,
  unitPrice,
} from "../_lib/product-utils";

function QuantityStepper({ value, max, onChange, disabled }) {
  return (
    <div className="flex items-center rounded-lg border border-primary-200">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled}
        aria-label="減少數量"
        className="btn-press px-3 py-1.5 text-primary-700 hover:text-primary-900 disabled:cursor-not-allowed disabled:text-primary-300"
      >
        −
      </button>
      <span className="min-w-[2.5rem] text-center text-sm font-semibold text-primary-900">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || (max !== null && value >= max)}
        aria-label="增加數量"
        className="btn-press px-3 py-1.5 text-primary-700 hover:text-primary-900 disabled:cursor-not-allowed disabled:text-primary-300"
      >
        +
      </button>
    </div>
  );
}

export default function CartClient({ products, settings }) {
  const { items, isLoaded, setQty, removeItem } = useCart();

  if (!isLoaded) {
    return (
      <p className="py-20 text-center text-sm text-primary-500">購物車載入中…</p>
    );
  }

  // 以最新的商品資料重新核對購物車（key 為規格）：找不到的代表已下架或刪除
  const byVariantId = new Map();
  products.forEach((product) => {
    (product.variants || []).forEach((variant) => {
      byVariantId.set(Number(variant.id), { product, variant });
    });
  });
  const lines = items.map((item) => {
    const hit = byVariantId.get(item.variantId);
    return {
      ...item,
      product: hit?.product,
      variant: hit?.variant,
      unavailable: !hit,
    };
  });

  const unavailableLines = lines.filter((line) => line.unavailable);
  const validLines = lines.filter((line) => !line.unavailable);

  const groups = TEMPERATURE_ORDER.map((value) => {
    const groupLines = validLines.filter(
      (line) => line.product.temperature === value
    );
    const itemsTotal = groupLines.reduce(
      (sum, line) => sum + unitPrice(line.variant) * line.qty,
      0
    );
    return {
      temp: getTemperature(value),
      lines: groupLines,
      itemsTotal,
      shippingFee: getShippingFee(value, itemsTotal, settings),
      freeGap: getFreeShippingGap(value, itemsTotal, settings),
    };
  }).filter((group) => group.lines.length > 0);

  const grandTotal = groups.reduce(
    (sum, group) => sum + group.itemsTotal + group.shippingFee,
    0
  );

  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-primary-300 px-6 py-20 text-center">
        <p className="font-serif text-lg text-primary-700">購物車是空的</p>
        <p className="mt-2 text-sm text-primary-500">
          還沒有選購任何商品，去看看有什麼好東西吧。
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex rounded-lg bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-700"
        >
          前往選物商店
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-8">
        {unavailableLines.length > 0 && (
          <section className="rounded-xl border border-clay-100 bg-clay-50 p-5">
            <h2 className="text-sm font-semibold text-clay-700">
              以下商品已無法購買
            </h2>
            <p className="mt-1 text-xs text-clay-700">
              商品可能已下架或售罄，請先移除後再結帳。
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {unavailableLines.map((line) => (
                <li
                  key={line.variantId}
                  className="flex items-center justify-between gap-4 text-sm text-primary-700"
                >
                  <span>商品規格 #{line.variantId}（已下架）× {line.qty}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(line.variantId)}
                    className="text-xs font-medium text-clay-500 underline transition hover:text-clay-700"
                  >
                    移除
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {groups.map((group) => (
          <section
            key={group.temp.value}
            className="overflow-hidden rounded-xl border border-primary-200 bg-primary-50"
          >
            <header
              className="flex flex-wrap items-center justify-between gap-2 border-b border-primary-200 px-5 py-4"
              style={{ borderTop: `3px solid ${group.temp.color}` }}
            >
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base font-semibold text-primary-900">
                  {group.temp.label}商品
                </h2>
                <span className="text-xs text-primary-500">
                  {group.temp.delivery}
                </span>
              </div>
              <span className="text-xs text-primary-500">
                此溫層單獨成立一張訂單
              </span>
            </header>

            <ul className="divide-y divide-primary-200">
              {group.lines.map((line) => {
                const soldOut = isSoldOut(line.variant);
                const price = unitPrice(line.variant);
                const overStock =
                  line.variant.stock !== null &&
                  line.variant.stock !== undefined &&
                  line.qty > line.variant.stock;

                return (
                  <li key={line.variantId} className="flex gap-4 p-5">
                    <Link
                      href={`/shop/${line.product.id}`}
                      className="h-20 w-20 flex-shrink-0 rounded-lg border border-primary-200 bg-primary-100 bg-cover bg-center"
                      style={
                        line.product.image
                          ? { backgroundImage: `url(${line.product.image})` }
                          : undefined
                      }
                    />

                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/shop/${line.product.id}`}>
                            <h3 className="text-sm font-semibold text-primary-900">
                              {line.product.name}
                              {line.variant.name && (
                                <span className="ml-1.5 font-normal text-primary-600">
                                  {line.variant.name}
                                </span>
                              )}
                            </h3>
                          </Link>
                          <p className="mt-0.5 text-xs text-primary-500">
                            單價 {formatPrice(price)}
                          </p>
                        </div>
                        <span className="whitespace-nowrap text-sm font-semibold text-primary-900">
                          {formatPrice(price * line.qty)}
                        </span>
                      </div>

                      {soldOut && (
                        <p className="text-xs font-medium text-clay-500">
                          此商品已售完，結帳前請先移除
                        </p>
                      )}
                      {!soldOut && overStock && (
                        <p className="text-xs font-medium text-clay-500">
                          庫存僅剩 {line.variant.stock} 件，請調整數量
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-3">
                        <QuantityStepper
                          value={line.qty}
                          max={line.variant.stock ?? null}
                          disabled={soldOut}
                          onChange={(next) => setQty(line.variantId, next)}
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(line.variantId)}
                          className="text-xs font-medium text-primary-500 underline transition hover:text-primary-900"
                        >
                          移除
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-primary-200 bg-primary-100 px-5 py-4 text-sm">
              <div className="flex justify-between text-primary-600">
                <span>商品小計</span>
                <span>{formatPrice(group.itemsTotal)}</span>
              </div>
              <div className="mt-1 flex justify-between text-primary-600">
                <span>運費</span>
                <span>
                  {group.shippingFee === 0 ? (
                    <span className="font-medium text-accent-600">免運</span>
                  ) : (
                    formatPrice(group.shippingFee)
                  )}
                </span>
              </div>
              {group.freeGap !== null && (
                <p className="mt-2 text-xs text-accent-600">
                  再買 {formatPrice(group.freeGap)} 即可享有此溫層免運
                </p>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* 總計 */}
      <aside className="h-fit rounded-xl border border-primary-200 bg-primary-50 p-6 lg:sticky lg:top-24">
        <h2 className="font-serif text-lg font-semibold text-primary-900">
          訂單總計
        </h2>

        <dl className="mt-4 flex flex-col gap-2 text-sm">
          {groups.map((group) => (
            <div key={group.temp.value} className="flex justify-between">
              <dt className="text-primary-600">
                {group.temp.label}（含運費）
              </dt>
              <dd className="font-medium text-primary-900">
                {formatPrice(group.itemsTotal + group.shippingFee)}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex items-baseline justify-between border-t border-primary-200 pt-4">
          <span className="text-sm text-primary-600">合計</span>
          <span className="text-2xl font-semibold text-primary-900">
            {formatPrice(grandTotal)}
          </span>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-primary-500">
          {groups.length === 0
            ? "購物車內沒有可結帳的商品，請先移除已失效的商品，再回選物商店挑選。"
            : `目前共 ${groups.length} 個溫層，結帳時會分成 ${groups.length} 張訂單、分別寄送與計算運費。付款方式為銀行轉帳。`}
        </p>

        {groups.length === 0 ? (
          <button
            type="button"
            disabled
            className="mt-5 w-full cursor-not-allowed rounded-lg bg-primary-200 px-5 py-3 text-sm font-semibold text-primary-500"
          >
            前往結帳
          </button>
        ) : (
          <Link
            href="/checkout"
            className="mt-5 inline-flex w-full justify-center rounded-lg bg-accent-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-700"
          >
            前往結帳
          </Link>
        )}

        <Link
          href="/shop"
          className="mt-3 inline-flex w-full justify-center text-sm text-primary-600 underline transition hover:text-primary-900"
        >
          繼續選購
        </Link>
      </aside>
    </div>
  );
}
