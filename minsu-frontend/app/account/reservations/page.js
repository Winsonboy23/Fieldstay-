import AccountReservationActions from "@/app/_components/AccountReservationActions";
import { auth } from "@/app/_lib/auth";
import { getBookings } from "@/app/_lib/data-service";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { format, isPast } from "date-fns";
import Link from "next/link";

export const metadata = {
  title: "我的訂單",
};

const statusStyles = {
  unconfirmed: "bg-amber-100 text-amber-800",
  "checked-in": "bg-emerald-100 text-emerald-800",
  "checked-out": "bg-primary-200 text-primary-600",
};

const statusLabels = {
  unconfirmed: "待確認",
  "checked-in": "已確認",
  "checked-out": "已完成",
};

const paymentStyles = {
  paid: "bg-emerald-100 text-emerald-800",
  unpaid: "bg-rose-100 text-rose-800",
};

export default async function Page() {
  const session = await auth();
  const bookings = await getBookings(session.user.guestId);

  return (
    <section>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold text-primary-900">
          我的訂單
        </h2>
        <p className="text-sm text-primary-500">共 {bookings.length} 筆</p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-12 text-center">
          <CalendarDaysIcon className="mx-auto mb-5 h-12 w-12 text-primary-300" />
          <h3 className="mb-3 font-serif text-xl font-semibold text-primary-900">
            尚無訂單
          </h3>
          <p className="text-sm text-primary-500">
            目前還沒有訂房紀錄。先看看我們的房型。
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const isEditable = !isPast(new Date(booking.startDate));
            const status = isEditable ? booking.status : "checked-out";
            const statusClass =
              statusStyles[status] || "bg-primary-200 text-primary-600";
            const statusLabel = statusLabels[status] || "已確認";
            const paymentStatus = booking.isPaid ? "paid" : "unpaid";
            const paymentLabel = booking.isPaid ? "已付款" : "待轉帳付款";

            return (
              <article
                key={booking.id}
                className="overflow-hidden rounded-xl border border-primary-200 bg-primary-50"
              >
                <div className="grid gap-5 p-5 md:grid-cols-[100px_1fr_auto] md:items-center">
                  <Link
                    href={`/account/reservations/${booking.id}`}
                    className="relative h-24 w-full overflow-hidden rounded-lg bg-accent-700 md:w-24"
                    aria-label={`查看 ${booking.rooms?.name || "訂單"} 明細`}
                  >
                    {booking.rooms?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={booking.rooms.image}
                        alt={booking.rooms.name}
                        className="h-full w-full object-cover transition hover:scale-105"
                      />
                    ) : null}
                  </Link>

                  <div>
                    <p className="mb-1 text-xs text-primary-500">
                      訂單 #FS-{String(booking.id).padStart(4, "0")}
                    </p>
                    <Link
                      href={`/account/reservations/${booking.id}`}
                      className="mb-2 block font-serif text-xl font-semibold text-primary-900 transition hover:text-accent-700"
                    >
                      {booking.rooms?.name}
                    </Link>
                    <p className="flex flex-wrap items-center gap-2 text-sm text-primary-500">
                      <CalendarDaysIcon className="h-4 w-4" />
                      {format(new Date(booking.startDate), "yyyy / MM / dd")} →{" "}
                      {format(new Date(booking.endDate), "MM / dd")}
                      <span>・</span>
                      <span>{booking.numNights} 晚</span>
                      <span>・</span>
                      <span>{booking.numGuests} 位</span>
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="mb-3 font-serif text-2xl font-semibold text-primary-900">
                      NT${Number(booking.totalPrice).toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusClass}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        訂單：{statusLabel}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${paymentStyles[paymentStatus]}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        付款：{paymentLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-primary-200 bg-primary-100/50 px-5 py-4">
                  <AccountReservationActions
                    bookingId={booking.id}
                    roomId={booking.roomId}
                    editable={isEditable}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
