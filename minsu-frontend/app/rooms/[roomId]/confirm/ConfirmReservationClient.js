"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BookingConfirmLayout from "@/app/_components/BookingConfirmLayout";

const CLEANING_FEE = 500;
const SERVICE_RATE = 0.05;

function formatCurrency(value) {
  return `NT$${Number(value || 0).toLocaleString("zh-TW")}`;
}

function countNights(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return 1;
  }

  return Math.max(1, Math.round((end - start) / 86400000));
}

function buildOrderCode(bookingId) {
  const seed = String(bookingId || Date.now()).replace(/\D/g, "").slice(-12);
  return `BK${seed.padStart(12, "0")}`;
}

function formatDate(value) {
  return String(value || "").replaceAll("-", "/");
}

export default function ConfirmReservationClient({ room, user, booking }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const nights = useMemo(
    () => countNights(booking.startDate, booking.endDate),
    [booking.startDate, booking.endDate]
  );
  const nightlyPrice = Number(room.regularPrice || 0) - Number(room.discount || 0);
  const roomPrice = nightlyPrice * nights;
  const serviceFee = Math.round(roomPrice * SERVICE_RATE);
  const totalPrice = roomPrice + CLEANING_FEE + serviceFee;
  const image = room.image || room.gallery_images?.[0] || "";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      roomId: room.id,
      regularPrice: room.regularPrice,
      discount: room.discount || 0,
      startDate: booking.startDate,
      endDate: booking.endDate,
      numGuests: Number(booking.numGuests || 1),
      contactName: String(formData.get("contactName") || "").trim(),
      contactEmail: String(formData.get("contactEmail") || "").trim(),
      contactPhone: String(formData.get("contactPhone") || "").trim(),
      paymentMethod: "bank_transfer",
      specialRequest: String(formData.get("specialRequest") || "").trim(),
    };

    if (!payload.contactName || !payload.contactEmail || !payload.contactPhone) {
      setError("請填寫姓名、電子郵件與電話號碼。");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        router.push("/login?next=booking");
        return;
      }

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result.error || "booking_failed");
      }

      const bookingId = result.bookingId || Date.now();
      const orderCode = buildOrderCode(bookingId);

      window.sessionStorage.setItem(
        "fieldstay:lastBookingDetail",
        JSON.stringify({
          bookingId,
          orderCode,
          roomId: room.id,
          roomName: room.name,
          startDate: booking.startDate,
          endDate: booking.endDate,
          numGuests: Number(booking.numGuests || 1),
          numNights: nights,
          nightlyPrice,
          roomPrice,
          cleaningFee: CLEANING_FEE,
          serviceFee,
          totalPrice,
          contactName: payload.contactName,
          contactEmail: payload.contactEmail,
          contactPhone: payload.contactPhone,
          paymentMethod: "銀行轉帳",
        })
      );

      router.push(`/rooms/thankyou?bookingId=${encodeURIComponent(bookingId)}`);
    } catch (err) {
      setError("訂單建立失敗，請稍後再試或確認日期是否正確。");
      setIsSubmitting(false);
    }
  }

  return (
    <BookingConfirmLayout
      systemTitle="訂房系統"
      title="確認您的預訂"
      user={user}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="確認並預訂"
      submittingLabel="建立訂單中..."
      error={error}
      paymentDescription="送出後訂單會先顯示「待轉帳付款」。後台確認款項後，付款狀態會更新為已付款。"
      specialRequestPlaceholder="例如：需要嬰兒床、提早入住等"
      summaryTitle="訂單摘要"
      summaryImage={image}
      summaryImageAlt={room.name}
      summaryName={room.name}
      summaryRows={[
        { label: "入住日期", value: formatDate(booking.startDate) },
        { label: "退房日期", value: formatDate(booking.endDate) },
        { label: "入住人數", value: `${booking.numGuests} 位` },
        { label: "住宿天數", value: `${nights} 晚` },
      ]}
      priceRows={[
        { label: `${formatCurrency(nightlyPrice)} × ${nights} 晚`, value: roomPrice },
        { label: "清潔費", value: CLEANING_FEE },
        { label: "服務費", value: serviceFee },
      ]}
      totalPrice={totalPrice}
    />
  );
}
