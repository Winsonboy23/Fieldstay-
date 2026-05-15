"use client";

import Link from "next/link";
import { useTransition } from "react";
import SiteHeader from "@/app/_components/SiteHeader";
import {
  ArrowDownTrayIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { deleteReservation } from "@/app/_lib/actions";

function formatCurrency(value) {
  return `NT$${Number(value || 0).toLocaleString("zh-TW")}`;
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).replaceAll("-", "/");
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-500" />
      <div>
        <p className="text-xs text-primary-500">{label}</p>
        <p className="text-sm font-semibold text-primary-900">{value || "-"}</p>
      </div>
    </div>
  );
}

export default function BookingSuccessClient({ detail, settings = {}, user = null }) {
  const [isPending, startTransition] = useTransition();
  const orderCode = detail.orderCode;
  const roomPrice = Number(detail.roomPrice || 0);
  const cleaningFee = Number(detail.cleaningFee || 0);
  const serviceFee = Number(detail.serviceFee || 0);
  const totalPrice = Number(detail.totalPrice || 0);
  const bankName = settings.bank_name || "—";
  const bankBranch = settings.bank_branch || "—";
  const bankAccountName = settings.bank_account_name || "—";
  const bankAccountNumber = settings.bank_account_number || "—";
  const contactEmail = settings.contact_email || "—";
  const contactPhone = settings.contact_phone || "—";

  function handleCancel() {
    if (!confirm("確定要取消這筆訂單嗎？")) return;
    startTransition(() => deleteReservation(detail.bookingId));
  }

  return (
    <main className="min-h-screen bg-primary-100 text-primary-900">
      <SiteHeader user={user} />

      <div className="mx-auto max-w-[960px] px-6 py-10">
        {/* Hero */}
        <section className="mb-10 text-center">
          <CheckCircleIcon className="mx-auto mb-5 h-20 w-20 text-emerald-500" />
          <h1 className="mb-2 font-serif text-3xl font-semibold tracking-wide">
            預訂成功
          </h1>
          <p className="text-sm text-primary-500">感謝您的預訂，訂單已確認</p>
        </section>

        {/* Order detail card */}
        <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl font-semibold">訂單詳情</h2>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm font-semibold transition hover:bg-primary-100"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              下載確認單
            </button>
          </div>

          {/* Order code */}
          <div className="mb-6 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-4">
            <p className="mb-1 text-xs font-semibold text-accent-700">訂單編號</p>
            <p className="font-mono text-xl font-bold tracking-wider text-accent-900">
              {orderCode}
            </p>
          </div>

          {/* Room + Contact */}
          <div className="grid gap-8 border-y border-primary-200 py-6 md:grid-cols-2">
            <div>
              <h3 className="mb-4 font-serif text-lg font-semibold">房型資訊</h3>
              <div className="space-y-4">
                <InfoRow
                  icon={MapPinIcon}
                  label="住宿"
                  value={detail.roomName || "已預訂房型"}
                />
                <InfoRow
                  icon={CalendarDaysIcon}
                  label="入住日期"
                  value={formatDate(detail.startDate)}
                />
                <InfoRow
                  icon={CalendarDaysIcon}
                  label="退房日期"
                  value={formatDate(detail.endDate)}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-serif text-lg font-semibold">聯絡資訊</h3>
              <div className="space-y-4">
                <InfoRow icon={UserIcon} label="姓名" value={detail.contactName} />
                <InfoRow
                  icon={EnvelopeIcon}
                  label="電子郵件"
                  value={detail.contactEmail}
                />
                <InfoRow
                  icon={PhoneIcon}
                  label="電話"
                  value={detail.contactPhone}
                />
              </div>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="border-b border-primary-200 py-6">
            <h3 className="mb-4 font-serif text-lg font-semibold">付款資訊</h3>
            <div className="space-y-2 text-sm text-primary-600">
              <div className="flex justify-between gap-6">
                <span>住宿費用</span>
                <span className="text-primary-900">{formatCurrency(roomPrice)}</span>
              </div>
              <div className="flex justify-between gap-6">
                <span>服務費</span>
                <span className="text-primary-900">{formatCurrency(serviceFee)}</span>
              </div>
              <div className="flex justify-between gap-6">
                <span>清潔費</span>
                <span className="text-primary-900">{formatCurrency(cleaningFee)}</span>
              </div>
              <div className="flex justify-between gap-6">
                <span>付款方式</span>
                <span className="text-primary-900">銀行轉帳</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-5 font-serif text-xl font-semibold">
            <span>總費用</span>
            <span className="text-accent-700">{formatCurrency(totalPrice)}</span>
          </div>

          {/* Bank transfer */}
          <div className="mt-2 rounded-xl border border-emerald-300 bg-emerald-50 p-6">
            <h3 className="mb-5 flex items-center gap-2 font-serif text-lg font-semibold text-accent-900">
              <BanknotesIcon className="h-5 w-5" />
              銀行轉帳資訊
            </h3>
            <dl className="grid gap-3 text-sm md:grid-cols-[110px_1fr]">
              <dt className="text-accent-700">銀行名稱</dt>
              <dd className="font-semibold">{bankName}</dd>
              <dt className="text-accent-700">分行名稱</dt>
              <dd className="font-semibold">{bankBranch}</dd>
              <dt className="text-accent-700">戶名</dt>
              <dd className="font-semibold">{bankAccountName}</dd>
              <dt className="text-accent-700">帳號</dt>
              <dd className="font-mono text-base font-semibold">
                {bankAccountNumber}
              </dd>
              <dt className="text-accent-700">轉帳金額</dt>
              <dd className="text-base font-semibold text-accent-700">
                {formatCurrency(totalPrice)}
              </dd>
              <dt className="text-accent-700">備註欄位</dt>
              <dd className="font-mono font-semibold text-red-600">{orderCode}</dd>
            </dl>
            <p className="mt-5 border-t border-emerald-200 pt-4 text-xs font-semibold text-accent-800">
              重要提醒：請於 24 小時內完成轉帳，轉帳後請提供訂單編號以便我們確認您的付款。
            </p>
          </div>
        </section>

        {/* Notice */}
        <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 text-blue-950 md:p-8">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold">
            <InformationCircleIcon className="h-5 w-5" />
            重要提醒
          </h2>
          <ul className="space-y-2 text-sm leading-6 text-blue-900">
            <li>・入住時間為當天下午 3:00 後，退房時間為上午 11:00 前</li>
            <li>・請攜帶有效身份證件辦理入住手續</li>
            <li>・如需取消或變更預訂，請提前 48 小時聯繫我們</li>
            <li>・若有任何問題，請聯繫客服：{contactEmail} 或 {contactPhone}</li>
          </ul>
        </section>

        {/* Actions */}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-primary-200 bg-primary-50 px-8 py-3 text-sm font-semibold transition hover:bg-primary-100"
          >
            返回首頁
          </Link>
          <Link
            href="/account/reservations"
            className="rounded-lg bg-accent-700 px-8 py-3 text-sm font-semibold text-white transition hover:bg-accent-800"
          >
            查看我的訂單
          </Link>
          {detail.isEditable ? (
            <button
              type="button"
              disabled={isPending}
              onClick={handleCancel}
              className="rounded-lg border border-clay-300 bg-clay-50 px-8 py-3 text-sm font-semibold text-clay-700 transition hover:bg-clay-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "取消中..." : "取消訂單"}
            </button>
          ) : null}
        </div>
      </div>
    </main>
  );
}
