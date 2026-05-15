import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { auth } from "@/app/_lib/auth";
import { getActivitySignupsByGuestId } from "@/app/_lib/data-service";
import { normalizeActivity } from "@/app/activities/_activity-data";

export const metadata = { title: "體驗預約" };

function orderCode(id) {
  const seed = String(id || "").replace(/\D/g, "").slice(-12);
  return `AC${seed.padStart(12, "0")}`;
}

const STATUS_STYLES = {
  paid: { cls: "bg-emerald-100 text-emerald-800", label: "已付款" },
  unpaid: { cls: "bg-rose-100 text-rose-800", label: "待轉帳付款" },
  refunded: { cls: "bg-gray-100 text-gray-700", label: "已退款" },
};

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=%2Faccount%2Fexperiences");

  const signups = session.user.guestId
    ? await getActivitySignupsByGuestId(session.user.guestId)
    : [];

  return (
    <section>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold text-primary-900">
          體驗預約
        </h2>
      </div>

      {signups.length === 0 ? (
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
      ) : (
        <div className="space-y-6">
          {signups.map((s) => {
            const activity = normalizeActivity(s.activities);
            const pay =
              STATUS_STYLES[s.payment_status] || STATUS_STYLES.unpaid;
            return (
              <Link
                key={s.id}
                href={`/activities/thankyou?signupId=${s.id}`}
                className="grid gap-5 overflow-hidden rounded-xl border border-primary-200 bg-primary-50 p-5 transition hover:border-accent-600 hover:shadow-sm md:grid-cols-[100px_1fr_auto] md:items-center"
              >
                <div
                  className="grid h-24 w-full place-items-center rounded-lg bg-accent-700 text-primary-50 md:w-24"
                  style={
                    activity?.image
                      ? {
                          backgroundImage: `url(${activity.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >
                  {!activity?.image && <CalendarDaysIcon className="h-8 w-8" />}
                </div>

                <div>
                  <p className="mb-1 text-xs text-primary-500">
                    活動預約 #{orderCode(s.id)}
                  </p>
                  <h3 className="mb-2 font-serif text-xl font-semibold text-primary-900">
                    {activity?.title || "活動已下架"}
                  </h3>
                  {activity && (
                    <p className="flex flex-wrap items-center gap-2 text-sm text-primary-500">
                      <CalendarDaysIcon className="h-4 w-4" />
                      {activity.dateLabel} ・ {activity.time}
                      <span>・</span>
                      <span>
                        {s.quantity} {activity.unit}
                      </span>
                      {s.status === "waitlist" && (
                        <>
                          <span>・</span>
                          <span className="text-amber-700 font-semibold">候補</span>
                        </>
                      )}
                    </p>
                  )}
                </div>

                <div className="text-left md:text-right">
                  <p className="mb-3 font-serif text-2xl font-semibold text-primary-900">
                    NT$
                    {Number(s.total_price || 0).toLocaleString("zh-TW")}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${pay.cls}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {pay.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
