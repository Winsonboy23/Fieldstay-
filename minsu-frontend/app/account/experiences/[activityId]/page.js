import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { getActivityById } from "@/app/activities/_activity-data";
import ExperienceDetailClient from "./ExperienceDetailClient";

export async function generateMetadata({ params }) {
  const activity = getActivityById(params.activityId);
  return {
    title: activity ? `${activity.shortTitle} | 體驗預約明細` : "體驗預約明細",
  };
}

const BANK_INFO = {
  bankName: "台灣銀行 (004)",
  branchName: "台中分行",
  accountName: "訂房系統股份有限公司",
  accountNumber: "123-456-789012",
};

function formatCurrency(value) {
  return `NT$${Number(value || 0).toLocaleString("zh-TW")}`;
}

function orderCode(id) {
  const seed = String(id || "").replace(/\D/g, "").slice(-12);
  return `AC${seed.padStart(12, "0")}`;
}

export default function Page({ params }) {
  const activity = getActivityById(params.activityId);
  if (!activity) notFound();

  const quantity = 1;
  const totalPrice = Number(activity.price || 0) * quantity;
  const code = orderCode(activity.id);

  return (
    <section>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/account/experiences"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary-500 transition hover:text-accent-700"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            返回體驗預約
          </Link>
          <h2 className="font-serif text-2xl font-semibold text-primary-900">
            體驗預約明細
          </h2>
        </div>

        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
          付款：待轉帳付款
        </span>
      </div>

      <article className="overflow-hidden rounded-2xl border border-primary-200 bg-primary-50 shadow-sm">
        <div className="p-6 md:p-8">
          <div className="mb-7 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-4">
            <p className="mb-1 text-sm font-semibold text-accent-700">預約編號</p>
            <p className="font-mono text-2xl font-bold tracking-wider text-accent-900">
              {code}
            </p>
          </div>

          <div className="grid gap-8 border-y border-primary-200 py-7 lg:grid-cols-2">
            <div>
              <h3 className="mb-5 font-serif text-xl font-semibold">活動資訊</h3>
              <div className="space-y-5 text-primary-900">
                <div className="flex gap-4">
                  <CalendarDaysIcon className="mt-1 h-5 w-5 text-primary-500" />
                  <div>
                    <p className="font-semibold">{activity.title}</p>
                    <p className="text-sm text-primary-500">{activity.dateLabel} {activity.time}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <MapPinIcon className="mt-1 h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-primary-500">活動地點</p>
                    <p className="font-semibold">{activity.location}</p>
                    <p className="text-sm text-primary-500">{activity.address}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <UserGroupIcon className="mt-1 h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-primary-500">報名人數</p>
                    <p className="font-semibold">{quantity} {activity.unit}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-5 font-serif text-xl font-semibold">付款資訊</h3>
              <div className="space-y-3 text-primary-600">
                <div className="flex justify-between gap-6">
                  <span>活動費用</span>
                  <span className="text-primary-900">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span>付款方式</span>
                  <span className="text-primary-900">銀行轉帳</span>
                </div>
                <div className="flex justify-between gap-6 font-serif text-2xl font-semibold text-primary-900">
                  <span>總費用</span>
                  <span className="text-accent-700">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          <ExperienceDetailClient activityId={activity.id} />

          <div className="mt-7 rounded-xl border border-emerald-300 bg-emerald-50 p-6">
            <h3 className="mb-6 flex items-center gap-3 font-serif text-xl font-semibold text-accent-900">
              <BanknotesIcon className="h-6 w-6" />
              銀行轉帳資訊
            </h3>
            <div className="grid gap-4 text-sm md:grid-cols-[120px_1fr]">
              <span className="text-accent-700">銀行名稱：</span>
              <strong>{BANK_INFO.bankName}</strong>
              <span className="text-accent-700">分行名稱：</span>
              <strong>{BANK_INFO.branchName}</strong>
              <span className="text-accent-700">戶名：</span>
              <strong>{BANK_INFO.accountName}</strong>
              <span className="text-accent-700">帳號：</span>
              <strong className="font-mono text-lg">{BANK_INFO.accountNumber}</strong>
              <span className="text-accent-700">轉帳金額：</span>
              <strong className="text-lg text-accent-700">{formatCurrency(totalPrice)}</strong>
              <span className="text-accent-700">備註欄位：</span>
              <strong className="font-mono text-red-600">{code}</strong>
            </div>
            <div className="mt-6 border-t border-emerald-200 pt-5 text-sm font-semibold text-accent-800">
              活動報名目前為前台暫存，正式寫入後台需另接活動報名 API。
            </div>
          </div>
        </div>
      </article>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/activities/${activity.id}`}
          className="rounded-lg border border-primary-200 bg-primary-50 px-6 py-3 text-sm font-semibold transition hover:bg-primary-100"
        >
          查看活動
        </Link>
        <Link
          href="/account/experiences"
          className="rounded-lg bg-accent-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-800"
        >
          返回體驗預約
        </Link>
      </div>
    </section>
  );
}
