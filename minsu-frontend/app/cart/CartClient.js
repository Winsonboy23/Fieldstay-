"use client";

import Link from "next/link";

import { useCart } from "../_components/CartContext";
import {
  availableCvsBrands,
  boxWeightG,
  canChooseCold,
  formatPrice,
  formatWeight,
  getShippingQuote,
  getTemperature,
  isSoldOut,
  orderTemperatureOf,
  totalWeightG,
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

  // 整個購物車合併成一張訂單：只要有一件必須低溫，整筆就走低溫宅配
  const temperature = orderTemperatureOf(validLines);
  const isCold = temperature === "cold";
  const itemsTotal = validLines.reduce(
    (sum, line) => sum + unitPrice(line.variant) * line.qty,
    0
  );
  const weightG = totalWeightG(validLines);
  const cvsBrands = availableCvsBrands(temperature, weightG, settings);
  const quoteFor = (deliveryType, temp) =>
    getShippingQuote({
      temperature: temp,
      deliveryType,
      itemsTotal,
      weightG,
      settings,
    });

  // 這張訂單可以選的配送方式與各自的運費（實際選擇在結帳頁）
  const shippingOptions = isCold
    ? [{ key: "home-cold", label: "低溫宅配", quote: quoteFor("home", "cold") }]
    : [
        ...(cvsBrands.length > 0
          ? [
              {
                key: "cvs",
                label: `超商取貨（${cvsBrands.map((b) => b.label).join("／")}）`,
                quote: quoteFor("cvs", "normal"),
              },
            ]
          : []),
        { key: "home", label: "宅配", quote: quoteFor("home", "normal") },
        ...(canChooseCold(validLines)
          ? [{ key: "home-cold", label: "低溫宅配", quote: quoteFor("home", "cold") }]
          : []),
      ];
  const fees = shippingOptions.map((o) => o.quote.fee);
  const minFee = fees.length ? Math.min(...fees) : 0;
  const maxFee = fees.length ? Math.max(...fees) : 0;
  const cvsOverweight = !isCold && cvsBrands.length === 0 && validLines.length > 0;

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

        {validLines.length > 0 && (
          <section className="overflow-hidden rounded-xl border border-primary-200 bg-primary-50">
            <header
              className="flex flex-wrap items-center justify-between gap-2 border-b border-primary-200 px-5 py-4"
              style={{ borderTop: `3px solid ${getTemperature(temperature).color}` }}
            >
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base font-semibold text-primary-900">
                  {isCold ? "低溫訂單" : "常溫訂單"}
                </h2>
                <span className="text-xs text-primary-500">
                  {isCold
                    ? "黑貓低溫宅配"
                    : cvsBrands.length > 0
                    ? "超商取貨或宅配"
                    : "宅配"}
                </span>
              </div>
              <span className="text-xs text-primary-500">
                全部商品合併成一張訂單
              </span>
            </header>

            {isCold && (
              <p className="border-b border-primary-200 bg-primary-100 px-5 py-3 text-xs leading-relaxed text-primary-600">
                購物車內有需低溫配送的商品，整筆訂單會一起以低溫宅配寄出。
              </p>
            )}

            <ul className="divide-y divide-primary-200">
              {validLines.map((line) => {
                const soldOut = isSoldOut(line.variant);
                const price = unitPrice(line.variant);
                const lineTemp = getTemperature(line.product.temperature);
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
                            {lineTemp.value === "cold" && (
                              <span
                                className="ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                                style={{ background: lineTemp.color }}
                              >
                                需低溫
                              </span>
                            )}
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
                <span>{formatPrice(itemsTotal)}</span>
              </div>
              {weightG > 0 && (
                <div className="mt-1 flex justify-between text-primary-600">
                  <span>總重</span>
                  <span>{formatWeight(weightG)}</span>
                </div>
              )}
              {cvsOverweight && (
                <p className="mt-2 text-xs text-clay-500">
                  總重已超過超商取貨的重量上限，這筆訂單只能宅配。
                </p>
              )}
            </div>
          </section>
        )}
      </div>

      {/* 總計 */}
      <aside className="h-fit rounded-xl border border-primary-200 bg-primary-50 p-6 lg:sticky lg:top-24">
        <h2 className="font-serif text-lg font-semibold text-primary-900">
          訂單總計
        </h2>

        <dl className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-primary-600">商品小計</dt>
            <dd className="font-medium text-primary-900">
              {formatPrice(itemsTotal)}
            </dd>
          </div>
          {shippingOptions.map((option) => (
            <div key={option.key} className="flex justify-between gap-3">
              <dt className="text-primary-600">
                運費・{option.label}
                {option.quote.boxes > 1 && (
                  <span className="text-primary-500">（{option.quote.boxes} 箱）</span>
                )}
              </dt>
              <dd className="whitespace-nowrap font-medium text-primary-900">
                {option.quote.fee === 0 ? (
                  <span className="text-accent-600">免運</span>
                ) : (
                  formatPrice(option.quote.fee)
                )}
              </dd>
            </div>
          ))}
        </dl>

        {shippingOptions
          .filter((option) => option.quote.freeGap !== null)
          .slice(0, 1)
          .map((option) => (
            <p key={option.key} className="mt-2 text-xs text-accent-600">
              再買 {formatPrice(option.quote.freeGap)}
              {option.quote.chargedBoxes > 1 ? " 可再免一箱運費" : " 即可免運"}
              {shippingOptions.length > 1 ? `（${option.label}）` : ""}
            </p>
          ))}

        <div className="mt-4 flex items-baseline justify-between border-t border-primary-200 pt-4">
          <span className="text-sm text-primary-600">合計</span>
          <span className="text-2xl font-semibold text-primary-900">
            {formatPrice(itemsTotal + minFee)}
            {maxFee !== minFee && (
              <span className="ml-1 text-sm font-normal text-primary-500">起</span>
            )}
          </span>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-primary-500">
          {validLines.length === 0
            ? "購物車內沒有可結帳的商品，請先移除已失效的商品，再回選物商店挑選。"
            : `${
                shippingOptions.length > 1 ? "配送方式在結帳時選擇。" : ""
              }宅配依總重分箱計費，每箱上限 ${formatWeight(
                boxWeightG(settings)
              )}。付款方式為銀行轉帳。`}
        </p>

        {validLines.length === 0 ? (
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
