"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result.error || "booking_failed");
      }

      router.push("/rooms/thankyou");
    } catch (err) {
      setError("訂單建立失敗，請稍後再試或確認日期是否正確。");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-primary-100 text-primary-900">
      <header className="border-b border-primary-200 bg-primary-50">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-4 px-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="grid h-9 w-9 place-items-center rounded-full text-xl text-primary-900 transition hover:bg-primary-200"
            aria-label="返回"
          >
            ←
          </button>
          <span className="h-9 w-9 rounded-full bg-accent-700" />
          <span className="font-serif text-lg font-semibold">訂房系統</span>
        </div>
      </header>

      <div className="mx-auto max-w-[1120px] px-6 py-10">
        <h1 className="mb-8 font-serif text-3xl font-semibold tracking-wide md:text-4xl">
          確認您的預訂
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 md:p-8">
              <h2 className="mb-8 font-serif text-2xl font-semibold">聯絡資訊</h2>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">姓名 *</span>
                  <input
                    name="contactName"
                    defaultValue={user.name || ""}
                    required
                    placeholder="請輸入您的全名"
                    className="w-full rounded-lg border border-transparent bg-primary-100 px-4 py-3 outline-none transition focus:border-accent-600 focus:bg-primary-50"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">電子郵件 *</span>
                  <input
                    name="contactEmail"
                    type="email"
                    defaultValue={user.email || ""}
                    required
                    placeholder="example@email.com"
                    className="w-full rounded-lg border border-transparent bg-primary-100 px-4 py-3 outline-none transition focus:border-accent-600 focus:bg-primary-50"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">電話號碼 *</span>
                  <input
                    name="contactPhone"
                    required
                    placeholder="0912-345-678"
                    className="w-full rounded-lg border border-transparent bg-primary-100 px-4 py-3 outline-none transition focus:border-accent-600 focus:bg-primary-50"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 md:p-8">
              <h2 className="mb-8 font-serif text-2xl font-semibold">付款方式</h2>
              <div className="rounded-xl border border-accent-700 bg-white px-5 py-4">
                <div className="flex items-center gap-3 font-semibold">
                  <span className="grid h-4 w-4 place-items-center rounded-full border border-accent-700">
                    <span className="h-2 w-2 rounded-full bg-accent-700" />
                  </span>
                  <span>銀行轉帳</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-primary-500">
                  送出後訂單會先顯示「待轉帳付款」。後台確認款項後，付款狀態會更新為已付款。
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 md:p-8">
              <h2 className="mb-8 font-serif text-2xl font-semibold">特殊需求（選填）</h2>
              <textarea
                name="specialRequest"
                rows={5}
                placeholder="例如：需要嬰兒床、提早入住等"
                className="w-full resize-none rounded-lg border border-primary-300 bg-primary-50 px-4 py-3 outline-none transition focus:border-accent-600"
              />
            </section>

            {error ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-accent-700 px-6 py-4 font-serif text-lg font-semibold text-white transition hover:bg-accent-800 disabled:cursor-not-allowed disabled:bg-primary-300"
            >
              {isSubmitting ? "建立訂單中..." : "確認並預訂"}
            </button>
          </div>

          <aside className="h-fit rounded-2xl border border-primary-200 bg-primary-50 p-6 shadow-sm lg:sticky lg:top-8">
            <h2 className="mb-6 font-serif text-2xl font-semibold">訂單摘要</h2>
            <div className="mb-5 h-40 overflow-hidden rounded-xl bg-clay-500">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={room.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <h3 className="mb-4 font-serif text-xl font-semibold">{room.name}</h3>
            <div className="space-y-2 border-y border-primary-200 py-4 text-sm">
              <div className="flex justify-between gap-4"><span className="text-primary-500">入住日期</span><span>{booking.startDate.replaceAll("-", "/")}</span></div>
              <div className="flex justify-between gap-4"><span className="text-primary-500">退房日期</span><span>{booking.endDate.replaceAll("-", "/")}</span></div>
              <div className="flex justify-between gap-4"><span className="text-primary-500">入住人數</span><span>{booking.numGuests} 位</span></div>
              <div className="flex justify-between gap-4"><span className="text-primary-500">住宿天數</span><span>{nights} 晚</span></div>
            </div>
            <div className="space-y-2 border-b border-primary-200 py-4 text-sm">
              <div className="flex justify-between gap-4"><span>{formatCurrency(nightlyPrice)} × {nights} 晚</span><span>{formatCurrency(roomPrice)}</span></div>
              <div className="flex justify-between gap-4"><span>清潔費</span><span>{formatCurrency(CLEANING_FEE)}</span></div>
              <div className="flex justify-between gap-4"><span>服務費</span><span>{formatCurrency(serviceFee)}</span></div>
            </div>
            <div className="mt-5 flex items-center justify-between font-serif text-xl font-semibold">
              <span>總費用</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
