"use client";

import { useState, useTransition } from "react";

import { cancelShopOrderAction } from "@/app/_lib/actions";

// token：訪客訂單用 access_token 授權取消（會員訂單不需要）
export default function CancelShopOrderButton({ orderId, token = null }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    setError("");
    startTransition(async () => {
      try {
        await cancelShopOrderAction(orderId, token);
        setConfirming(false);
      } catch (err) {
        setError(err?.message || "取消失敗，請稍後再試");
      }
    });
  }

  if (!confirming) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-sm text-primary-500 underline transition hover:text-clay-700"
        >
          取消這筆訂單
        </button>
        {error && <p className="mt-2 text-sm text-clay-700">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-clay-100 bg-clay-50 p-4">
      <p className="text-sm text-clay-700">
        確定要取消這筆訂單嗎？取消後商品會退回庫存，此動作無法復原。
      </p>
      {error && <p className="mt-2 text-sm text-clay-700">{error}</p>}
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
            isPending
              ? "cursor-not-allowed bg-primary-200 text-primary-500"
              : "bg-clay-500 text-white hover:bg-clay-700"
          }`}
        >
          {isPending ? "取消中…" : "確定取消"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-lg border border-primary-200 px-5 py-2 text-sm font-semibold text-primary-700 transition hover:border-primary-400"
        >
          保留訂單
        </button>
      </div>
    </div>
  );
}
