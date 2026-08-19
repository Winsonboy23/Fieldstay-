import Link from "next/link";

import { auth } from "@/app/_lib/auth";
import { getShopOrdersByGuestId } from "@/app/_lib/data-service";
import { StatusBadge } from "@/app/_components/ShopOrderDetail";
import { formatPrice, getTemperature } from "@/app/_lib/product-utils";

export const revalidate = 0;

export const metadata = { title: "商品訂單" };

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

export default async function ShopOrdersPage() {
  const session = await auth();
  const orders = await getShopOrdersByGuestId(session.user.guestId);

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl font-semibold text-primary-900">
        商品訂單
      </h2>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary-300 px-6 py-16 text-center">
          <p className="text-primary-700">還沒有商品訂單</p>
          <Link
            href="/shop"
            className="mt-5 inline-flex rounded-lg bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-700"
          >
            前往選物商店
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => {
            const temp = getTemperature(order.temperature);
            const items = Array.isArray(order.shop_order_items)
              ? order.shop_order_items
              : [];
            const summary =
              items.length === 0
                ? "—"
                : items.length === 1
                ? `${items[0].name} × ${items[0].quantity}`
                : `${items[0].name} 等 ${items.length} 項商品`;

            return (
              <li key={order.id}>
                <Link
                  href={`/account/shop-orders/${order.id}`}
                  className="flex flex-col gap-3 rounded-xl border border-primary-200 bg-primary-50 p-5 transition hover:border-primary-400"
                  style={{ borderLeft: `4px solid ${temp.color}` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-sm font-semibold text-primary-900">
                      {order.order_no}
                    </span>
                    <StatusBadge order={order} />
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-sm text-primary-700">{summary}</p>
                      <p className="mt-1 text-xs text-primary-500">
                        {temp.label}．{formatDate(order.created_at)}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-primary-900">
                      {formatPrice(order.total_price)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
