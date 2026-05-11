"use client";

import { useEffect, useState } from "react";

export default function ExperienceDetailClient({ activityId }) {
  const [reservation, setReservation] = useState(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("fieldstay:activityReservations");
      const reservations = raw ? JSON.parse(raw) : [];
      setReservation(
        reservations.find((item) => String(item.activityId) === String(activityId)) || null
      );
    } catch {
      setReservation(null);
    }
  }, [activityId]);

  if (!reservation) return null;

  return (
    <div className="mt-7 rounded-xl border border-primary-200 bg-primary-100 p-5">
      <h3 className="mb-4 font-serif text-lg font-semibold">聯絡資訊</h3>
      <div className="grid gap-3 text-sm text-primary-600 md:grid-cols-3">
        <div>
          <p className="text-primary-500">姓名</p>
          <p className="font-semibold text-primary-900">{reservation.contactName || "-"}</p>
        </div>
        <div>
          <p className="text-primary-500">電子郵件</p>
          <p className="font-semibold text-primary-900">{reservation.contactEmail || "-"}</p>
        </div>
        <div>
          <p className="text-primary-500">電話</p>
          <p className="font-semibold text-primary-900">{reservation.contactPhone || "-"}</p>
        </div>
      </div>
      {reservation.specialRequest ? (
        <div className="mt-4 border-t border-primary-200 pt-4 text-sm leading-7 text-primary-600">
          <p className="mb-1 font-semibold text-primary-900">特殊需求</p>
          <p className="whitespace-pre-wrap">{reservation.specialRequest}</p>
        </div>
      ) : null}
    </div>
  );
}
