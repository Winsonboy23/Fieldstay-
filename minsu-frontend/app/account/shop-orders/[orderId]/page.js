import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/app/_lib/auth";
import { getSettings, getShopOrderById } from "@/app/_lib/data-service";
import ShopOrderDetail, { StatusBadge } from "@/app/_components/ShopOrderDetail";
import CancelShopOrderButton from "./CancelShopOrderButton";

export const revalidate = 0;

export const metadata = { title: "訂單詳情" };

export default async function ShopOrderPage({ params }) {
  const session = await auth();
  const order = await getShopOrderById(params.orderId);

  if (!order) notFound();
  if (String(order.guest_id) !== String(session.user.guestId)) notFound();

  const settings = await getSettings().catch(() => ({}));

  return (
    <div>
      <Link
        href="/account/shop-orders"
        className="text-sm text-primary-500 transition hover:text-primary-900"
      >
        ← 回商品訂單
      </Link>

      <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-mono text-2xl font-semibold text-primary-900">
          {order.order_no}
        </h2>
        <StatusBadge order={order} />
      </div>

      <ShopOrderDetail order={order} settings={settings} showBank />

      {order.status === "pending" && (
        <div className="mt-8">
          <CancelShopOrderButton orderId={order.id} />
        </div>
      )}
    </div>
  );
}
