import { NextResponse } from "next/server";
import { auth } from "@/app/_lib/auth";
import {
  createShopOrder,
  getShopOrderById,
  getSettings,
} from "@/app/_lib/data-service";
import { sendMail } from "@/app/_lib/mailer";
import { shopOrderCreatedEmail } from "@/app/_lib/emailTemplates";

// RPC 丟出的錯誤碼 → 顧客看得懂的中文
const ERROR_MESSAGES = {
  EMPTY_CART: "購物車是空的",
  DUPLICATE_ITEM: "購物車資料有誤，請重新整理後再試",
  QUANTITY_INVALID: "商品數量不正確",
  PRODUCT_NOT_FOUND: "購物車中有商品規格已不存在，請重新整理後再試",
  PRODUCT_INACTIVE: "購物車中有商品已下架，請移除後再結帳",
  TEMP_MISMATCH: "同一張訂單只能包含相同溫層的商品",
  TEMP_INVALID: "商品溫層資料有誤",
  OUT_OF_STOCK: "商品庫存不足，請調整數量後再試",
  DELIVERY_MISMATCH: "此溫層不支援所選的配送方式",
  CVS_BRAND_INVALID: "請選擇取貨超商",
  CVS_STORE_REQUIRED: "請填寫取貨門市名稱與店號",
  FROZEN_CVS_UNSUPPORTED: "冷凍商品目前僅開放全家取貨",
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
  const temperature = String(payload.temperature || "").trim();
  const deliveryType = temperature === "chilled" ? "home" : "cvs";

  if (!contactName || !contactEmail || !contactPhone) {
    return NextResponse.json(
      { error: "請填寫收件人姓名、Email 與電話" },
      { status: 400 }
    );
  }

  const items = Array.isArray(payload.items)
    ? payload.items
        .map((item) => ({
          variant_id: Number(item.variantId ?? item.variant_id),
          quantity: Number(item.quantity),
        }))
        .filter((item) => item.variant_id > 0 && item.quantity > 0)
    : [];

  if (items.length === 0) {
    return NextResponse.json({ error: "購物車是空的" }, { status: 400 });
  }

  let order;
  try {
    order = await createShopOrder({
      guestId,
      contactName,
      contactEmail,
      contactPhone,
      temperature,
      deliveryType,
      items,
      cvsBrand: payload.cvsBrand ? String(payload.cvsBrand).trim() : null,
      cvsStoreId: payload.cvsStoreId ? String(payload.cvsStoreId).trim() : null,
      cvsStoreName: payload.cvsStoreName
        ? String(payload.cvsStoreName).trim()
        : null,
      cvsStoreAddress: payload.cvsStoreAddress
        ? String(payload.cvsStoreAddress).trim()
        : null,
      receiverAddress: payload.receiverAddress
        ? String(payload.receiverAddress).trim()
        : null,
      specialRequest: payload.specialRequest
        ? String(payload.specialRequest).trim()
        : null,
    });
  } catch (err) {
    const message = messageFor(err);
    if (message) return NextResponse.json({ error: message }, { status: 409 });
    console.error("shop order failed", err);
    return NextResponse.json({ error: "訂單建立失敗，請稍後再試" }, { status: 500 });
  }

  // 寄出「訂單成立，請完成匯款」通知信（失敗不擋訂單）
  try {
    const [full, settings] = await Promise.all([
      getShopOrderById(order.id),
      getSettings().catch(() => ({})),
    ]);
    const { subject, html } = shopOrderCreatedEmail({
      order: full || order,
      settings: settings || {},
      siteUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
    });
    await sendMail({ to: contactEmail, subject, html });
  } catch (mailErr) {
    console.error("shop order confirmation mail failed", mailErr);
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    orderNo: order.order_no,
    // 訪客訂單回傳 token，前端導向 thankyou 時帶上才看得到訂單
    ...(guestId ? {} : { token: order.access_token }),
  });
}
