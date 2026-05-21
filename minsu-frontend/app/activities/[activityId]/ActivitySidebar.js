"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function formatPrice(value) {
  return `NT$${Number(value || 0).toLocaleString("zh-TW")}`;
}

export default function ActivitySidebar({ activity }) {
  const router = useRouter();
  const remaining = Math.max(activity.capacity - activity.registered, 0);
  const isFull = remaining === 0;
  const maxQuantity = isFull ? 1 : remaining;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const totalPrice = Number(activity.price || 0) * quantity;

  useEffect(() => {
    if (!sheetOpen) return;
    function onKey(e) {
      if (e.key === "Escape") setSheetOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  function goConfirm() {
    const query = new URLSearchParams({ quantity: String(quantity) });
    router.push(`/activities/${activity.id}/confirm?${query.toString()}`);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:sticky lg:top-8 lg:block lg:self-start">
        <div className="rounded-2xl border border-[#ddd7cf] bg-white p-6 shadow-sm">
          <div className="mb-2 font-serif text-4xl font-black">
            {formatPrice(activity.price)}{" "}
            <span className="font-sans text-lg font-normal text-slate-600">
              / {activity.unit}
            </span>
          </div>
          <p
            className={
              isFull
                ? "mb-7 font-bold text-slate-500"
                : "mb-7 font-bold text-red-600"
            }
          >
            {isFull ? "目前已額滿" : `剩餘 ${remaining} 名`}
          </p>
          <div className="mb-7 border-y border-[#e5dfd8] py-6 text-sm">
            <Row label="活動日期" value={activity.dateLabel} />
            <Row label="活動時間" value={activity.time} />
            <Row label="活動時長" value={activity.duration} />
            <Row
              label="已報名"
              value={`${activity.registered} / ${activity.capacity} ${
                activity.unit || "人"
              }`}
              last
            />
          </div>
          <Link
            href={`/activities/${activity.id}/confirm`}
            className="block w-full rounded-lg bg-[#008466] px-5 py-4 text-center text-lg font-bold text-white transition hover:bg-[#006f56]"
          >
            {isFull ? "加入候補" : "立即報名"}
          </Link>
          <p className="mt-6 text-center text-sm text-slate-500">
            報名後將收到確認郵件
          </p>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {sheetOpen ? (
        <button
          type="button"
          aria-label="關閉報名面板"
          onClick={() => setSheetOpen(false)}
          className="fixed inset-0 z-[105] cursor-pointer border-0 bg-black/45 p-0 lg:hidden"
        />
      ) : null}

      {/* Mobile bottom sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[110] max-h-[85vh] overflow-y-auto rounded-t-[20px] border border-b-0 border-[#ddd7cf] bg-white p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_-10px_32px_rgba(0,0,0,0.18)] transition-transform duration-300 lg:hidden ${
          sheetOpen
            ? "visible translate-y-0"
            : "invisible translate-y-[110%]"
        }`}
        role="dialog"
        aria-label="活動報名"
      >
        <div
          className="mx-auto mb-4 h-1 w-11 rounded-full bg-[#d8d2c8]"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => setSheetOpen(false)}
          aria-label="關閉"
          className="absolute right-3 top-2 grid h-8 w-8 place-items-center text-2xl leading-none text-slate-400"
        >
          ×
        </button>

        <div className="mb-2 font-serif text-3xl font-black">
          {formatPrice(activity.price)}{" "}
          <span className="font-sans text-base font-normal text-slate-600">
            / {activity.unit}
          </span>
        </div>
        <p
          className={
            isFull
              ? "mb-5 font-bold text-slate-500"
              : "mb-5 font-bold text-red-600"
          }
        >
          {isFull ? "目前已額滿" : `剩餘 ${remaining} 名`}
        </p>

        <div className="mb-5 border-y border-[#e5dfd8] py-4 text-sm">
          <Row label="活動日期" value={activity.dateLabel} />
          <Row label="活動時間" value={activity.time} />
          <Row label="活動時長" value={activity.duration} />
          <Row
            label="已報名"
            value={`${activity.registered} / ${activity.capacity} ${
              activity.unit || "人"
            }`}
            last
          />
        </div>

        <label className="mb-5 block">
          <span className="mb-2 block text-sm font-semibold">報名人數</span>
          <select
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={isFull}
            className="w-full rounded-lg border border-[#ddd7cf] bg-white px-3 py-3 text-base outline-none focus:border-[#008466]"
          >
            {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {activity.unit}
              </option>
            ))}
          </select>
        </label>

        <div className="mb-5 flex items-baseline justify-between border-t border-[#e5dfd8] pt-4">
          <span className="text-sm text-slate-500">總金額</span>
          <span className="font-serif text-2xl font-black">
            {formatPrice(totalPrice)}
          </span>
        </div>

        <button
          type="button"
          onClick={goConfirm}
          className="block w-full rounded-lg bg-[#008466] px-5 py-4 text-center text-lg font-bold text-white"
        >
          {isFull ? "確認加入候補" : "確認報名"}
        </button>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-[90] flex items-center gap-2.5 border-t border-[#ddd7cf] bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-6px_22px_rgba(0,0,0,0.08)] lg:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="展開報名資訊"
          aria-expanded={sheetOpen}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#ddd7cf] bg-white text-slate-700"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <div className="font-serif text-lg font-bold text-slate-900">
            {formatPrice(totalPrice)}
          </div>
          <div className="truncate text-xs text-slate-500">
            {quantity} {activity.unit} · {activity.dateLabel}
          </div>
        </div>
        <button
          type="button"
          onClick={goConfirm}
          className="shrink-0 rounded-full bg-[#008466] px-5 py-3 text-sm font-semibold text-white"
        >
          {isFull ? "加入候補" : "立即報名"}
        </button>
      </div>
    </>
  );
}

function Row({ label, value, last }) {
  return (
    <div className={`flex justify-between gap-4 ${last ? "" : "mb-3"}`}>
      <span className="text-slate-500">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
