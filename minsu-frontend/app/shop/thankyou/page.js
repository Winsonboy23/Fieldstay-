import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/app/_lib/auth";
import { getSettings, getShopOrderById } from "@/app/_lib/data-service";
import { verifyViewPass } from "@/app/_lib/viewPass";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";
import ShopOrderDetail, { StatusBadge } from "@/app/_components/ShopOrderDetail";
import { formatPrice } from "@/app/_lib/product-utils";
import CancelShopOrderButton from "@/app/_components/CancelShopOrderButton";

export const revalidate = 0;

export const metadata = { title: "訂單成立" };

export default async function ShopThankYouPage({ searchParams }) {
  const orderIdParam = String(searchParams?.orderId || "");
  // 一次結多筆時，orderId 與 token 是逗號分隔、順序對應
  const orderIds = orderIdParam.split(",").map((v) => v.trim()).filter(Boolean);
  const tokens = String(searchParams?.token || "").split(",");
  if (orderIds.length === 0 || orderIds.length > 3) notFound();
  const hasToken = tokens.some(Boolean);
  // 後台員工證（10 分鐘、限定這筆訂單）才算管理者檢視；&admin=1 已不再有效
  const isAdminView =
    orderIds.length === 1 &&
    verifyViewPass(searchParams?.pass, "shop", orderIds[0]);

  const session = await auth();
  // 沒帶 token、沒登入、也不是管理者檢視 → 維持原本導登入的行為
  if (!isAdminView && !hasToken && !session?.user?.guestId) {
    redirect(
      `/login?next=${encodeURIComponent(
        `/shop/thankyou?orderId=${orderIdParam}`
      )}`
    );
  }

  const orders = (
    await Promise.all(orderIds.map((id) => getShopOrderById(id)))
  ).filter(Boolean);
  if (orders.length !== orderIds.length) notFound();

  // 每一筆都要看得到才顯示。三種看得到的情況：本人、訪客憑 access_token、後台員工證
  const views = orders.map((order, index) => {
    const token = tokens[index] || "";
    const isOwner = Boolean(
      session?.user?.guestId &&
        String(order.guest_id) === String(session.user.guestId)
    );
    const isTokenView = Boolean(
      token && order.access_token && token === order.access_token
    );
    return { order, token, isOwner, isTokenView };
  });
  if (!isAdminView && views.some((v) => !v.isOwner && !v.isTokenView)) {
    notFound();
  }

  const settings = await getSettings().catch(() => ({}));
  const multi = views.length > 1;
  const first = views[0].order;
  const allCancelled = orders.every((order) => order.status === "cancelled");
  const pending = orders.filter((order) => order.status === "pending");
  const pendingTotal = pending.reduce(
    (sum, order) => sum + Number(order.total_price || 0),
    0
  );
  const deadline = settings?.payment_deadline_hours ?? 48;
  const guestView = views.some((v) => v.isTokenView && !v.isOwner);

  return (
    <>
      <SiteHeader />

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
            {allCancelled ? "訂單已取消" : "訂單已成立"}
          </h1>
          <p className="mt-2 text-sm text-primary-600">
            {multi ? (
              <>
                共 <span className="font-semibold">{orders.length}</span>{" "}
                筆訂單，溫層不同所以分開寄送
              </>
            ) : (
              <>
                訂單編號 <span className="font-semibold">{first.order_no}</span>
              </>
            )}
            ．確認信已寄至 {first.contact_email}
          </p>
        </div>

        {/* 多筆訂單：匯款資訊合併顯示一次 */}
        {multi && pending.length > 0 && (
          <section className="mb-8 rounded-xl border-2 border-accent-500 bg-accent-50 p-5">
            <h2 className="font-serif text-base font-semibold text-accent-800">
              請完成匯款
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-accent-700">
              請於 {deadline} 小時內匯款。{pending.length > 1 ? `${pending.length} 筆訂單可以合併一次匯款，` : ""}
              備註請填寫訂單編號 {pending.map((o) => o.order_no).join("、")}。
              我們確認收款後會為您出貨。
            </p>
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-primary-600">銀行</dt>
                <dd className="text-right font-medium text-primary-900">
                  {settings?.bank_name} {settings?.bank_branch || ""}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-primary-600">戶名</dt>
                <dd className="text-right font-medium text-primary-900">
                  {settings?.bank_account_name}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-primary-600">帳號</dt>
                <dd className="text-right font-semibold tracking-wide text-primary-900">
                  {settings?.bank_account_number}
                </dd>
              </div>
              {pending.map((order) => (
                <div key={order.id} className="flex justify-between gap-4">
                  <dt className="text-primary-600">{order.order_no}</dt>
                  <dd className="text-right text-primary-900">
                    {formatPrice(order.total_price)}
                  </dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-t border-accent-200 pt-2">
                <dt className="text-primary-600">應匯金額合計</dt>
                <dd className="text-right text-lg font-semibold text-primary-900">
                  {formatPrice(pendingTotal)}
                </dd>
              </div>
            </dl>
          </section>
        )}

        <div className="flex flex-col gap-10">
          {views.map(({ order, token, isOwner, isTokenView }, index) => (
            <div key={order.id}>
              {multi && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-serif text-lg font-semibold text-primary-900">
                    訂單 {index + 1}・{order.order_no}
                  </h2>
                  <StatusBadge order={order} />
                </div>
              )}

              <ShopOrderDetail order={order} settings={settings} showBank={!multi} />

              {isTokenView && !isOwner && order.status === "pending" && (
                <div className="mt-4">
                  <CancelShopOrderButton orderId={order.id} token={token} />
                </div>
              )}
            </div>
          ))}
        </div>

        {guestView && (
          <div className="mt-6 rounded-lg border border-primary-200 bg-primary-100 px-4 py-3 text-sm text-primary-700">
            <p>
              此為訪客訂單。訂單查詢連結已寄至{" "}
              <span className="font-semibold">{first.contact_email}</span>
              ，之後可從信中的「查看訂單」按鈕再次開啟{multi ? "各筆訂單" : "本頁"}。
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {guestView ? null : (
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
