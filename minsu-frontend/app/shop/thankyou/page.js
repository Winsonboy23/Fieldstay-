import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/app/_lib/auth";
import { getSettings, getShopOrderById } from "@/app/_lib/data-service";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";
import ShopOrderDetail from "@/app/_components/ShopOrderDetail";
import CancelShopOrderButton from "@/app/_components/CancelShopOrderButton";

export const revalidate = 0;

export const metadata = { title: "訂單成立" };

export default async function ShopThankYouPage({ searchParams }) {
  const orderId = searchParams?.orderId || "";
  const token = searchParams?.token || "";
  const isAdminView = searchParams?.admin === "1";
  if (!orderId) notFound();

  const session = await auth();
  // 沒帶 token 又沒登入 → 維持原本導登入的行為
  if (!token && !session?.user?.guestId) {
    redirect(
      `/login?next=%2Fshop%2Fthankyou%3ForderId%3D${encodeURIComponent(orderId)}`
    );
  }

  const order = await getShopOrderById(orderId);
  if (!order) notFound();
  // 三種看得到的情況：本人、訪客憑 access_token、後台以 &admin=1 開啟
  const isOwner =
    session?.user?.guestId &&
    String(order.guest_id) === String(session.user.guestId);
  const isTokenView = Boolean(
    token && order.access_token && token === order.access_token
  );
  if (!isAdminView && !isOwner && !isTokenView) {
    notFound();
  }

  const settings = await getSettings().catch(() => ({}));

  return (
    <>
      <SiteHeader user={session?.user} />

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
            {order.status === "cancelled" ? "訂單已取消" : "訂單已成立"}
          </h1>
          <p className="mt-2 text-sm text-primary-600">
            訂單編號 <span className="font-semibold">{order.order_no}</span>
            ．確認信已寄至 {order.contact_email}
          </p>
        </div>

        <ShopOrderDetail order={order} settings={settings} showBank />

        {isTokenView && !isOwner && (
          <div className="mt-6 rounded-lg border border-primary-200 bg-primary-100 px-4 py-3 text-sm text-primary-700">
            <p>
              此為訪客訂單。訂單查詢連結已寄至{" "}
              <span className="font-semibold">{order.contact_email}</span>
              ，之後可從信中的「查看訂單」按鈕再次開啟本頁。
            </p>
            {order.status === "pending" && (
              <div className="mt-3">
                <CancelShopOrderButton orderId={order.id} token={token} />
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {isTokenView && !isOwner ? null : (
            <Link
              href="/account/shop-orders"
              className="rounded-lg bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-700"
            >
              查看商品訂單
            </Link>
          )}
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
