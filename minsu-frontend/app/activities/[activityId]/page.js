import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDaysIcon,
  ClockIcon,
  HeartIcon,
  MapPinIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { getActivity } from "@/app/_lib/data-service";
import { normalizeActivity } from "../_activity-data";

export async function generateMetadata({ params }) {
  const raw = await getActivity(params.activityId);
  const activity = normalizeActivity(raw);
  return {
    title: activity ? `${activity.shortTitle} | 活動報名` : "活動資訊",
  };
}

function formatPrice(price) {
  return `NT$${Number(price || 0).toLocaleString("zh-TW")}`;
}

export default async function ActivityDetailPage({ params }) {
  const raw = await getActivity(params.activityId);
  const activity = normalizeActivity(raw);
  if (!activity) notFound();

  const remaining = Math.max(activity.capacity - activity.registered, 0);
  const isFull = remaining === 0;

  return (
    <main className="min-h-screen bg-[#f5f3ef] text-[#111827]">
      <header className="border-b border-[#e4dfd8] bg-white">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-6">
          <Link
            href="/activities"
            className="grid h-9 w-9 place-items-center rounded-full bg-[#007d6f] text-white"
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M6 3h12l1 5-7 4-7-4 1-5Z" />
              <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
              <path d="M9 14h6" />
            </svg>
          </Link>
          <span className="font-semibold tracking-wide">活動報名系統</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1280px] gap-8 px-6 py-10 lg:grid-cols-[1fr_390px]">
        <section>
          <div
            className="relative mb-7 h-[390px] overflow-hidden rounded-2xl bg-[#0f4d3f]"
            style={
              activity.image
                ? {
                    backgroundImage: `url(${activity.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {activity.category && (
              <span className="absolute left-5 top-5 rounded-md bg-white px-3 py-1 text-xs font-bold text-[#007d6f]">
                {activity.category}
              </span>
            )}
            <button
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white text-slate-600"
              aria-label="加入收藏"
            >
              <HeartIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-7 flex gap-4">
            <div className="w-16 shrink-0 text-center">
              <div className="font-serif text-5xl font-black leading-none">
                {activity.day}
              </div>
              <div className="mt-1 text-sm uppercase tracking-widest text-slate-500">
                {activity.month}
              </div>
            </div>
            <div className="pt-1">
              <h1 className="mb-2 font-serif text-3xl font-black tracking-wide md:text-4xl">
                {activity.title}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-600">
                {activity.summary}
              </p>
            </div>
          </div>

          <div className="mb-7 flex flex-wrap gap-8 border-b border-[#ddd7cf] pb-7 text-slate-700">
            <span className="inline-flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-[#009b73]" />
              {activity.duration}
            </span>
            <span className="inline-flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5 text-[#009b73]" />
              {activity.registered} / {activity.capacity} {activity.unit || "人"}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-[#009b73]" />
              {activity.location}
            </span>
          </div>

          <section className="border-b border-[#ddd7cf] py-7">
            <h2 className="mb-5 font-serif text-2xl font-black">活動亮點</h2>
            <ul className="space-y-4 text-slate-700">
              {(activity.highlights || []).map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-current" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="border-b border-[#ddd7cf] py-7">
            <h2 className="mb-5 font-serif text-2xl font-black">活動詳情</h2>
            <div className="space-y-6 text-slate-700">
              <div className="flex gap-4">
                <CalendarDaysIcon className="mt-1 h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-bold text-slate-900">活動時間</p>
                  <p>
                    {activity.dateLabel} {activity.time}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPinIcon className="mt-1 h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-bold text-slate-900">活動地點</p>
                  <p>{activity.location}</p>
                  <p className="text-sm text-slate-500">{activity.address}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="mt-1 text-slate-500">♨</span>
                <div>
                  <p className="font-bold text-slate-900">活動講師</p>
                  <p>{activity.instructor}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-7">
            <h2 className="mb-5 font-serif text-2xl font-black">注意事項</h2>
            <ul className="list-disc space-y-3 pl-5 text-slate-600">
              {(activity.notes || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </section>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl border border-[#ddd7cf] bg-white p-6 shadow-sm">
            <div className="mb-2 font-serif text-4xl font-black">
              {formatPrice(activity.price)}{" "}
              <span className="font-sans text-lg font-normal text-slate-600">
                / {activity.unit}
              </span>
            </div>
            <p
              className={
                isFull
                  ? "mb-7 font-bold text-slate-500"
                  : "mb-7 font-bold text-red-600"
              }
            >
              {isFull ? "目前已額滿" : `剩餘 ${remaining} 名`}
            </p>
            <div className="mb-7 border-y border-[#e5dfd8] py-6 text-sm">
              <div className="mb-4 flex justify-between gap-5">
                <span className="text-slate-500">活動日期</span>
                <strong>{activity.dateLabel}</strong>
              </div>
              <div className="mb-4 flex justify-between gap-5">
                <span className="text-slate-500">活動時間</span>
                <strong>{activity.time}</strong>
              </div>
              <div className="mb-4 flex justify-between gap-5">
                <span className="text-slate-500">活動時長</span>
                <strong>{activity.duration}</strong>
              </div>
              <div className="flex justify-between gap-5">
                <span className="text-slate-500">已報名</span>
                <strong>
                  {activity.registered} / {activity.capacity} {activity.unit || "人"}
                </strong>
              </div>
            </div>
            <Link
              href={`/activities/${activity.id}/confirm`}
              className="block w-full rounded-lg bg-[#008466] px-5 py-4 text-center text-lg font-bold text-white transition hover:bg-[#006f56]"
            >
              {isFull ? "加入候補" : "立即報名"}
            </Link>
            <p className="mt-6 text-center text-sm text-slate-500">
              報名後將收到確認郵件
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
