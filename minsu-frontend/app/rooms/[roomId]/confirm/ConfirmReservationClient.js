"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
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

function parseIsoToLocalDate(iso) {
  if (!iso) return null;
  const [y, m, d] = String(iso).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toIsoDate(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// 「2026 年 5 月 22 日至 27 日」（跨年才印年份）
function formatDateRangeZh(startIso, endIso) {
  const from = parseIsoToLocalDate(startIso);
  const to = parseIsoToLocalDate(endIso);
  if (!from || !to) return "";
  const fy = from.getFullYear();
  const ty = to.getFullYear();
  const fm = from.getMonth() + 1;
  const tm = to.getMonth() + 1;
  const fd = from.getDate();
  const td = to.getDate();
  const crossYear = fy !== ty;
  const sameMonth = !crossYear && fm === tm;
  const startStr = crossYear ? `${fy} 年 ${fm} 月 ${fd} 日` : `${fm} 月 ${fd} 日`;
  const endStr = crossYear
    ? `${ty} 年 ${tm} 月 ${td} 日`
    : sameMonth
    ? `${td} 日`
    : `${tm} 月 ${td} 日`;
  return `${startStr}至${endStr}`;
}

export default function ConfirmReservationClient({ room, user, booking }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // booking 變成可編輯的 local state
  const [draft, setDraft] = useState({
    startDate: booking.startDate,
    endDate: booking.endDate,
    numGuests: Number(booking.numGuests || 1),
  });

  // 編輯 modal
  const [editMode, setEditMode] = useState(null); // "date" | "guests" | null
  const [dateRangeDraft, setDateRangeDraft] = useState({
    from: parseIsoToLocalDate(draft.startDate),
    to: parseIsoToLocalDate(draft.endDate),
  });
  const [guestsDraft, setGuestsDraft] = useState(draft.numGuests);

  // 開啟 modal 時同步 draft
  useEffect(() => {
    if (editMode === "date") {
      setDateRangeDraft({
        from: parseIsoToLocalDate(draft.startDate),
        to: parseIsoToLocalDate(draft.endDate),
      });
    }
    if (editMode === "guests") {
      setGuestsDraft(draft.numGuests);
    }
  }, [editMode, draft]);

  // Esc 關 modal + body scroll lock
  useEffect(() => {
    if (!editMode) return;
    function onKey(e) {
      if (e.key === "Escape") setEditMode(null);
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [editMode]);

  const nights = useMemo(
    () => countNights(draft.startDate, draft.endDate),
    [draft.startDate, draft.endDate]
  );
  const nightlyPrice = Number(room.regularPrice || 0) - Number(room.discount || 0);
  const roomPrice = nightlyPrice * nights;
  const serviceFee = Math.round(roomPrice * SERVICE_RATE);
  const totalPrice = roomPrice + CLEANING_FEE + serviceFee;
  const image = room.image || room.gallery_images?.[0] || "";
  const maxCapacity = Math.max(1, Number(room.maxCapacity || 4));

  const today = startOfToday();

  function saveDate() {
    if (!dateRangeDraft?.from || !dateRangeDraft?.to) return;
    if (dateRangeDraft.to <= dateRangeDraft.from) return;
    setDraft((d) => ({
      ...d,
      startDate: toIsoDate(dateRangeDraft.from),
      endDate: toIsoDate(dateRangeDraft.to),
    }));
    setEditMode(null);
  }
  function saveGuests() {
    setDraft((d) => ({ ...d, numGuests: Number(guestsDraft) || 1 }));
    setEditMode(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      roomId: room.id,
      regularPrice: room.regularPrice,
      discount: room.discount || 0,
      startDate: draft.startDate,
      endDate: draft.endDate,
      numGuests: draft.numGuests,
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
          startDate: draft.startDate,
          endDate: draft.endDate,
          numGuests: draft.numGuests,
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

  const checkInTime = room.check_in_time || "15:00";
  const checkOutTime = room.check_out_time || "11:00";

  return (
    <>
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
          { label: "入住日期", value: formatDate(draft.startDate) },
          { label: "退房日期", value: formatDate(draft.endDate) },
          { label: "入住人數", value: `${draft.numGuests} 位` },
          { label: "住宿天數", value: `${nights} 晚` },
        ]}
        priceRows={[
          { label: `${formatCurrency(nightlyPrice)} × ${nights} 晚`, value: roomPrice },
          { label: "清潔費", value: CLEANING_FEE },
          { label: "服務費", value: serviceFee },
        ]}
        totalPrice={totalPrice}
        /* 手機版 step 0 用 */
        mobileTitle="查看並繼續"
        mobileSubtitle={room.subtitle || ""}
        mobileDateLine={formatDateRangeZh(draft.startDate, draft.endDate)}
        mobileDateNote={`入住時間：${checkInTime} 後 ・ 退房時間：${checkOutTime} 前`}
        mobileGuestsLine={`${draft.numGuests} 位房客`}
        cancellationPolicy="入住日前 7 天可全額退款；7 天內取消酌收 30% 手續費。"
        onEditDate={() => setEditMode("date")}
        onEditGuests={() => setEditMode("guests")}
        onClose={() => router.back()}
      />

      {/* 編輯 modal */}
      {editMode ? (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/50 lg:items-center"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="關閉"
            onClick={() => setEditMode(null)}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-t-2xl bg-white shadow-2xl lg:rounded-2xl">
            <div className="flex items-center justify-between border-b border-primary-200 px-5 py-4">
              <h3 className="font-serif text-lg font-semibold">
                {editMode === "date" ? "選擇日期" : "選擇人數"}
              </h3>
              <button
                type="button"
                onClick={() => setEditMode(null)}
                className="grid h-9 w-9 place-items-center rounded-full text-primary-500 hover:bg-primary-100"
                aria-label="關閉"
              >
                ×
              </button>
            </div>

            <div className="px-5 py-4">
              {editMode === "date" ? (
                <div className="flex justify-center">
                  <DayPicker
                    mode="range"
                    selected={dateRangeDraft || undefined}
                    onSelect={(next) =>
                      setDateRangeDraft(next || { from: null, to: null })
                    }
                    disabled={{ before: today }}
                    numberOfMonths={1}
                    showOutsideDays
                    weekStartsOn={0}
                    styles={{
                      caption: { padding: "0 0.5rem" },
                    }}
                  />
                </div>
              ) : (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">房客人數</span>
                  <select
                    value={guestsDraft}
                    onChange={(e) => setGuestsDraft(Number(e.target.value))}
                    className="w-full rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 outline-none focus:border-accent-600"
                  >
                    {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} 人
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-primary-500">最多 {maxCapacity} 人</p>
                </label>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-primary-200 px-5 py-3">
              <button
                type="button"
                onClick={() => setEditMode(null)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-100"
              >
                取消
              </button>
              <button
                type="button"
                onClick={editMode === "date" ? saveDate : saveGuests}
                disabled={
                  editMode === "date" &&
                  (!dateRangeDraft?.from ||
                    !dateRangeDraft?.to ||
                    dateRangeDraft.to <= dateRangeDraft.from)
                }
                className="rounded-lg bg-accent-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-800 disabled:cursor-not-allowed disabled:bg-primary-300"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
