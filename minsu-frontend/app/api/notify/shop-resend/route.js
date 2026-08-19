// Internal API：後台操作商品訂單後呼叫，寄送對應通知信
// 驗證：Authorization: Bearer <NOTIFY_SECRET>

import { NextResponse } from "next/server";
import { sendShopOrderNotification } from "@/app/_lib/shopNotify";

export const dynamic = "force-dynamic";

const NOTIFY_SECRET = process.env.NOTIFY_SECRET;
const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": ADMIN_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

function json(body, init = {}) {
  const res = NextResponse.json(body, init);
  Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export async function POST(request) {
  if (!NOTIFY_SECRET) {
    return json({ error: "server_misconfigured" }, { status: 500 });
  }
  const auth = request.headers.get("authorization") || "";
  if (auth !== `Bearer ${NOTIFY_SECRET}`) {
    return json({ error: "unauthorized" }, { status: 401 });
  }

  const { orderId } = await request.json().catch(() => ({}));
  if (!orderId) {
    return json({ error: "missing_orderId" }, { status: 400 });
  }

  const { status, body } = await sendShopOrderNotification(orderId, "resend");
  return json(body, { status });
}
