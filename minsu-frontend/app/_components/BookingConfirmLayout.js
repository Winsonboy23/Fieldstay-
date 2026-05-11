"use client";

import { useRouter } from "next/navigation";

function formatCurrency(value) {
  return `NT$${Number(value || 0).toLocaleString("zh-TW")}`;
}

export default function BookingConfirmLayout({
  systemTitle,
  title,
  user,
  onSubmit,
  isSubmitting,
  submitLabel,
  submittingLabel,
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
}) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-primary-100 text-primary-900">
      <header className="border-b border-primary-200 bg-primary-50">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-4 px-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="grid h-9 w-9 place-items-center rounded-full text-xl text-primary-900 transition hover:bg-primary-200"
            aria-label="返回"
          >
            ←
          </button>
          <span className="h-9 w-9 rounded-full bg-accent-700" />
          <span className="font-serif text-lg font-semibold">{systemTitle}</span>
        </div>
      </header>

      <div className="mx-auto max-w-[1120px] px-6 py-10">
        <h1 className="mb-8 font-serif text-3xl font-semibold tracking-wide md:text-4xl">
          {title}
        </h1>

        <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
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
              disabled={isSubmitting}
              className="w-full rounded-lg bg-accent-700 px-6 py-4 font-serif text-lg font-semibold text-white transition hover:bg-accent-800 disabled:cursor-not-allowed disabled:bg-primary-300"
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          </div>

          <aside className="h-fit rounded-2xl border border-primary-200 bg-primary-50 p-6 shadow-sm lg:sticky lg:top-8">
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
          </aside>
        </form>
      </div>
    </main>
  );
}
