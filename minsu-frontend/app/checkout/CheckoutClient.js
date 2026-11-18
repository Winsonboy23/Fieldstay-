"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "../_components/CartContext";
import {
  CHECKOUT_GROUPS_KEY,
  boxWeightG,
  cvsBrandsOf,
  cvsWeightLimitG,
  formatPrice,
  formatWeight,
  groupLinesByTemp,
  isSoldOut,
  summarizeGroup,
  unitPrice,
} from "../_lib/product-utils";

// 去綠界地圖選店前把表單暫存起來，回來時再還原
const DRAFT_KEY = "fieldstay-checkout-draft";

const inputClass =
  "w-full rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm text-primary-900 outline-none transition focus:border-accent-500";

function Field({ label, required, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-primary-700">
        {label}
        {required && <span className="ml-1 text-clay-500">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-primary-500">{hint}</span>}
    </label>
  );
}

// 每筆訂單各自的配送選擇
const EMPTY_CHOICE = {
  method: null, // 形如 "frozen:cvs"；null = 還沒選，用第一個可用的
  cvsBrand: "",
  cvsStoreName: "",
  cvsStoreId: "",
  cvsStoreAddress: "",
};

export default function CheckoutClient({ products, settings, guest }) {
  const router = useRouter();
  const { items, isLoaded, removeItem, setQty } = useCart();

  // 購物車頁勾選要結帳的訂單；null = 沒指定，整個購物車一起結
  const [selectedKeys, setSelectedKeys] = useState(null);
  // { [訂單 key]: 配送選擇 }
  const [choices, setChoices] = useState({});
  const [form, setForm] = useState({
    contactName: guest?.fullName || "",
    contactEmail: guest?.email || "",
    contactPhone: guest?.phone || "",
    receiverAddress: "",
    specialRequest: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateChoice(groupKey, patch) {
    setChoices((prev) => ({
      ...prev,
      [groupKey]: { ...EMPTY_CHOICE, ...prev[groupKey], ...patch },
    }));
  }

  useEffect(() => {
    let keys = null;
    try {
      const saved = JSON.parse(
        window.sessionStorage.getItem(CHECKOUT_GROUPS_KEY) || "null"
      );
      if (Array.isArray(saved)) keys = saved;
    } catch {
      keys = null;
    }

    // 從綠界地圖選店回來：還原暫存表單，把門市填回當初那筆訂單，清掉網址上的參數
    const params = new URLSearchParams(window.location.search);
    const result = params.get("cvsMap");
    if (result) {
      let draft = null;
      try {
        draft = JSON.parse(window.sessionStorage.getItem(DRAFT_KEY) || "null");
        window.sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        draft = null;
      }
      if (Array.isArray(draft?.selectedKeys)) keys = draft.selectedKeys;
      if (draft?.form) setForm((prev) => ({ ...prev, ...draft.form }));

      const restored = { ...(draft?.choices || {}) };
      if (result === "ok" && draft?.mapGroup) {
        restored[draft.mapGroup] = {
          ...EMPTY_CHOICE,
          ...restored[draft.mapGroup],
          cvsBrand: params.get("cvsBrand") || "",
          cvsStoreId: params.get("cvsStoreId") || "",
          cvsStoreName: params.get("cvsStoreName") || "",
          cvsStoreAddress: params.get("cvsStoreAddress") || "",
        };
      }
      setChoices(restored);
      if (result !== "ok") setError("地圖選店失敗，請再試一次或自行填寫門市");
      window.history.replaceState(null, "", "/checkout");
    }

    setSelectedKeys(keys);
  }, []);

  if (!isLoaded) {
    return <p className="py-20 text-center text-sm text-primary-500">載入中…</p>;
  }

  // 以伺服器端最新商品資料核對購物車
  const byVariantId = new Map();
  products.forEach((product) => {
    (product.variants || []).forEach((variant) => {
      byVariantId.set(Number(variant.id), { product, variant });
    });
  });
  const validLines = items
    .map((item) => {
      const hit = byVariantId.get(item.variantId);
      return hit ? { ...item, product: hit.product, variant: hit.variant } : null;
    })
    .filter(Boolean);

  // 依溫層分筆；只留購物車頁勾選的那幾筆（勾選已失效就整個購物車一起結）
  const allGroups = groupLinesByTemp(validLines).map((group) =>
    summarizeGroup(group, settings)
  );
  const picked = Array.isArray(selectedKeys)
    ? allGroups.filter((group) => selectedKeys.includes(group.key))
    : [];
  const groups = (picked.length > 0 ? picked : allGroups).map((group) => {
    const choice = { ...EMPTY_CHOICE, ...choices[group.key] };
    // 還沒選、或之前選的方式已不能用（例如加購後超重）時，預設運費最低的
    const method =
      group.methods.find((m) => m.id === choice.method) ||
      [...group.methods].sort((a, b) => a.quote.fee - b.quote.fee)[0];
    const isCvs = method.deliveryType === "cvs";
    // 只有一家超商可選時（例如冷凍只有全家）直接帶入
    const brand = isCvs
      ? method.brands.find((b) => b.value === choice.cvsBrand) ||
        (method.brands.length === 1 ? method.brands[0] : null)
      : null;
    return { ...group, choice, method, isCvs, brand };
  });
  const multi = groups.length > 1;
  const leftCount = allGroups.length - groups.length;

  const hasProblem = groups.some((group) => group.hasProblem);
  const needsAddress = groups.some((group) => !group.isCvs);
  const itemsTotal = groups.reduce((sum, group) => sum + group.itemsTotal, 0);
  const shippingTotal = groups.reduce(
    (sum, group) => sum + group.method.quote.fee,
    0
  );

  if (groups.length === 0) {
    // 購物車有東西但都已失效（商品被刪或下架）
    const hasUnavailable = items.length > 0;
    return (
      <div className="rounded-xl border border-dashed border-primary-300 px-6 py-20 text-center">
        <p className="font-serif text-lg text-primary-700">
          {hasUnavailable ? "購物車內沒有可結帳的商品" : "購物車是空的"}
        </p>
        {hasUnavailable && (
          <p className="mt-2 text-sm text-primary-500">
            請先回購物車移除已失效的商品。
          </p>
        )}
        <Link
          href={hasUnavailable ? "/cart" : "/shop"}
          className="mt-6 inline-flex rounded-lg bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-700"
        >
          {hasUnavailable ? "回到購物車" : "前往選物商店"}
        </Link>
      </div>
    );
  }

  // 綠界電子地圖要在同一個分頁開（iOS 不能開新視窗），所以先暫存表單再整頁跳轉
  function openCvsMap(group) {
    try {
      window.sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          form,
          choices: {
            ...choices,
            [group.key]: { ...group.choice, method: group.method.id },
          },
          selectedKeys: groups.map((g) => g.key),
          mapGroup: group.key,
        })
      );
    } catch {
      // 暫存失敗就只帶門市回來，其他欄位請顧客再填
    }
    window.location.assign(`/api/logistics/cvs-map?brand=${group.brand.value}`);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (hasProblem) {
      setError("購物車中有商品已售完或超過庫存，請調整後再結帳");
      return;
    }
    for (const group of groups) {
      if (!group.isCvs) continue;
      const prefix = multi ? `「${group.label}訂單」` : "";
      if (!group.brand) {
        setError(`${prefix}請選擇取貨超商`);
        return;
      }
      if (!group.choice.cvsStoreName.trim() || !group.choice.cvsStoreId.trim()) {
        setError(`${prefix}請填寫取貨門市名稱與店號`);
        return;
      }
      if (!/^\d{4,8}$/.test(group.choice.cvsStoreId.trim())) {
        setError(`${prefix}門市店號格式有誤，應為 4–8 位數字`);
        return;
      }
    }
    if (needsAddress && !form.receiverAddress.trim()) {
      setError("請填寫收件地址");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: form.contactName,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
          specialRequest: form.specialRequest,
          orders: groups.map((group) => ({
            temperature: group.method.temperature,
            deliveryType: group.method.deliveryType,
            items: group.lines.map((line) => ({
              variantId: line.variant.id,
              quantity: line.qty,
            })),
            cvsBrand: group.isCvs ? group.brand.value : null,
            cvsStoreName: group.isCvs ? group.choice.cvsStoreName : null,
            cvsStoreId: group.isCvs ? group.choice.cvsStoreId : null,
            cvsStoreAddress: group.isCvs ? group.choice.cvsStoreAddress : null,
            receiverAddress: group.isCvs ? null : form.receiverAddress,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !Array.isArray(data.orders) || data.orders.length === 0) {
        setError(data.error || "訂單建立失敗，請稍後再試");
        setSubmitting(false);
        return;
      }

      // 下單成功才把這幾筆的商品移出購物車，沒結帳的留著
      groups.forEach((group) =>
        group.lines.forEach((line) => removeItem(line.variant.id))
      );
      try {
        window.sessionStorage.removeItem(CHECKOUT_GROUPS_KEY);
      } catch {
        // 忽略
      }
      const ids = data.orders.map((order) => order.id).join(",");
      const tokens = data.orders.map((order) => order.token || "");
      router.push(
        `/shop/thankyou?orderId=${ids}${
          tokens.every(Boolean) ? `&token=${tokens.join(",")}` : ""
        }`
      );
    } catch {
      setError("連線失敗，請稍後再試");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* 收件人 */}
        <section className="rounded-xl border border-primary-200 bg-primary-50 p-5">
          <h2 className="font-serif text-base font-semibold text-primary-900">
            收件人資料
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="姓名" required>
              <input
                className={inputClass}
                value={form.contactName}
                onChange={(e) => update("contactName", e.target.value)}
                required
              />
            </Field>
            <Field label="聯絡電話" required>
              <input
                className={inputClass}
                value={form.contactPhone}
                onChange={(e) => update("contactPhone", e.target.value)}
                required
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Email" required hint="訂單確認與匯款資訊會寄到這個信箱">
                <input
                  type="email"
                  className={inputClass}
                  value={form.contactEmail}
                  onChange={(e) => update("contactEmail", e.target.value)}
                  required
                />
              </Field>
            </div>
          </div>
        </section>

        {multi && (
          <p className="rounded-lg border border-primary-200 bg-primary-100 px-4 py-3 text-xs leading-relaxed text-primary-700">
            這次一起結 {groups.length}{" "}
            筆訂單，溫層不同所以分開寄送、各自計算運費，請分別選擇配送方式。
          </p>
        )}

        {/* 配送方式：每筆訂單各選一次 */}
        {groups.map((group, index) => {
          const candidates = cvsBrandsOf(group.method.temperature);
          return (
            <section
              key={group.key}
              className="overflow-hidden rounded-xl border border-primary-200 bg-primary-50"
              style={{ borderTop: `3px solid ${group.color}` }}
            >
              <div className="p-5">
                <h2 className="font-serif text-base font-semibold text-primary-900">
                  {multi
                    ? `訂單 ${index + 1}・${group.label}`
                    : `配送方式（${group.label}）`}
                </h2>
                {multi && (
                  <p className="mt-1 text-xs leading-relaxed text-primary-500">
                    {group.lines
                      .map(
                        (line) =>
                          `${line.product.name}${
                            line.variant.name ? ` ${line.variant.name}` : ""
                          } × ${line.qty}`
                      )
                      .join("、")}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {group.methods.map((option) => {
                    const on = option.id === group.method.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          updateChoice(group.key, { method: option.id });
                          setError("");
                        }}
                        className={`rounded-lg border px-5 py-2.5 text-left text-sm font-medium transition ${
                          on
                            ? "border-accent-500 bg-accent-50 text-accent-700"
                            : "border-primary-200 text-primary-700 hover:border-primary-400"
                        }`}
                      >
                        {option.label}
                        <span className="ml-2 text-xs font-normal">
                          {option.quote.fee === 0
                            ? "免運"
                            : formatPrice(option.quote.fee)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {group.overweight.length > 0 && (
                  <p className="mt-3 text-xs text-clay-500">
                    總重 {formatWeight(group.weightG)} 已超過
                    {group.overweight.join("、")}的重量上限，無法選擇。
                  </p>
                )}

                {group.isCvs ? (
                  <>
                    <p className="mt-4 text-xs text-primary-500">
                      可直接在地圖上選門市，或自行查詢後填入門市名稱與店號。
                    </p>

                    {candidates.length > 1 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {candidates.map((option) => {
                          const on = group.brand?.value === option.value;
                          const allowed = group.method.brands.some(
                            (b) => b.value === option.value
                          );
                          return (
                            <button
                              key={option.value}
                              type="button"
                              disabled={!allowed}
                              onClick={() =>
                                updateChoice(group.key, {
                                  cvsBrand: option.value,
                                  // 換超商時清掉上一家選的門市
                                  ...(on
                                    ? {}
                                    : {
                                        cvsStoreName: "",
                                        cvsStoreId: "",
                                        cvsStoreAddress: "",
                                      }),
                                })
                              }
                              title={
                                allowed
                                  ? undefined
                                  : `超過 ${option.label} 取貨上限 ${formatWeight(
                                      cvsWeightLimitG(
                                        option.value,
                                        settings,
                                        group.method.temperature
                                      )
                                    )}`
                              }
                              className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition ${
                                !allowed
                                  ? "cursor-not-allowed border-primary-200 text-primary-300"
                                  : on
                                  ? "border-accent-500 bg-accent-50 text-accent-700"
                                  : "border-primary-200 text-primary-700 hover:border-primary-400"
                              }`}
                            >
                              {option.label}
                              {!allowed && "（超重）"}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {group.brand && (
                      <div className="mt-4 flex flex-col gap-4">
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => openCvsMap(group)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-700"
                          >
                            在地圖上選 {group.brand.label} 門市
                          </button>
                          <a
                            href={group.brand.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-accent-500 px-4 py-2 text-sm font-medium text-accent-700 transition hover:bg-accent-50"
                          >
                            自行查詢 {group.brand.label} 門市
                            <span aria-hidden="true">↗</span>
                          </a>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field label="門市名稱" required hint="例如：後壁店">
                            <input
                              className={inputClass}
                              value={group.choice.cvsStoreName}
                              onChange={(e) =>
                                updateChoice(group.key, {
                                  cvsStoreName: e.target.value,
                                })
                              }
                            />
                          </Field>
                          <Field
                            label="門市店號"
                            required
                            hint="門市查詢頁上的數字店號"
                          >
                            <input
                              className={inputClass}
                              inputMode="numeric"
                              value={group.choice.cvsStoreId}
                              onChange={(e) =>
                                updateChoice(group.key, {
                                  cvsStoreId: e.target.value,
                                })
                              }
                            />
                          </Field>
                          <div className="sm:col-span-2">
                            <Field label="門市地址（選填）">
                              <input
                                className={inputClass}
                                value={group.choice.cvsStoreAddress}
                                onChange={(e) =>
                                  updateChoice(group.key, {
                                    cvsStoreAddress: e.target.value,
                                  })
                                }
                              />
                            </Field>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-4 text-xs text-primary-500">
                    {group.method.temperature === "normal"
                      ? "以宅配寄送到下方的收件地址。"
                      : `以黑貓${group.method.temperature === "frozen" ? "冷凍" : "冷藏"}宅配寄送到下方的收件地址。`}
                  </p>
                )}
              </div>
            </section>
          );
        })}

        {/* 收件地址與備註 */}
        <section className="rounded-xl border border-primary-200 bg-primary-50 p-5">
          <h2 className="font-serif text-base font-semibold text-primary-900">
            {needsAddress ? "收件地址與備註" : "訂單備註"}
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {needsAddress && (
              <Field label="收件地址" required hint="請包含縣市、鄉鎮區與詳細地址">
                <input
                  className={inputClass}
                  value={form.receiverAddress}
                  onChange={(e) => update("receiverAddress", e.target.value)}
                />
              </Field>
            )}
            <Field label="訂單備註（選填）">
              <textarea
                rows={3}
                className={`${inputClass} resize-y`}
                value={form.specialRequest}
                onChange={(e) => update("specialRequest", e.target.value)}
              />
            </Field>
          </div>
        </section>

        {/* 付款方式 */}
        <section className="rounded-xl border border-primary-200 bg-primary-50 p-5">
          <h2 className="font-serif text-base font-semibold text-primary-900">
            付款方式
          </h2>
          <div className="mt-3 rounded-lg bg-primary-100 px-4 py-3">
            <p className="text-sm font-medium text-primary-900">銀行轉帳</p>
            <p className="mt-1 text-xs leading-relaxed text-primary-600">
              送出訂單後，匯款帳號與期限會顯示在完成頁，也會寄到您的信箱。
              我們確認收款後才會安排出貨。
            </p>
          </div>
        </section>

        {error && (
          <p className="rounded-lg border border-clay-100 bg-clay-50 px-4 py-3 text-sm text-clay-700">
            {error}
          </p>
        )}
      </form>

      {/* 訂單摘要 */}
      <aside className="h-fit rounded-xl border border-primary-200 bg-primary-50 p-6 lg:sticky lg:top-24">
        <h2 className="font-serif text-lg font-semibold text-primary-900">
          訂單摘要
        </h2>

        {groups.map((group, index) => {
          const quote = group.method.quote;
          return (
            <div
              key={group.key}
              className={
                index > 0 ? "mt-5 border-t border-primary-200 pt-5" : "mt-4"
              }
            >
              {multi && (
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-primary-700">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: group.color }}
                    aria-hidden="true"
                  />
                  訂單 {index + 1}・{group.label}
                </p>
              )}

              <ul className="flex flex-col gap-3">
                {group.lines.map((line) => {
                  const soldOut = isSoldOut(line.variant);
                  const overStock =
                    line.variant.stock !== null &&
                    line.variant.stock !== undefined &&
                    line.qty > line.variant.stock;
                  return (
                    <li key={line.variant.id} className="text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-primary-700">
                          {line.product.name}
                          {line.variant.name && (
                            <span className="text-primary-600">
                              {" "}
                              {line.variant.name}
                            </span>
                          )}
                          <span className="text-primary-500"> × {line.qty}</span>
                        </span>
                        <span className="whitespace-nowrap font-medium text-primary-900">
                          {formatPrice(unitPrice(line.variant) * line.qty)}
                        </span>
                      </div>
                      {(soldOut || overStock) && (
                        <p className="mt-1 flex items-center gap-2 text-xs text-clay-500">
                          {soldOut
                            ? "已售完"
                            : `庫存僅剩 ${line.variant.stock} 件`}
                          <button
                            type="button"
                            onClick={() =>
                              soldOut
                                ? removeItem(line.variant.id)
                                : setQty(line.variant.id, line.variant.stock)
                            }
                            className="underline transition hover:text-clay-700"
                          >
                            {soldOut ? "移除" : "調整為可購買數量"}
                          </button>
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>

              <dl className="mt-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-primary-600">商品小計</dt>
                  <dd className="text-primary-900">
                    {formatPrice(group.itemsTotal)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-primary-600">配送方式</dt>
                  <dd className="text-right text-primary-900">
                    {group.method.label}
                  </dd>
                </div>
                {group.weightG > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-primary-600">總重</dt>
                    <dd className="text-primary-900">
                      {formatWeight(group.weightG)}
                      {!group.isCvs && `・${quote.boxes} 箱`}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-primary-600">運費</dt>
                  <dd className="text-primary-900">
                    {quote.fee === 0 ? (
                      <span className="font-medium text-accent-600">免運</span>
                    ) : (
                      formatPrice(quote.fee)
                    )}
                  </dd>
                </div>
              </dl>

              {!group.isCvs && quote.boxes > 1 && (
                <p className="mt-2 text-xs text-primary-500">
                  每箱上限 {formatWeight(boxWeightG(settings))}，共 {quote.boxes} 箱
                  {quote.freeBoxes > 0 &&
                    `，已免 ${Math.min(quote.freeBoxes, quote.boxes)} 箱運費`}
                  。
                </p>
              )}
              {quote.freeGap !== null && (
                <p className="mt-2 text-xs text-accent-600">
                  再買 {formatPrice(quote.freeGap)}
                  {quote.chargedBoxes > 1 ? " 可再免一箱運費" : " 即可免運"}
                </p>
              )}
            </div>
          );
        })}

        <div className="mt-5 flex items-baseline justify-between border-t border-primary-200 pt-4">
          <span className="text-sm text-primary-600">
            應付金額{multi && `（${groups.length} 筆）`}
          </span>
          <span className="text-2xl font-semibold text-primary-900">
            {formatPrice(itemsTotal + shippingTotal)}
          </span>
        </div>

        {leftCount > 0 && (
          <p className="mt-3 text-xs text-primary-500">
            購物車裡還有 {leftCount} 筆訂單這次沒有結帳，會繼續留在購物車。
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || hasProblem}
          className={`mt-5 w-full rounded-lg px-5 py-3 text-sm font-semibold transition ${
            submitting || hasProblem
              ? "cursor-not-allowed bg-primary-200 text-primary-500"
              : "bg-accent-500 text-white hover:bg-accent-700"
          }`}
        >
          {submitting
            ? "訂單處理中…"
            : multi
            ? `確認送出 ${groups.length} 筆訂單`
            : "確認送出訂單"}
        </button>

        <Link
          href="/cart"
          className="mt-3 inline-flex w-full justify-center text-sm text-primary-600 underline transition hover:text-primary-900"
        >
          回購物車修改
        </Link>
      </aside>
    </div>
  );
}
