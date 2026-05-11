"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BookingConfirmLayout from "@/app/_components/BookingConfirmLayout";

function formatCurrency(value) {
  return `NT$${Number(value || 0).toLocaleString("zh-TW")}`;
}

function orderCode(id) {
  const seed = String(id || "").replace(/\D/g, "").slice(-12);
  return `AC${seed.padStart(12, "0")}`;
}

export default function ActivityConfirmClient({ activity, user }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const remaining = Math.max(activity.capacity - activity.registered, 0);
  const quantity = 1;
  const totalPrice = Number(activity.price || 0) * quantity;
  const isFull = remaining === 0;

  const summaryRows = useMemo(
    () => [
      { label: "活動日期", value: activity.dateLabel },
      { label: "活動時間", value: activity.time },
      { label: "活動地點", value: activity.location },
      { label: "報名人數", value: `${quantity} ${activity.unit}` },
      { label: "剩餘名額", value: isFull ? "目前已額滿" : `${remaining} 名` },
    ],
    [activity.dateLabel, activity.location, activity.time, activity.unit, isFull, remaining]
  );

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const contactName = String(formData.get("contactName") || "").trim();
    const contactEmail = String(formData.get("contactEmail") || "").trim();
    const contactPhone = String(formData.get("contactPhone") || "").trim();
    const specialRequest = String(formData.get("specialRequest") || "").trim();

    if (!contactName || !contactEmail || !contactPhone) {
      setError("請填寫姓名、電子郵件與電話號碼。");
      setIsSubmitting(false);
      return;
    }

    try {
      const raw = window.sessionStorage.getItem("fieldstay:activityReservations");
      const reservations = raw ? JSON.parse(raw) : [];
      const reservation = {
        activityId: activity.id,
        orderCode: orderCode(activity.id),
        title: activity.title,
        dateLabel: activity.dateLabel,
        time: activity.time,
        location: activity.location,
        price: activity.price,
        unit: activity.unit,
        quantity,
        totalPrice,
        contactName,
        contactEmail,
        contactPhone,
        specialRequest,
        paymentMethod: "銀行轉帳",
        paymentStatus: "unpaid",
        createdAt: new Date().toISOString(),
      };
      const nextReservations = [
        reservation,
        ...reservations.filter((item) => item.activityId !== activity.id),
      ];
      window.sessionStorage.setItem(
        "fieldstay:activityReservations",
        JSON.stringify(nextReservations)
      );
    } catch {
      setError("活動預約暫存失敗，請稍後再試。");
      setIsSubmitting(false);
      return;
    }

    setSuccess(
      isFull
        ? "已收到候補資料，正在前往體驗預約明細。"
        : "已收到活動報名資料，正在前往體驗預約明細。"
    );

    window.setTimeout(() => {
      router.push(`/account/experiences/${activity.id}`);
    }, 350);
  }

  return (
    <BookingConfirmLayout
      systemTitle="活動報名系統"
      title="確認您的活動報名"
      user={user}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={isFull ? "確認加入候補" : "確認報名"}
      submittingLabel={isFull ? "送出候補中..." : "送出報名中..."}
      error={error}
      success={success}
      paymentDescription="活動報名目前先採銀行轉帳。正式活動報名 API 尚未建立前，送出會暫存在前台並顯示於會員中心。"
      specialRequestPlaceholder="例如：同行者姓名、飲食限制、兒童年齡等"
      summaryTitle="活動摘要"
      summaryName={activity.title}
      summaryRows={summaryRows}
      priceRows={[
        { label: `${formatCurrency(activity.price)} × ${quantity} ${activity.unit}`, value: totalPrice },
      ]}
      totalPrice={totalPrice}
    />
  );
}
