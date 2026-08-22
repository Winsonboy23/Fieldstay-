"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

// 常溫可選兩家；冷凍在 v1 只能寄全家（7-11 冷凍無法在門市自行寄件）
const CVS_OPTIONS = {
  normal: [
    { value: "UNIMART", label: "7-ELEVEN", url: "https://emap.pcsc.com.tw/" },
    { value: "FAMI", label: "全家", url: "https://www.family.com.tw/Marketing/inquiry/inquiry_store.aspx" },
  ],
  frozen: [
    { value: "FAMI", label: "全家", url: "https://www.family.com.tw/Marketing/inquiry/inquiry_store.aspx" },
  ],
};

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

export default function CheckoutClient({ products, settings, guest }) {
  const router = useRouter();
  const { items, isLoaded, removeItem, setQty } = useCart();

  const [temperature, setTemperature] = useState(null);
  const [form, setForm] = useState({
    contactName: guest?.fullName || "",
    contactEmail: guest?.email || "",
    contactPhone: guest?.phone || "",
    cvsBrand: "",
    cvsStoreName: "",
    cvsStoreId: "",
    cvsStoreAddress: "",
    receiverAddress: "",
    specialRequest: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

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

  const groups = TEMPERATURE_ORDER.map((value) => {
    const lines = validLines.filter((line) => line.product.temperature === value);
    const itemsTotal = lines.reduce(
      (sum, line) => sum + unitPrice(line.variant) * line.qty,
      0
    );
    return {
      temp: getTemperature(value),
      lines,
      itemsTotal,
      shippingFee: getShippingFee(value, itemsTotal, settings),
      freeGap: getFreeShippingGap(value, itemsTotal, settings),
      hasProblem: lines.some(
        (line) =>
          isSoldOut(line.variant) ||
          (line.variant.stock !== null &&
            line.variant.stock !== undefined &&
            line.qty > line.variant.stock)
      ),
    };
  }).filter((group) => group.lines.length > 0);

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-primary-300 px-6 py-20 text-center">
        <p className="font-serif text-lg text-primary-700">購物車是空的</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex rounded-lg bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-700"
        >
          前往選物商店
        </Link>
      </div>
    );
  }

  // 尚未選溫層時預設選第一組
  const active = groups.find((g) => g.temp.value === temperature) || groups[0];
  const isCvs = active.temp.value !== "chilled";
  const cvsOptions = CVS_OPTIONS[active.temp.value] || [];
  const selectedCvs = cvsOptions.find((o) => o.value === form.cvsBrand);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (active.hasProblem) {
      setError("此溫層中有商品已售完或超過庫存，請回購物車調整後再結帳");
      return;
    }
    if (isCvs && !form.cvsBrand) {
      setError("請選擇取貨超商");
      return;
    }
    if (isCvs && (!form.cvsStoreName.trim() || !form.cvsStoreId.trim())) {
      setError("請填寫取貨門市名稱與店號");
      return;
    }
    if (isCvs && !/^\d{4,8}$/.test(form.cvsStoreId.trim())) {
      setError("門市店號格式有誤，應為 4–8 位數字");
      return;
    }
    if (!isCvs && !form.receiverAddress.trim()) {
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
          temperature: active.temp.value,
          items: active.lines.map((line) => ({
            variantId: line.variant.id,
            quantity: line.qty,
          })),
          cvsBrand: isCvs ? form.cvsBrand : null,
          cvsStoreName: isCvs ? form.cvsStoreName : null,
          cvsStoreId: isCvs ? form.cvsStoreId : null,
          cvsStoreAddress: isCvs ? form.cvsStoreAddress : null,
          receiverAddress: isCvs ? null : form.receiverAddress,
          specialRequest: form.specialRequest,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "訂單建立失敗，請稍後再試");
        setSubmitting(false);
        return;
      }

      // 下單成功才把這組商品移出購物車
      active.lines.forEach((line) => removeItem(line.variant.id));
      router.push(
        `/shop/thankyou?orderId=${data.orderId}${
          data.token ? `&token=${data.token}` : ""
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
        {/* 溫層選擇 */}
        {groups.length > 1 && (
          <section className="rounded-xl border border-primary-200 bg-primary-50 p-5">
            <h2 className="font-serif text-base font-semibold text-primary-900">
              選擇本次要結帳的溫層
            </h2>
            <p className="mt-1 text-xs text-primary-500">
              不同溫層需分開寄送，因此要分開結帳。結完這一組後，購物車會保留其他溫層供您接著下單。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {groups.map((group) => {
                const on = group.temp.value === active.temp.value;
                return (
                  <button
                    key={group.temp.value}
                    type="button"
                    onClick={() => {
                      setTemperature(group.temp.value);
                      update("cvsBrand", "");
                      setError("");
                    }}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      on
                        ? "border-transparent text-white"
                        : "border-primary-200 text-primary-700 hover:border-primary-400"
                    }`}
                    style={on ? { background: group.temp.color } : undefined}
                  >
                    {group.temp.label}（{group.lines.length} 項）
                  </button>
                );
              })}
            </div>
          </section>
        )}

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

        {/* 配送方式 */}
        <section className="rounded-xl border border-primary-200 bg-primary-50 p-5">
          <h2 className="font-serif text-base font-semibold text-primary-900">
            配送方式
          </h2>

          {isCvs ? (
            <>
              <p className="mt-1 text-xs text-primary-500">
                {active.temp.label}商品以超商取貨寄送。請先查詢您要取貨的門市，再填入門市名稱與店號。
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {cvsOptions.map((option) => {
                  const on = form.cvsBrand === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => update("cvsBrand", option.value)}
                      className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition ${
                        on
                          ? "border-accent-500 bg-accent-50 text-accent-700"
                          : "border-primary-200 text-primary-700 hover:border-primary-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {active.temp.value === "frozen" && (
                <p className="mt-3 text-xs text-primary-500">
                  冷凍商品需以冷凍店到店寄送，目前僅開放全家取貨。
                </p>
              )}

              {selectedCvs && (
                <div className="mt-4 flex flex-col gap-4">
                  <a
                    href={selectedCvs.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-accent-500 px-4 py-2 text-sm font-medium text-accent-700 transition hover:bg-accent-50"
                  >
                    查詢 {selectedCvs.label} 門市
                    <span aria-hidden="true">↗</span>
                  </a>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="門市名稱" required hint="例如：後壁店">
                      <input
                        className={inputClass}
                        value={form.cvsStoreName}
                        onChange={(e) => update("cvsStoreName", e.target.value)}
                      />
                    </Field>
                    <Field label="門市店號" required hint="門市查詢頁上的數字店號">
                      <input
                        className={inputClass}
                        inputMode="numeric"
                        value={form.cvsStoreId}
                        onChange={(e) => update("cvsStoreId", e.target.value)}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="門市地址（選填）">
                        <input
                          className={inputClass}
                          value={form.cvsStoreAddress}
                          onChange={(e) =>
                            update("cvsStoreAddress", e.target.value)
                          }
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="mt-1 text-xs text-primary-500">
                冷藏商品以低溫宅配寄送，請填寫完整收件地址。
              </p>
              <div className="mt-4">
                <Field label="收件地址" required hint="請包含縣市、鄉鎮區與詳細地址">
                  <input
                    className={inputClass}
                    value={form.receiverAddress}
                    onChange={(e) => update("receiverAddress", e.target.value)}
                  />
                </Field>
              </div>
            </>
          )}

          <div className="mt-4">
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
          {active.temp.label}訂單
        </h2>

        <ul className="mt-4 flex flex-col gap-3">
          {active.lines.map((line) => {
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
                      <span className="text-primary-600"> {line.variant.name}</span>
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

        <dl className="mt-5 flex flex-col gap-2 border-t border-primary-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-primary-600">商品小計</dt>
            <dd className="text-primary-900">{formatPrice(active.itemsTotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-primary-600">運費</dt>
            <dd className="text-primary-900">
              {active.shippingFee === 0 ? (
                <span className="font-medium text-accent-600">免運</span>
              ) : (
                formatPrice(active.shippingFee)
              )}
            </dd>
          </div>
        </dl>

        {active.freeGap !== null && (
          <p className="mt-2 text-xs text-accent-600">
            再買 {formatPrice(active.freeGap)} 即可免運
          </p>
        )}

        <div className="mt-4 flex items-baseline justify-between border-t border-primary-200 pt-4">
          <span className="text-sm text-primary-600">應付金額</span>
          <span className="text-2xl font-semibold text-primary-900">
            {formatPrice(active.itemsTotal + active.shippingFee)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || active.hasProblem}
          className={`mt-5 w-full rounded-lg px-5 py-3 text-sm font-semibold transition ${
            submitting || active.hasProblem
              ? "cursor-not-allowed bg-primary-200 text-primary-500"
              : "bg-accent-500 text-white hover:bg-accent-700"
          }`}
        >
          {submitting ? "訂單處理中…" : "確認送出訂單"}
        </button>

        {groups.length > 1 && (
          <p className="mt-3 text-xs text-primary-500">
            購物車還有其他溫層的商品，送出這張訂單後可再回來結帳。
          </p>
        )}

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
