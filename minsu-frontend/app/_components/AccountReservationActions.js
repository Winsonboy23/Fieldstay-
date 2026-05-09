"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteReservation } from "@/app/_lib/actions";

export default function AccountReservationActions({ bookingId, roomId, editable }) {
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    if (!confirm("確定要取消這筆訂單嗎？")) return;
    startTransition(() => deleteReservation(bookingId));
  }

  return (
    <div className="flex flex-wrap justify-end gap-3">
      <Link
        href={`/rooms/${roomId}`}
        className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-800 transition hover:border-accent-600 hover:text-accent-700"
      >
        查看房型
      </Link>
      {editable ? (
        <Link
          href={`/account/reservations/edit/${bookingId}`}
          className="rounded-lg border border-accent-600 bg-accent-50 px-4 py-2 text-sm font-semibold text-accent-700 transition hover:bg-accent-700 hover:text-white"
        >
          修改訂單
        </Link>
      ) : null}
      {editable ? (
        <button
          type="button"
          disabled={isPending}
          onClick={handleCancel}
          className="rounded-lg border border-clay-300 bg-clay-50 px-4 py-2 text-sm font-semibold text-clay-700 transition hover:bg-clay-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "取消中..." : "取消訂單"}
        </button>
      ) : (
        <button
          type="button"
          className="rounded-lg border border-accent-600 bg-accent-50 px-4 py-2 text-sm font-semibold text-accent-700 transition hover:bg-accent-700 hover:text-white"
        >
          再次訂房
        </button>
      )}
    </div>
  );
}
