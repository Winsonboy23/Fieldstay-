// 商品訂單通知信的共用邏輯，供 /api/notify/shop-* 四條 route 使用
import { supabaseAdmin } from "./supabase-admin";
import { getSettings } from "./data-service";
import { sendMail } from "./mailer";
import {
  shopOrderCancelledEmail,
  shopOrderCreatedEmail,
  shopOrderPaidEmail,
  shopOrderShippedEmail,
} from "./emailTemplates";

// kind: 'paid' | 'shipped' | 'cancelled' | 'resend'
const GUARD_COLUMN = {
  paid: "paid_email_sent_at",
  shipped: "shipped_email_sent_at",
  cancelled: "cancelled_email_sent_at",
};

function templateFor(kind, order) {
  if (kind === "paid") return shopOrderPaidEmail;
  if (kind === "shipped") return shopOrderShippedEmail;
  if (kind === "cancelled") return shopOrderCancelledEmail;
  // resend：依訂單目前狀態挑信（同 booking-resend 的做法）
  if (order.status === "cancelled") return shopOrderCancelledEmail;
  if (["shipped", "arrived", "picked_up"].includes(order.status))
    return shopOrderShippedEmail;
  if (order.status === "paid") return shopOrderPaidEmail;
  return shopOrderCreatedEmail;
}

export async function sendShopOrderNotification(orderId, kind) {
  const { data: order, error } = await supabaseAdmin
    .from("shop_orders")
    .select("*, shop_order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return { status: 404, body: { error: "not_found" } };
  }
  if (!order.contact_email) {
    return { status: 422, body: { error: "no_contact_email" } };
  }

  const guard = GUARD_COLUMN[kind];
  if (guard && order[guard]) {
    return { status: 200, body: { ok: true, skipped: "already_sent" } };
  }

  const settings = await getSettings().catch(() => ({}));
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const builder = templateFor(kind, order);
  const { subject, html } = builder({ order, settings: settings || {}, siteUrl });

  const result = await sendMail({ to: order.contact_email, subject, html });
  if (!result?.ok) {
    console.error(`shop ${kind} mail failed`, result?.error);
    return { status: 502, body: { error: "mail_failed" } };
  }

  if (guard) {
    await supabaseAdmin
      .from("shop_orders")
      .update({ [guard]: new Date().toISOString() })
      .eq("id", orderId);
  }

  return { status: 200, body: { ok: true, sent: kind } };
}
