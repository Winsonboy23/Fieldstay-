"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

export default function ExperienceReservationsClient() {
  const [reservations, setReservations] = useState(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("fieldstay:activityReservations");
      setReservations(raw ? JSON.parse(raw) : []);
    } catch {
      setReservations([]);
    }
  }, []);

  if (reservations === null) {
    return <div className="rounded-xl border border-primary-200 bg-primary-50 p-8 text-sm text-primary-500">載入體驗預約中...</div>;
  }

  if (reservations.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <CalendarDaysIcon className="mb-8 h-12 w-12 text-primary-300" />
        <h3 className="mb-4 font-serif text-xl font-semibold text-primary-900">
          尚無體驗預約
        </h3>
        <p className="mb-8 text-sm leading-7 text-primary-500">
          炊粿體驗、農事體驗、節氣料理工作坊等活動，
          <br />
          均可在首頁「田間體驗」區塊預約。
        </p>
        <Link
          href="/activities"
          className="rounded-lg bg-accent-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-800"
        >
          探索田間體驗
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reservations.map((reservation) => (
        <Link
          key={reservation.activityId}
          href={`/account/experiences/${reservation.activityId}`}
          className="grid gap-5 overflow-hidden rounded-xl border border-primary-200 bg-primary-50 p-5 transition hover:border-accent-600 hover:shadow-sm md:grid-cols-[100px_1fr_auto] md:items-center"
        >
          <div className="grid h-24 w-full place-items-center rounded-lg bg-accent-700 text-primary-50 md:w-24">
            <CalendarDaysIcon className="h-8 w-8" />
          </div>

          <div>
            <p className="mb-1 text-xs text-primary-500">
              活動預約 #{reservation.orderCode}
            </p>
            <h3 className="mb-2 font-serif text-xl font-semibold text-primary-900">
              {reservation.title}
            </h3>
            <p className="flex flex-wrap items-center gap-2 text-sm text-primary-500">
              <CalendarDaysIcon className="h-4 w-4" />
              {reservation.dateLabel} ・ {reservation.time}
              <span>・</span>
              <span>{reservation.quantity} {reservation.unit}</span>
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="mb-3 font-serif text-2xl font-semibold text-primary-900">
              NT${Number(reservation.totalPrice || 0).toLocaleString("zh-TW")}
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              待轉帳付款
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
