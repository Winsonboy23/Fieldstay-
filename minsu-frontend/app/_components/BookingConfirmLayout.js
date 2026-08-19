"use client";

import { useState } from "react";
import SiteHeader from "./SiteHeader";

function formatCurrency(value) {
  return `NT$${Number(value || 0).toLocaleString("zh-TW")}`;
}

export default function BookingConfirmLayout({
  title,
  user,
  onSubmit,
  isSubmitting,
  submitLabel,
  submittingLabel,
  submitDisabled = false,
  error,
  success,
  paymentDescription,
  specialRequestPlaceholder,
  summaryTitle = "訂單摘要",
  summaryImage,
  summaryImageAlt,
  summaryName,
  summaryRows,
  priceRows,
  totalPrice,
  extraContactFields,
  // 手機版 step 0 — 全部 optional
  mobileTitle = "查看並繼續",
  mobileSubtitle,
  mobileDateLine,
  mobileDateNote,
  mobileGuestsLine,
  cancellationPolicy,
  cancellationPolicyDetail,
  onEditDate,
  onEditGuests,
  onClose,
}) {
  const hasMobileFlow = Boolean(mobileDateLine);
  const [mobileStep, setMobileStep] = useState(0);
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  const defaultPolicyDetail = (
    <>
      <p>
        <strong>入住日前 7 天（含）以上取消：</strong>
        全額退款，不收任何手續費。
      </p>
      <p>
        <strong>入住日前 1 ~ 6 天取消：</strong>
        酌收訂單總金額 30% 作為手續費，其餘金額退還。
      </p>
      <p>
        <strong>入住當日或未通知缺席：</strong>
        恕無法退款。
      </p>
      <p>
        若因天災或政府公告之不可抗力事件無法入住，請聯繫客服協助處理。
      </p>
    </>
  );

  // 桌機版的完整 form (lg+)
  const desktopForm = (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">{formSections({
        paymentDescription,
        specialRequestPlaceholder,
        extraContactFields,
        user,
        error,
        success,
        isSubmitting,
        submitLabel,
        submittingLabel,
        submitDisabled,
      })}</div>

      <aside className="h-fit rounded-2xl border border-primary-200 bg-primary-50 p-6 shadow-sm lg:sticky lg:top-8">
        {summaryAside({
          summaryTitle,
          summaryImage,
          summaryImageAlt,
          summaryName,
          summaryRows,
          priceRows,
          totalPrice,
        })}
      </aside>
    </form>
  );

  // 手機版 step 0 — 截圖樣式 (查看並繼續)
  const mobileStep0 = (
    <div className="flex min-h-[calc(100vh-64px)] flex-col">
      <div className="flex-1 px-5 pb-32">
        {/* Header: × + title */}
        <div className="-mx-5 mb-5 flex items-center justify-between px-5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-primary-700 hover:bg-primary-100"
            aria-label="關閉"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div />
        </div>

        <h1 className="mb-6 font-serif text-2xl font-bold tracking-wide">{mobileTitle}</h1>

        {/* 房型卡 */}
        <div className="mb-6 flex gap-4 rounded-2xl border border-primary-200 bg-primary-50 p-4">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-clay-500">
            {summaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={summaryImage}
                alt={summaryImageAlt || summaryName}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl font-semibold leading-snug">
              {summaryName}
            </h2>
            {mobileSubtitle ? (
              <p className="mt-1 text-sm text-primary-600">{mobileSubtitle}</p>
            ) : null}
          </div>
        </div>

        {/* 三列資訊 */}
        <SummaryRow
          label="日期"
          value={mobileDateLine}
          note={mobileDateNote}
          onEdit={onEditDate}
          editLabel="變更"
        />
        <SummaryRow
          label="客人"
          value={mobileGuestsLine}
          onEdit={onEditGuests}
          editLabel="變更"
        />
        <SummaryRow
          label="總價"
          value={
            <span className="font-serif text-lg font-bold">
              {formatCurrency(totalPrice)}
            </span>
          }
          onEdit={() => setShowPriceDetails((v) => !v)}
          editLabel={showPriceDetails ? "收合" : "詳情"}
        />
        {showPriceDetails ? (
          <div className="mb-4 rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm">
            {priceRows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 py-1">
                <span className="text-primary-500">{row.label}</span>
                <span>{formatCurrency(row.value)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-primary-200 pt-2 font-semibold">
              <span>總費用</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        ) : null}

        {/* 取消政策 */}
        {cancellationPolicy ? (
          <div className="mt-6 text-sm leading-7 text-primary-600">
            {cancellationPolicy}
            <button
              type="button"
              onClick={() => setShowPolicy(true)}
              className="ml-1 underline underline-offset-2 hover:text-accent-700"
            >
              完整政策
            </button>
          </div>
        ) : null}
      </div>

      {/* 底部 sticky 繼續鈕 */}
      <div
        className="sticky bottom-0 left-0 right-0 border-t border-primary-200 bg-primary-50 px-5"
        style={{
          paddingTop: "12px",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
        }}
      >
        <button
          type="button"
          onClick={() => setMobileStep(1)}
          className="w-full rounded-lg bg-primary-900 px-6 py-4 font-serif text-base font-semibold text-white transition hover:bg-primary-700"
        >
          繼續
        </button>
      </div>
    </div>
  );

  // 手機版 step 1 — 既有 form
  const handleMobileBack = () => {
    if (hasMobileFlow) {
      setMobileStep(0);
    } else if (onClose) {
      onClose();
    }
  };

  const mobileStep1 = (
    <div className="px-5 pb-10">
      <div
        className="sticky top-0 z-20 -mx-5 mb-4 flex items-center gap-2 border-b border-primary-200 bg-primary-100 px-3 py-2"
        style={{ paddingTop: "max(8px, env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          onClick={handleMobileBack}
          className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full text-primary-700 active:bg-primary-200"
          aria-label="返回上一步"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="font-serif text-xl font-bold tracking-wide">填寫聯絡資訊</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {formSections({
          paymentDescription,
          specialRequestPlaceholder,
          extraContactFields,
          user,
          error,
          success,
          isSubmitting,
          submitLabel,
          submittingLabel,
          submitDisabled,
        })}
      </form>
    </div>
  );

  return (
    <main className="min-h-screen bg-primary-100 text-primary-900">
      <div className="hidden lg:block">
        <SiteHeader user={user} />
      </div>

      {/* Desktop */}
      <div className="mx-auto hidden max-w-[1120px] px-6 py-10 lg:block">
        <h1 className="mb-8 font-serif text-3xl font-semibold tracking-wide md:text-4xl">
          {title}
        </h1>
        {desktopForm}
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        {hasMobileFlow && mobileStep === 0 ? mobileStep0 : mobileStep1}
      </div>

      {showPolicy ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 lg:items-center"
          onClick={() => setShowPolicy(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-2xl bg-white shadow-2xl lg:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-primary-200 px-5 py-4">
              <h3 className="font-serif text-lg font-semibold">取消政策</h3>
              <button
                type="button"
                onClick={() => setShowPolicy(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-primary-700 hover:bg-primary-100"
                aria-label="關閉"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div
              className="space-y-4 px-5 py-5 text-sm leading-7 text-primary-700"
              style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}
            >
              {cancellationPolicyDetail || defaultPolicyDetail}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function SummaryRow({ label, value, note, onEdit, editLabel = "變更" }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3 border-b border-primary-200 pb-4">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-primary-900">{label}</div>
        <div className="mt-1 text-sm text-primary-700">{value}</div>
        {note ? <div className="mt-1 text-xs text-primary-500">{note}</div> : null}
      </div>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="flex-shrink-0 rounded-lg bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-900 hover:bg-primary-200"
        >
          {editLabel}
        </button>
      ) : null}
    </div>
  );
}

function formSections({
  paymentDescription,
  specialRequestPlaceholder,
  extraContactFields,
  user,
  error,
  success,
  isSubmitting,
  submitLabel,
  submittingLabel,
  submitDisabled = false,
}) {
  return (
    <>
      <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 md:p-8">
        <h2 className="mb-8 font-serif text-2xl font-semibold">聯絡資訊</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">姓名 *</span>
            <input
              name="contactName"
              defaultValue={user?.name || ""}
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
              defaultValue={user?.email || ""}
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
          {extraContactFields}
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
            {paymentDescription}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 md:p-8">
        <h2 className="mb-8 font-serif text-2xl font-semibold">特殊需求（選填）</h2>
        <textarea
          name="specialRequest"
          rows={5}
          placeholder={specialRequestPlaceholder}
          className="w-full resize-none rounded-lg border border-primary-300 bg-primary-50 px-4 py-3 outline-none transition focus:border-accent-600"
        />
      </section>

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || submitDisabled}
        className="w-full rounded-lg bg-accent-700 px-6 py-4 font-serif text-lg font-semibold text-white transition hover:bg-accent-800 disabled:cursor-not-allowed disabled:bg-primary-300"
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </>
  );
}

function summaryAside({
  summaryTitle,
  summaryImage,
  summaryImageAlt,
  summaryName,
  summaryRows,
  priceRows,
  totalPrice,
}) {
  return (
    <>
      <h2 className="mb-6 font-serif text-2xl font-semibold">{summaryTitle}</h2>
      <div className="mb-5 h-40 overflow-hidden rounded-xl bg-clay-500">
        {summaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={summaryImage}
            alt={summaryImageAlt || summaryName}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <h3 className="mb-4 font-serif text-xl font-semibold">{summaryName}</h3>
      <div className="space-y-2 border-y border-primary-200 py-4 text-sm">
        {summaryRows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <span className="text-primary-500">{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2 border-b border-primary-200 py-4 text-sm">
        {priceRows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <span>{row.label}</span>
            <span>{formatCurrency(row.value)}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between font-serif text-xl font-semibold">
        <span>總費用</span>
        <span>{formatCurrency(totalPrice)}</span>
      </div>
    </>
  );
}
