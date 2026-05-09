import Link from "next/link";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

export const metadata = {
  title: "體驗預約",
};

export default function Page() {
  return (
    <section>
      <h2 className="mb-24 font-serif text-2xl font-semibold text-primary-900">
        體驗預約
      </h2>

      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <CalendarDaysIcon className="mb-8 h-12 w-12 text-primary-300" />
        <h3 className="mb-4 font-serif text-xl font-semibold text-primary-900">
          尚無體驗預約
        </h3>
        <p className="mb-8 text-sm leading-7 text-primary-500">
          炊粿體驗、農事體驗、節氣料理工作坊等活動，
          <br />
          均可在首頁「田間體驗」區塊預約。
        </p>
        <Link
          href="/activities"
          className="rounded-lg bg-accent-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-800"
        >
          探索田間體驗
        </Link>
      </div>
    </section>
  );
}
