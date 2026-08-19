import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/app/_lib/auth";
import { getSettings, getShopOrderById } from "@/app/_lib/data-service";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";
import ShopOrderDetail from "@/app/_components/ShopOrderDetail";

export const revalidate = 0;

export const metadata = { title: "訂單成立" };

export default async function ShopThankYouPage({ searchParams }) {
  const orderId = searchParams?.orderId || "";
  const isAdminView = searchParams?.admin === "1";
  if (!orderId) notFound();

  const session = await auth();
  if (!session?.user?.guestId) {
    redirect(
      `/login?next=%2Fshop%2Fthankyou%3ForderId%3D${encodeURIComponent(orderId)}`
    );
  }

  const order = await getShopOrderById(orderId);
  if (!order) notFound();
  // 後台以 &admin=1 開啟時不做本人檢查（同 rooms/activities thankyou 的做法）
  if (!isAdminView && String(order.guest_id) !== String(session.user.guestId)) {
    notFound();
  }

  const settings = await getSettings().catch(() => ({}));

  return (
    <>
      <SiteHeader user={session.user} />

      <main className="mx-auto w-full max-w-3xl px-6 py-12 md:px-10">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-50">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent-600"
              aria-hidden="true"
            >
              <path d="M4 12l5 5L20 6" />
            </svg>
          </div>
          <h1 className="mt-5 font-serif text-3xl font-semibold text-primary-900">
            訂單已成立
          </h1>
          <p className="mt-2 text-sm text-primary-600">
            訂單編號 <span className="font-semibold">{order.order_no}</span>
            ．確認信已寄至 {order.contact_email}
          </p>
        </div>

        <ShopOrderDetail order={order} settings={settings} showBank />

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/account/shop-orders"
            className="rounded-lg bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-700"
          >
            查看我的訂單
          </Link>
          <Link
            href="/shop"
            className="rounded-lg border border-primary-200 px-6 py-3 text-sm font-semibold text-primary-900 transition hover:border-primary-400"
          >
            繼續選購
          </Link>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
