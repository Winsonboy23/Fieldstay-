import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/app/_lib/auth";
import { getBookings } from "@/app/_lib/data-service";
import {
  ArrowLeftIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export const metadata = {
  title: "訂單明細",
};

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

function orderCode(id) {
  return `BK${String(id || "").replace(/\D/g, "").padStart(12, "0")}`;
}

function observationValue(observations, label) {
  if (!observations) return "";

  const prefix = `${label}：`;
  const line = String(observations)
    .split("\n")
    .find((item) => item.startsWith(prefix));

  return line ? line.slice(prefix.length).trim() : "";
}

function paymentLabel(isPaid) {
  return isPaid ? "已付款" : "待轉帳付款";
}

function statusLabel(status, isPaid) {
  if (!isPaid) return "未付款";
  if (status === "checked-out") return "已完成";
  if (status === "checked-in") return "已確認";
  return "待確認";
}

export default async function Page({ params }) {
  const session = await auth();
  const bookings = await getBookings(session.user.guestId);
  const booking = bookings.find(
    (item) => String(item.id) === String(params.bookingId)
  );

  if (!booking) notFound();

  const code = orderCode(booking.id);
  const roomPrice = Number(booking.roomPrice || booking.totalPrice || 0);
  const extrasPrice = Number(booking.extrasPrice || 0);
  const cleaningFee = extrasPrice >= 500 ? 500 : 0;
  const serviceFee = Math.max(0, extrasPrice - cleaningFee);
  const totalPrice = Number(booking.totalPrice || roomPrice + extrasPrice);
  const paymentMethod =
    observationValue(booking.observations, "付款方式") || "銀行轉帳";
  const contactName = observationValue(booking.observations, "訂房聯絡人");
  const contactEmail = observationValue(booking.observations, "聯絡 Email");
  const contactPhone = observationValue(booking.observations, "聯絡電話");
  const specialRequest = observationValue(booking.observations, "特殊需求");

  return (
    <section>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/account/reservations"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary-500 transition hover:text-accent-700"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            返回我的訂單
          </Link>
          <h2 className="font-serif text-2xl font-semibold text-primary-900">
            訂單明細
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
            訂單：{statusLabel(booking.status, booking.isPaid)}
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            付款：{paymentLabel(booking.isPaid)}
          </span>
        </div>
      </div>

      <article className="overflow-hidden rounded-2xl border border-primary-200 bg-primary-50 shadow-sm">
        <div className="p-6 md:p-8">
          <div className="mb-7 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-4">
            <p className="mb-1 text-sm font-semibold text-accent-700">
              訂單編號
            </p>
            <p className="font-mono text-2xl font-bold tracking-wider text-accent-900">
              {code}
            </p>
          </div>

          <div className="grid gap-8 border-y border-primary-200 py-7 lg:grid-cols-2">
            <div>
              <h3 className="mb-5 font-serif text-xl font-semibold">
                房型資訊
              </h3>
              <div className="space-y-5 text-primary-900">
                <div className="flex gap-4">
                  <MapPinIcon className="mt-1 h-5 w-5 text-primary-500" />
                  <div>
                    <p className="font-semibold">
                      {booking.rooms?.name || "已預訂房型"}
                    </p>
                    <p className="text-sm text-primary-500">台中市</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CalendarDaysIcon className="mt-1 h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-primary-500">入住日期</p>
                    <p className="font-semibold">{formatDate(booking.startDate)}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CalendarDaysIcon className="mt-1 h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-primary-500">退房日期</p>
                    <p className="font-semibold">{formatDate(booking.endDate)}</p>
                  </div>
                </div>
                <p className="text-sm text-primary-500">
                  {booking.numNights} 晚 ・ {booking.numGuests} 位
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-5 font-serif text-xl font-semibold">
                聯絡資訊
              </h3>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <UserIcon className="mt-1 h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-primary-500">姓名</p>
                    <p className="font-semibold">{contactName || "-"}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <EnvelopeIcon className="mt-1 h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-primary-500">電子郵件</p>
                    <p className="font-semibold">{contactEmail || "-"}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <PhoneIcon className="mt-1 h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-primary-500">電話</p>
                    <p className="font-semibold">{contactPhone || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-primary-200 py-7">
            <h3 className="mb-5 font-serif text-xl font-semibold">付款資訊</h3>
            <div className="space-y-3 text-primary-600">
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
                <span className="text-primary-900">{paymentMethod}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-primary-200 py-6 font-serif text-2xl font-semibold">
            <span>總費用</span>
            <span className="text-accent-700">{formatCurrency(totalPrice)}</span>
          </div>

          {!booking.isPaid ? (
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
                <strong className="text-lg text-accent-700">
                  {formatCurrency(totalPrice)}
                </strong>
                <span className="text-accent-700">備註欄位：</span>
                <strong className="font-mono text-red-600">{code}</strong>
              </div>
              <div className="mt-6 border-t border-emerald-200 pt-5 text-sm font-semibold text-accent-800">
                重要提醒：請於 24 小時內完成轉帳，轉帳後請提供訂單編號以便我們快速確認您的付款。
              </div>
            </div>
          ) : null}

          {specialRequest ? (
            <div className="mt-7 rounded-xl border border-primary-200 bg-primary-100 p-5">
              <h3 className="mb-2 font-serif text-lg font-semibold">特殊需求</h3>
              <p className="whitespace-pre-wrap text-sm leading-7 text-primary-600">
                {specialRequest}
              </p>
            </div>
          ) : null}
        </div>
      </article>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/rooms/${booking.roomId}`}
          className="rounded-lg border border-primary-200 bg-primary-50 px-6 py-3 text-sm font-semibold transition hover:bg-primary-100"
        >
          查看房型
        </Link>
        <Link
          href="/account/reservations"
          className="rounded-lg bg-accent-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-800"
        >
          返回我的訂單
        </Link>
      </div>
    </section>
  );
}
