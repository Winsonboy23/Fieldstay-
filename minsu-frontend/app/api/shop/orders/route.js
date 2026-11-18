import { NextResponse } from "next/server";
import { auth } from "@/app/_lib/auth";
import {
  createShopOrders,
  getShopOrderById,
  getSettings,
} from "@/app/_lib/data-service";
import { sendMail } from "@/app/_lib/mailer";
import {
  formatPrice,
  shopOrderCreatedEmail,
} from "@/app/_lib/emailTemplates";
import { notifyOwner } from "@/app/_lib/ownerNotify";
import { deliveryLabel } from "@/app/_lib/product-utils";

const TEMP_LABEL = { normal: "常溫", chilled: "冷藏", frozen: "冷凍", cold: "低溫" };
const CVS_LABEL = { UNIMART: "7-ELEVEN", FAMI: "全家" };

// 店家通知信的摘要列
function ownerShopRows(o) {
  const items = Array.isArray(o.shop_order_items) ? o.shop_order_items : [];
  const itemLines = items.map((item) => {
    const name = item.variant_name
      ? `${item.name}（${item.variant_name}）`
      : item.name;
    return `${name} × ${item.quantity}　${formatPrice(
      Number(item.unit_price || 0) * Number(item.quantity || 0)
    )}`;
  });
  const isCvs = o.delivery_type === "cvs";
  return [
    { label: "訂單編號", value: o.order_no },
    { label: "聯絡人", value: o.contact_name },
    { label: "聯絡 Email", value: o.contact_email },
    { label: "電話", value: o.contact_phone },
    { label: "品項", value: itemLines.join("\n") },
    { label: "商品小計", value: o.items_total != null ? formatPrice(o.items_total) : "" },
    {
      label: "運費",
      value:
        o.shipping_fee == null
          ? ""
          : Number(o.shipping_fee) === 0
          ? "免運"
          : formatPrice(o.shipping_fee),
    },
    { label: "總金額", value: formatPrice(o.total_price) },
    { label: "溫層", value: TEMP_LABEL[o.temperature] || "" },
    ...(isCvs
      ? [
          {
            label: "取貨方式",
            value: `${CVS_LABEL[o.cvs_brand] || ""} ${deliveryLabel(o)}`.trim(),
          },
          {
            label: "取貨門市",
            value: [o.cvs_store_name, o.cvs_store_id ? `（店號 ${o.cvs_store_id}）` : ""]
              .filter(Boolean)
              .join(""),
          },
          { label: "門市地址", value: o.cvs_store_address },
        ]
      : [
          { label: "配送方式", value: deliveryLabel(o) },
          { label: "收件地址", value: o.receiver_address },
        ]),
    {
      label: "總重／箱數",
      value:
        o.box_count != null
          ? `${Number((Number(o.total_weight_g || 0) / 1000).toFixed(2))} kg／${o.box_count} 箱`
          : "",
    },
    { label: "備註", value: o.special_request },
  ];
}

// RPC 丟出的錯誤碼 → 顧客看得懂的中文
const ERROR_MESSAGES = {
  EMPTY_CART: "購物車是空的",
  DUPLICATE_ITEM: "購物車資料有誤，請重新整理後再試",
  QUANTITY_INVALID: "商品數量不正確",
  PRODUCT_NOT_FOUND: "購物車中有商品規格已不存在，請重新整理後再試",
  PRODUCT_INACTIVE: "購物車中有商品已下架，請移除後再結帳",
  OUT_OF_STOCK: "商品庫存不足，請調整數量後再試",
  DELIVERY_INVALID: "請選擇配送方式",
  TEMP_INVALID: "請選擇配送方式",
  TEMP_NOT_ALLOWED:
    "購物車中有商品不能用所選的溫層寄送，請回購物車重新整理後再結帳",
  CHILLED_REQUIRES_HOME: "冷藏商品只能以黑貓冷藏宅配寄送",
  FROZEN_CVS_FAMI_ONLY: "冷凍商品的超商取貨只提供全家",
  TOO_MANY_ORDERS: "購物車資料有誤，請重新整理後再試",
  CVS_OVERWEIGHT: "總重已超過所選超商的取貨上限，請改選其他超商或宅配",
  CVS_BRAND_INVALID: "請選擇取貨超商",
  CVS_STORE_REQUIRED: "請填寫取貨門市名稱與店號",
  ADDRESS_REQUIRED: "請填寫收件地址",
};

function messageFor(err) {
  const raw = String(err?.message || "");
  const hit = Object.keys(ERROR_MESSAGES).find((code) => raw.includes(code));
  return hit ? ERROR_MESSAGES[hit] : null;
}

export async function POST(request) {
  const session = await auth();
  // 允許訪客下單：沒登入時 guest_id 記 null，訂單靠 access_token 連結查詢
  const guestId = session?.user?.guestId ?? null;

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const contactName = String(payload.contactName || "").trim();
  const contactEmail = String(payload.contactEmail || "").trim();
  const contactPhone = String(payload.contactPhone || "").trim();

  if (!contactName || !contactEmail || !contactPhone) {
    return NextResponse.json(
      { error: "請填寫收件人姓名、Email 與電話" },
      { status: 400 }
    );
  }

  const text = (value) => (value ? String(value).trim() : null);

  // 購物車依溫層分筆，一次可以結多張訂單
  const orderInputs = (Array.isArray(payload.orders) ? payload.orders : [])
    .map((entry) => {
      const deliveryType = entry?.deliveryType === "cvs" ? "cvs" : "home";
      const isCvs = deliveryType === "cvs";
      return {
        temperature: String(entry?.temperature || ""),
        deliveryType,
        items: (Array.isArray(entry?.items) ? entry.items : [])
          .map((item) => ({
            variant_id: Number(item.variantId ?? item.variant_id),
            quantity: Number(item.quantity),
          }))
          .filter((item) => item.variant_id > 0 && item.quantity > 0),
        cvsBrand: isCvs ? text(entry.cvsBrand) : null,
        cvsStoreId: isCvs ? text(entry.cvsStoreId) : null,
        cvsStoreName: isCvs ? text(entry.cvsStoreName) : null,
        cvsStoreAddress: isCvs ? text(entry.cvsStoreAddress) : null,
        receiverAddress: isCvs ? null : text(entry.receiverAddress),
      };
    })
    .filter((entry) => entry.items.length > 0);

  if (orderInputs.length === 0) {
    return NextResponse.json({ error: "購物車是空的" }, { status: 400 });
  }

  let orders;
  try {
    orders = await createShopOrders({
      guestId,
      contactName,
      contactEmail,
      contactPhone,
      specialRequest: text(payload.specialRequest),
      orders: orderInputs,
    });
  } catch (err) {
    const message = messageFor(err);
    if (message) return NextResponse.json({ error: message }, { status: 409 });
    console.error("shop order failed", err);
    return NextResponse.json({ error: "訂單建立失敗，請稍後再試" }, { status: 500 });
  }

  const settings = (await getSettings().catch(() => ({}))) || {};

  // 每張訂單各寄一封客人信與店家通知信（失敗不擋訂單）
  for (const order of orders) {
    const full = await getShopOrderById(order.id).catch(() => null);

    try {
      const { subject, html } = shopOrderCreatedEmail({
        order: full || order,
        settings,
        siteUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
      });
      await sendMail({ to: contactEmail, subject, html });
    } catch (mailErr) {
      console.error("shop order confirmation mail failed", mailErr);
    }

    try {
      const o = full || order || {};
      await notifyOwner({
        kind: "shop",
        title: `${o.contact_name || contactName} ${o.order_no || ""} ${formatPrice(
          o.total_price
        )}`.replace(/\s+/g, " "),
        summaryRows: ownerShopRows({
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          ...o,
        }),
        adminPath: `/bookings?type=shop&q=${encodeURIComponent(o.order_no || "")}`,
        settings,
      });
    } catch (notifyErr) {
      console.error("shop order owner notify failed", notifyErr);
    }
  }

  return NextResponse.json({
    ok: true,
    // 訪客訂單回傳 token，前端導向 thankyou 時帶上才看得到訂單
    orders: orders.map((order) => ({
      id: order.id,
      orderNo: order.order_no,
      ...(guestId ? {} : { token: order.access_token }),
    })),
  });
}
