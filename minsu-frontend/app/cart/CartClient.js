"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "../_components/CartContext";
import {
  CHECKOUT_GROUPS_KEY,
  boxWeightG,
  formatPrice,
  formatWeight,
  groupLinesByTemp,
  isSoldOut,
  summarizeGroup,
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
  const router = useRouter();
  const { items, isLoaded, setQty, removeItem } = useCart();
  // 取消勾選的訂單（預設全部都結）
  const [unchecked, setUnchecked] = useState([]);

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

  // 依溫層分筆：能一起寄的放同一筆，沒有共同溫層的自動分開
  const groups = groupLinesByTemp(validLines).map((group) =>
    summarizeGroup(group, settings)
  );
  const multi = groups.length > 1;
  const selected = groups.filter((group) => !unchecked.includes(group.key));
  const itemsTotal = selected.reduce((sum, group) => sum + group.itemsTotal, 0);
  const minFeeOf = (group) => Math.min(...group.methods.map((m) => m.quote.fee));
  const minFee = selected.reduce((sum, group) => sum + minFeeOf(group), 0);
  const feeVaries = selected.some((group) =>
    group.methods.some((m) => m.quote.fee !== minFeeOf(group))
  );

  function toggleGroup(key) {
    setUnchecked((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function goCheckout() {
    try {
      window.sessionStorage.setItem(
        CHECKOUT_GROUPS_KEY,
        JSON.stringify(selected.map((group) => group.key))
      );
    } catch {
      // 存不了就整個購物車一起結
    }
    router.push("/checkout");
  }

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
      <div className="flex flex-col gap-6">
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

        {multi && (
          <p className="rounded-lg border border-primary-200 bg-primary-100 px-4 py-3 text-xs leading-relaxed text-primary-700">
            購物車內的商品無法用同一種溫層寄送，已自動分成 {groups.length}{" "}
            筆訂單、各自計算運費。可以勾選這次要結帳的訂單，沒勾選的會留在購物車。
          </p>
        )}

        {groups.map((group) => {
          const checked = !unchecked.includes(group.key);
          return (
            <section
              key={group.key}
              className={`overflow-hidden rounded-xl border bg-primary-50 transition ${
                checked ? "border-primary-200" : "border-primary-200 opacity-60"
              }`}
            >
              <header
                className="flex flex-wrap items-center justify-between gap-2 border-b border-primary-200 px-5 py-4"
                style={{ borderTop: `3px solid ${group.color}` }}
              >
                <label
                  className={`flex items-center gap-3 ${
                    multi ? "cursor-pointer" : ""
                  }`}
                >
                  {multi && (
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleGroup(group.key)}
                      aria-label={`結帳${group.label}訂單`}
                      className="h-4 w-4 accent-accent-500"
                    />
                  )}
                  <span className="font-serif text-base font-semibold text-primary-900">
                    {group.label}訂單
                  </span>
                  <span className="text-xs text-primary-500">
                    {group.lines.length} 項商品
                  </span>
                </label>
                <span className="text-xs text-primary-500">
                  {group.methods.map((m) => m.label).join("／")}
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
                {group.weightG > 0 && (
                  <div className="mt-1 flex justify-between text-primary-600">
                    <span>總重</span>
                    <span>{formatWeight(group.weightG)}</span>
                  </div>
                )}
                {group.methods.map((method) => (
                  <div
                    key={method.id}
                    className="mt-1 flex justify-between gap-3 text-primary-600"
                  >
                    <span>
                      運費・{method.label}
                      {method.quote.boxes > 1 && (
                        <span className="text-primary-500">
                          （{method.quote.boxes} 箱）
                        </span>
                      )}
                    </span>
                    <span className="whitespace-nowrap">
                      {method.quote.fee === 0 ? (
                        <span className="font-medium text-accent-600">免運</span>
                      ) : (
                        formatPrice(method.quote.fee)
                      )}
                    </span>
                  </div>
                ))}
                {group.methods
                  .filter((method) => method.quote.freeGap !== null)
                  .slice(0, 1)
                  .map((method) => (
                    <p key={method.id} className="mt-2 text-xs text-accent-600">
                      再買 {formatPrice(method.quote.freeGap)}
                      {method.quote.chargedBoxes > 1
                        ? " 可再免一箱運費"
                        : " 即可免運"}
                      {group.methods.length > 1 ? `（${method.label}）` : ""}
                    </p>
                  ))}
                {group.overweight.length > 0 && (
                  <p className="mt-2 text-xs text-clay-500">
                    總重已超過{group.overweight.join("、")}的重量上限，這筆訂單只能宅配。
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* 總計 */}
      <aside className="h-fit rounded-xl border border-primary-200 bg-primary-50 p-6 lg:sticky lg:top-24">
        <h2 className="font-serif text-lg font-semibold text-primary-900">
          訂單總計
        </h2>

        <dl className="mt-4 flex flex-col gap-2 text-sm">
          {multi && (
            <div className="flex justify-between">
              <dt className="text-primary-600">結帳訂單</dt>
              <dd className="font-medium text-primary-900">
                {selected.length} / {groups.length} 筆
              </dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-primary-600">商品小計</dt>
            <dd className="font-medium text-primary-900">
              {formatPrice(itemsTotal)}
            </dd>
          </div>
          {selected.length > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-primary-600">運費</dt>
              <dd className="whitespace-nowrap font-medium text-primary-900">
                {minFee === 0 && !feeVaries ? (
                  <span className="text-accent-600">免運</span>
                ) : (
                  <>
                    {formatPrice(minFee)}
                    {feeVaries && (
                      <span className="ml-1 text-xs font-normal text-primary-500">
                        起
                      </span>
                    )}
                  </>
                )}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-4 flex items-baseline justify-between border-t border-primary-200 pt-4">
          <span className="text-sm text-primary-600">合計</span>
          <span className="text-2xl font-semibold text-primary-900">
            {formatPrice(itemsTotal + minFee)}
            {feeVaries && (
              <span className="ml-1 text-sm font-normal text-primary-500">起</span>
            )}
          </span>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-primary-500">
          {groups.length === 0
            ? "購物車內沒有可結帳的商品，請先移除已失效的商品，再回選物商店挑選。"
            : selected.length === 0
            ? "請至少勾選一筆要結帳的訂單。"
            : `配送方式在結帳時選擇。宅配依總重分箱計費，每箱上限 ${formatWeight(
                boxWeightG(settings)
              )}。付款方式為銀行轉帳。`}
        </p>

        <button
          type="button"
          onClick={goCheckout}
          disabled={selected.length === 0}
          className={`mt-5 w-full rounded-lg px-5 py-3 text-sm font-semibold transition ${
            selected.length === 0
              ? "cursor-not-allowed bg-primary-200 text-primary-500"
              : "bg-accent-500 text-white hover:bg-accent-700"
          }`}
        >
          {multi && selected.length > 0
            ? `前往結帳（${selected.length} 筆）`
            : "前往結帳"}
        </button>

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
