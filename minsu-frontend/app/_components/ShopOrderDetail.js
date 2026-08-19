import { formatPrice, getTemperature } from "../_lib/product-utils";

export const SHOP_STATUS = {
  pending: { label: "待匯款", className: "bg-clay-50 text-clay-700 border-clay-100" },
  paid: { label: "已收款・備貨中", className: "bg-accent-50 text-accent-700 border-accent-200" },
  shipped: { label: "已出貨", className: "bg-accent-50 text-accent-700 border-accent-200" },
  arrived: { label: "已到店", className: "bg-accent-50 text-accent-700 border-accent-200" },
  picked_up: { label: "已完成", className: "bg-primary-100 text-primary-700 border-primary-200" },
  cancelled: { label: "已取消", className: "bg-primary-100 text-primary-500 border-primary-200" },
};

export function statusOf(order) {
  return SHOP_STATUS[order?.status] || SHOP_STATUS.pending;
}

export function StatusBadge({ order }) {
  const status = statusOf(order);
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
    >
      {status.label}
    </span>
  );
}

const CVS_LABEL = { UNIMART: "7-ELEVEN", FAMI: "全家" };

export default function ShopOrderDetail({ order, settings, showBank = false }) {
  const temp = getTemperature(order.temperature);
  const items = Array.isArray(order.shop_order_items) ? order.shop_order_items : [];
  const isCvs = order.delivery_type === "cvs";
  const deadline = settings?.payment_deadline_hours ?? 48;

  return (
    <div className="flex flex-col gap-6">
      {/* 匯款資訊 */}
      {showBank && order.status === "pending" && (
        <section className="rounded-xl border-2 border-accent-500 bg-accent-50 p-5">
          <h2 className="font-serif text-base font-semibold text-accent-800">
            請完成匯款
          </h2>
          <p className="mt-1 text-xs text-accent-700">
            請於 {deadline} 小時內匯款，並在備註填寫訂單編號 {order.order_no}。
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
            <div className="flex justify-between gap-4 border-t border-accent-200 pt-2">
              <dt className="text-primary-600">應匯金額</dt>
              <dd className="text-right text-lg font-semibold text-primary-900">
                {formatPrice(order.total_price)}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {/* 訂購商品 */}
      <section className="overflow-hidden rounded-xl border border-primary-200 bg-primary-50">
        <header
          className="flex flex-wrap items-center justify-between gap-2 border-b border-primary-200 px-5 py-4"
          style={{ borderTop: `3px solid ${temp.color}` }}
        >
          <h2 className="font-serif text-base font-semibold text-primary-900">
            訂購商品
          </h2>
          <span className="text-xs text-primary-500">
            {temp.label}・{temp.delivery}
          </span>
        </header>

        <ul className="divide-y divide-primary-200">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-primary-900">{item.name}</p>
                <p className="mt-0.5 text-xs text-primary-500">
                  {formatPrice(item.unit_price)} × {item.quantity}
                </p>
              </div>
              <span className="whitespace-nowrap text-sm font-semibold text-primary-900">
                {formatPrice(item.unit_price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-primary-200 bg-primary-100 px-5 py-4 text-sm">
          <div className="flex justify-between text-primary-600">
            <span>商品小計</span>
            <span>{formatPrice(order.items_total)}</span>
          </div>
          <div className="mt-1 flex justify-between text-primary-600">
            <span>運費</span>
            <span>
              {order.shipping_fee === 0 ? (
                <span className="font-medium text-accent-600">免運</span>
              ) : (
                formatPrice(order.shipping_fee)
              )}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t border-primary-200 pt-2">
            <span className="text-primary-600">訂單總計</span>
            <span className="text-xl font-semibold text-primary-900">
              {formatPrice(order.total_price)}
            </span>
          </div>
        </div>
      </section>

      {/* 配送資訊 */}
      <section className="rounded-xl border border-primary-200 bg-primary-50 p-5">
        <h2 className="font-serif text-base font-semibold text-primary-900">
          配送資訊
        </h2>
        <dl className="mt-4 divide-y divide-primary-200 text-sm">
          {isCvs ? (
            <>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-primary-500">取貨方式</dt>
                <dd className="text-right font-medium text-primary-900">
                  {CVS_LABEL[order.cvs_brand] || ""} 超商取貨
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-primary-500">取貨門市</dt>
                <dd className="text-right font-medium text-primary-900">
                  {order.cvs_store_name}（{order.cvs_store_id}）
                </dd>
              </div>
              {order.cvs_store_address && (
                <div className="flex justify-between gap-4 py-2.5">
                  <dt className="text-primary-500">門市地址</dt>
                  <dd className="text-right font-medium text-primary-900">
                    {order.cvs_store_address}
                  </dd>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-primary-500">配送方式</dt>
                <dd className="text-right font-medium text-primary-900">
                  低溫宅配
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-primary-500">收件地址</dt>
                <dd className="text-right font-medium text-primary-900">
                  {order.receiver_address}
                </dd>
              </div>
            </>
          )}
          <div className="flex justify-between gap-4 py-2.5">
            <dt className="text-primary-500">收件人</dt>
            <dd className="text-right font-medium text-primary-900">
              {order.contact_name}
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-2.5">
            <dt className="text-primary-500">聯絡電話</dt>
            <dd className="text-right font-medium text-primary-900">
              {order.contact_phone}
            </dd>
          </div>
          {order.logistics_no && (
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-primary-500">寄件單號</dt>
              <dd className="text-right font-medium text-primary-900">
                {order.logistics_no}
              </dd>
            </div>
          )}
          {order.special_request && (
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-primary-500">訂單備註</dt>
              <dd className="text-right font-medium text-primary-900">
                {order.special_request}
              </dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
}
