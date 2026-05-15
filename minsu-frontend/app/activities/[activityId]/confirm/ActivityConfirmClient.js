"use client";

import { useMemo, useState, useTransition } from "react";
import BookingConfirmLayout from "@/app/_components/BookingConfirmLayout";
import { createActivitySignupAction } from "@/app/_lib/actions";

function formatCurrency(value) {
  return `NT$${Number(value || 0).toLocaleString("zh-TW")}`;
}

export default function ActivityConfirmClient({ activity, user }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const remaining = Math.max(activity.capacity - activity.registered, 0);
  const isFull = remaining === 0;
  const maxQuantity = isFull ? 1 : remaining;
  const [quantity, setQuantity] = useState(1);
  const totalPrice = Number(activity.price || 0) * quantity;

  const summaryRows = useMemo(
    () => [
      { label: "活動日期", value: activity.dateLabel },
      { label: "活動時間", value: activity.time },
      { label: "活動地點", value: activity.location },
      { label: "報名人數", value: `${quantity} ${activity.unit}` },
      { label: "剩餘名額", value: isFull ? "目前已額滿（候補）" : `${remaining} 名` },
    ],
    [activity.dateLabel, activity.location, activity.time, activity.unit, isFull, remaining, quantity]
  );

  const quantityField = (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">報名人數 *</span>
      <select
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        disabled={isFull}
        className="w-full rounded-lg border border-transparent bg-primary-100 px-4 py-3 outline-none transition focus:border-accent-600 focus:bg-primary-50"
      >
        {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n} {activity.unit}
          </option>
        ))}
      </select>
    </label>
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
    formData.set("quantity", String(quantity));

    startTransition(async () => {
      try {
        await createActivitySignupAction(activity.id, formData);
        // server action redirects on success; if we get here without redirect just show success
        setSuccess("已送出報名");
      } catch (err) {
        // Next redirect throws a special error — swallow it
        if (err?.digest?.startsWith?.("NEXT_REDIRECT")) return;
        setError(err?.message || "送出失敗，請稍後再試。");
      }
    });
  }

  return (
    <BookingConfirmLayout
      systemTitle="活動報名系統"
      title="確認您的活動報名"
      user={user}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      submitLabel={isFull ? "確認加入候補" : "確認報名"}
      submittingLabel={isFull ? "送出候補中..." : "送出報名中..."}
      error={error}
      success={success}
      paymentDescription="活動報名採銀行轉帳。送出後請於 24 小時內完成匯款，逾期視同放棄名額。"
      specialRequestPlaceholder="例如：同行者姓名、飲食限制、兒童年齡等"
      summaryTitle="活動摘要"
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
