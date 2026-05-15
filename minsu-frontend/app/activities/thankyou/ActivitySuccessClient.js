"use client";

import Link from "next/link";
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
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

function formatCurrency(value) {
  return `NT$${Number(value || 0).toLocaleString("zh-TW")}`;
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

const PAYMENT_LABEL = {
  paid: "已付款",
  unpaid: "待轉帳付款",
  refunded: "已退款",
};

export default function ActivitySuccessClient({ detail, settings = {}, user = null }) {
  const orderCode = detail.orderCode;
  const totalPrice = Number(detail.totalPrice || 0);
  const unitPrice = detail.quantity > 0 ? totalPrice / detail.quantity : totalPrice;

  const bankName = settings.bank_name || "—";
  const bankBranch = settings.bank_branch || "—";
  const bankAccountName = settings.bank_account_name || "—";
  const bankAccountNumber = settings.bank_account_number || "—";
  const contactEmail = settings.contact_email || "—";
  const contactPhone = settings.contact_phone || "—";

  const paymentLabel =
    PAYMENT_LABEL[detail.paymentStatus] || PAYMENT_LABEL.unpaid;
  const isUnpaid = detail.paymentStatus !== "paid";
  const heroTitle = detail.isWaitlist ? "已加入候補名單" : "報名成功";
  const heroSubtitle = detail.isWaitlist
    ? "活動目前額滿，已為您加入候補，釋出名額時將通知您"
    : "感謝您的報名，活動已確認";

  return (
    <main className="min-h-screen bg-primary-100 text-primary-900">
      <SiteHeader user={user} />

      <div className="mx-auto max-w-[960px] px-6 py-10">
        <section className="mb-10 text-center">
          <CheckCircleIcon className="mx-auto mb-5 h-20 w-20 text-emerald-500" />
          <h1 className="mb-2 font-serif text-3xl font-semibold tracking-wide">
            {heroTitle}
          </h1>
          <p className="text-sm text-primary-500">{heroSubtitle}</p>
        </section>

        <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl font-semibold">報名詳情</h2>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm font-semibold transition hover:bg-primary-100"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              下載確認單
            </button>
          </div>

          <div className="mb-6 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-4">
            <p className="mb-1 text-xs font-semibold text-accent-700">預約編號</p>
            <p className="font-mono text-xl font-bold tracking-wider text-accent-900">
              {orderCode}
            </p>
            {detail.isWaitlist && (
              <p className="mt-2 text-sm font-semibold text-amber-700">
                此次報名為候補名單
              </p>
            )}
          </div>

          <div className="grid gap-8 border-y border-primary-200 py-6 md:grid-cols-2">
            <div>
              <h3 className="mb-4 font-serif text-lg font-semibold">活動資訊</h3>
              <div className="space-y-4">
                <InfoRow
                  icon={CalendarDaysIcon}
                  label="活動名稱"
                  value={detail.activityTitle}
                />
                <InfoRow
                  icon={CalendarDaysIcon}
                  label="活動日期"
                  value={`${detail.dateLabel || ""}${
                    detail.time ? ` ・ ${detail.time}` : ""
                  }`}
                />
                <InfoRow
                  icon={MapPinIcon}
                  label="活動地點"
                  value={
                    detail.location
                      ? detail.address
                        ? `${detail.location}（${detail.address}）`
                        : detail.location
                      : detail.address
                  }
                />
                <InfoRow
                  icon={UserGroupIcon}
                  label="報名人數"
                  value={`${detail.quantity} ${detail.unit || "位"}`}
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

          <div className="border-b border-primary-200 py-6">
            <h3 className="mb-4 font-serif text-lg font-semibold">付款資訊</h3>
            <div className="space-y-2 text-sm text-primary-600">
              <div className="flex justify-between gap-6">
                <span>
                  活動費用 {formatCurrency(unitPrice)} × {detail.quantity}{" "}
                  {detail.unit || "位"}
                </span>
                <span className="text-primary-900">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <div className="flex justify-between gap-6">
                <span>付款方式</span>
                <span className="text-primary-900">銀行轉帳</span>
              </div>
              <div className="flex justify-between gap-6">
                <span>付款狀態</span>
                <span className="text-primary-900">{paymentLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-5 font-serif text-xl font-semibold">
            <span>總費用</span>
            <span className="text-accent-700">{formatCurrency(totalPrice)}</span>
          </div>

          {isUnpaid && (
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
                <dd className="font-mono font-semibold text-red-600">
                  {orderCode}
                </dd>
              </dl>
              <p className="mt-5 border-t border-emerald-200 pt-4 text-xs font-semibold text-accent-800">
                重要提醒：請於 24 小時內完成轉帳，逾期視同放棄名額。轉帳後請於備註欄填入預約編號以便我們確認您的付款。
              </p>
            </div>
          )}

          {detail.specialRequest ? (
            <div className="mt-6 rounded-xl border border-primary-200 bg-primary-100 p-5 text-sm leading-7 text-primary-700">
              <p className="mb-1 font-semibold text-primary-900">特殊需求</p>
              <p className="whitespace-pre-wrap">{detail.specialRequest}</p>
            </div>
          ) : null}
        </section>

        <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 text-blue-950 md:p-8">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold">
            <InformationCircleIcon className="h-5 w-5" />
            重要提醒
          </h2>
          <ul className="space-y-2 text-sm leading-6 text-blue-900">
            <li>・請於活動開始前 15 分鐘抵達現場報到</li>
            <li>・若需取消或變更，請提前 48 小時聯繫我們</li>
            <li>・活動可能因天候或人數調整，異動將另行通知</li>
            <li>・若有任何問題，請聯繫客服：{contactEmail} 或 {contactPhone}</li>
          </ul>
        </section>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/activities"
            className="rounded-lg border border-primary-200 bg-primary-50 px-8 py-3 text-sm font-semibold transition hover:bg-primary-100"
          >
            探索更多體驗
          </Link>
          <Link
            href="/account/experiences"
            className="rounded-lg bg-accent-700 px-8 py-3 text-sm font-semibold text-white transition hover:bg-accent-800"
          >
            查看我的體驗預約
          </Link>
        </div>
      </div>
    </main>
  );
}
