"use client";

import { useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import BookingConfirmLayout from "@/app/_components/BookingConfirmLayout";
import { createActivitySignupAction } from "@/app/_lib/actions";

function formatCurrency(value) {
  return `NT$${Number(value || 0).toLocaleString("zh-TW")}`;
}

export default function ActivityConfirmClient({ activity, user }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const searchParams = useSearchParams();
  const remaining = Math.max(activity.capacity - activity.registered, 0);
  const isFull = remaining === 0;
  const isPast = Boolean(activity.isPast);
  const maxQuantity = isFull ? 1 : remaining;
  const initialQuantity = (() => {
    const raw = Number(searchParams.get("quantity") || 1);
    if (!Number.isFinite(raw) || raw < 1) return 1;
    return Math.min(Math.max(1, Math.floor(raw)), maxQuantity);
  })();
  const [quantity, setQuantity] = useState(initialQuantity);
  const totalPrice = Number(activity.price || 0) * quantity;

  const customFields = Array.isArray(activity.custom_fields)
    ? activity.custom_fields
    : [];
  const [customAnswers, setCustomAnswers] = useState(() =>
    customFields.reduce((acc, f) => ({ ...acc, [f.label]: "" }), {})
  );

  const summaryRows = useMemo(
    () => [
      { label: "活動日期", value: activity.dateLabel },
      { label: "活動時間", value: activity.time },
      { label: "活動地點", value: activity.location },
      { label: "報名人數", value: `${quantity} ${activity.unit}` },
      { label: "剩餘名額", value: isFull ? "目前已額滿" : `${remaining} 名` },
    ],
    [activity.dateLabel, activity.location, activity.time, activity.unit, isFull, remaining, quantity]
  );

  const inputClass =
    "w-full rounded-lg border border-transparent bg-primary-100 px-4 py-3 outline-none transition focus:border-accent-600 focus:bg-primary-50";

  const quantityField = (
    <>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">報名人數 *</span>
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          disabled={isFull}
          className={inputClass}
        >
          {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} 人
            </option>
          ))}
        </select>
      </label>
      {customFields.map((field) => (
        <label key={field.label} className="block">
          <span className="mb-2 block text-sm font-semibold">
            {field.label} {field.required && "*"}
          </span>
          <input
            type="text"
            value={customAnswers[field.label] || ""}
            onChange={(e) =>
              setCustomAnswers((p) => ({ ...p, [field.label]: e.target.value }))
            }
            required={field.required}
            className={inputClass}
          />
        </label>
      ))}
    </>
  );

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);
    const contactName = String(formData.get("contactName") || "").trim();
    const contactEmail = String(formData.get("contactEmail") || "").trim();
    const contactPhone = String(formData.get("contactPhone") || "").trim();

    if (!contactName || !contactEmail || !contactPhone) {
      setError("請填寫姓名、電子郵件與電話號碼。");
      return;
    }

    const trimmedAnswers = {};
    for (const field of customFields) {
      const val = String(customAnswers[field.label] || "").trim();
      if (field.required && !val) {
        setError(`請填寫「${field.label}」`);
        return;
      }
      if (val) trimmedAnswers[field.label] = val;
    }

    formData.set("quantity", String(quantity));
    formData.set("customFieldAnswers", JSON.stringify(trimmedAnswers));

    startTransition(async () => {
      try {
        await createActivitySignupAction(activity.id, formData);
        setSuccess("已送出報名");
      } catch (err) {
        if (err?.digest?.startsWith?.("NEXT_REDIRECT")) return;
        setError(err?.message || "送出失敗，請稍後再試。");
      }
    });
  }

  const disabled = isFull || isPast;
  const submitLabel = isPast
    ? "活動已截止，無法報名"
    : isFull
    ? "已額滿，無法報名"
    : "確認報名";

  return (
    <BookingConfirmLayout
      systemTitle="活動報名系統"
      title="確認您的活動報名"
      user={user}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      submitLabel={submitLabel}
      submittingLabel="送出報名中..."
      submitDisabled={disabled}
      error={error}
      success={success}
      paymentDescription="活動報名採銀行轉帳。送出後請於 24 小時內完成匯款，逾期視同放棄名額。後台確認款項後，付款狀態會更新為已付款。"
      specialRequestPlaceholder="例如：同行者姓名、飲食限制、兒童年齡等"
      summaryTitle="活動摘要"
      summaryImage={activity.image}
      summaryImageAlt={activity.title}
      summaryName={activity.title}
      summaryRows={summaryRows}
      priceRows={[
        {
          label: `${formatCurrency(activity.price)} × ${quantity} ${activity.unit}`,
          value: totalPrice,
        },
      ]}
      totalPrice={totalPrice}
      extraContactFields={quantityField}
    />
  );
}
