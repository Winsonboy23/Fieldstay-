"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const BANK_INFO = {
  bankName: "台灣銀行 (004)",
  branchName: "台中分行",
  accountName: "訂房系統股份有限公司",
  accountNumber: "123-456-789012",
};

function formatCurrency(value) {
  return `NT$${Number(value || 0).toLocaleString("zh-TW")}`;
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).replaceAll("-", "/");
}

function fallbackCode(bookingId) {
  const seed = String(bookingId || Date.now()).replace(/\D/g, "").slice(-12);
  return `BK${seed.padStart(12, "0")}`;
}

export default function BookingSuccessClient({ bookingId }) {
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("fieldstay:lastBookingDetail");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!bookingId || String(parsed.bookingId) === String(bookingId)) {
        setDetail(parsed);
      }
    } catch {
      setDetail(null);
    }
  }, [bookingId]);

  const orderCode = useMemo(
    () => detail?.orderCode || fallbackCode(bookingId),
    [bookingId, detail?.orderCode]
  );

  const roomPrice = Number(detail?.roomPrice || 0);
  const cleaningFee = Number(detail?.cleaningFee || 500);
  const serviceFee = Number(detail?.serviceFee || 0);
  const extrasPrice = cleaningFee + serviceFee;
  const totalPrice = Number(detail?.totalPrice || roomPrice + extrasPrice);

  return (
    <main className="min-h-screen bg-primary-100 text-primary-900">
      <header className="border-b border-primary-200 bg-primary-50">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-4 px-6">
          <span className="h-9 w-9 rounded-full bg-accent-700" />
          <span className="font-serif text-lg font-semibold">訂房系統</span>
        </div>
      </header>

      <div className="mx-auto max-w-[960px] px-6 py-12">
        <section className="mb-12 text-center">
          <div className="mx-auto mb-7 grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="3" />
              <path d="M16 24.5l5.5 5.5L33 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M36 14l3-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="mb-4 font-serif text-4xl font-semibold tracking-wide">預訂成功！</h1>
          <p className="text-lg text-primary-500">感謝您的預定，訂單已確認</p>
        </section>

        <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 shadow-sm md:p-9">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-serif text-3xl font-semibold">訂單詳情</h2>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-primary-100"
            >
              <span aria-hidden="true">↓</span>
              下載確認單
            </button>
          </div>

          <div className="mb-7 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-4">
            <p className="mb-1 text-sm font-semibold text-accent-700">訂單編號</p>
            <p className="font-mono text-2xl font-bold tracking-wider text-accent-900">{orderCode}</p>
          </div>

          <div className="grid gap-8 border-y border-primary-200 py-7 md:grid-cols-2">
            <div>
              <h3 className="mb-5 font-serif text-xl font-semibold">房型資訊</h3>
              <div className="space-y-5 text-primary-900">
                <div className="flex gap-4">
                  <span className="text-primary-500">⌖</span>
                  <div>
                    <p className="font-semibold">{detail?.roomName || "已預訂房型"}</p>
                    <p className="text-sm text-primary-500">台中市</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-primary-500">▣</span>
                  <div>
                    <p className="text-sm text-primary-500">入住日期</p>
                    <p className="font-semibold">{formatDate(detail?.startDate)}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-primary-500">▣</span>
                  <div>
                    <p className="text-sm text-primary-500">退房日期</p>
                    <p className="font-semibold">{formatDate(detail?.endDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-5 font-serif text-xl font-semibold">聯絡資訊</h3>
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-primary-500">姓名</p>
                  <p className="font-semibold">{detail?.contactName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-500">電子郵件</p>
                  <p className="font-semibold">{detail?.contactEmail || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-500">電話</p>
                  <p className="font-semibold">{detail?.contactPhone || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-primary-200 py-7">
            <h3 className="mb-5 font-serif text-xl font-semibold">付款資訊</h3>
            <div className="space-y-3 text-primary-600">
              <div className="flex justify-between gap-6"><span>住宿費用</span><span className="text-primary-900">{formatCurrency(roomPrice)}</span></div>
              <div className="flex justify-between gap-6"><span>服務費</span><span className="text-primary-900">{formatCurrency(serviceFee)}</span></div>
              <div className="flex justify-between gap-6"><span>清潔費</span><span className="text-primary-900">{formatCurrency(cleaningFee)}</span></div>
              <div className="flex justify-between gap-6"><span>付款方式</span><span className="text-primary-900">銀行轉帳</span></div>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-primary-200 py-6 font-serif text-2xl font-semibold">
            <span>總費用</span>
            <span className="text-accent-700">{formatCurrency(totalPrice)}</span>
          </div>

          <div className="mt-7 rounded-xl border border-emerald-300 bg-emerald-50 p-6">
            <h3 className="mb-6 flex items-center gap-3 font-serif text-xl font-semibold text-accent-900">
              <span aria-hidden="true">▥</span>
              銀行轉帳資訊
            </h3>
            <div className="grid gap-4 text-sm md:grid-cols-[120px_1fr]">
              <span className="text-accent-700">銀行名稱：</span><strong>{BANK_INFO.bankName}</strong>
              <span className="text-accent-700">分行名稱：</span><strong>{BANK_INFO.branchName}</strong>
              <span className="text-accent-700">戶名：</span><strong>{BANK_INFO.accountName}</strong>
              <span className="text-accent-700">帳號：</span><strong className="font-mono text-lg">{BANK_INFO.accountNumber}</strong>
              <span className="text-accent-700">轉帳金額：</span><strong className="text-lg text-accent-700">{formatCurrency(totalPrice)}</strong>
              <span className="text-accent-700">備註欄位：</span><strong className="font-mono text-red-600">{orderCode}</strong>
            </div>
            <div className="mt-6 border-t border-emerald-200 pt-5 text-sm font-semibold text-accent-800">
              重要提醒：請於 24 小時內完成轉帳，轉帳後請提供訂單編號以便我們快速確認您的付款。
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 text-blue-950 md:p-8">
          <h2 className="mb-5 font-serif text-xl font-semibold">重要提醒</h2>
          <ul className="space-y-2 text-sm leading-7 text-blue-900">
            <li>・入住時間為當天下午 3:00 後，退房時間為上午 11:00 前</li>
            <li>・請攜帶有效身份證件辦理入住手續</li>
            <li>・如需取消或變更預訂，請提前 48 小時聯繫我們</li>
            <li>・若有任何問題，請聯繫客服：service@booking.com 或 02-1234-5678</li>
          </ul>
        </section>

        <div className="mt-7 flex justify-center gap-3">
          <Link href="/" className="rounded-lg border border-primary-200 bg-primary-50 px-9 py-3 font-semibold transition hover:bg-primary-100">
            返回首頁
          </Link>
          <Link href="/account/reservations" className="rounded-lg bg-accent-700 px-9 py-3 font-semibold text-white transition hover:bg-accent-800">
            查看我的訂單
          </Link>
        </div>
      </div>
    </main>
  );
}
