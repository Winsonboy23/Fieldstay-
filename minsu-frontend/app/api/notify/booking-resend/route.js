// Internal API：手動重寄房間訂單通知信
// - 未付款 → 重寄「訂房成功，請完成匯款」(信 #1)
// - 已付款 → 重寄「匯款已確認」(信 #2)
// 不檢查 paid_email_sent_at

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/_lib/supabase-admin";
import { getSettings } from "@/app/_lib/data-service";
import { sendMail } from "@/app/_lib/mailer";
import {
  bookingCreatedEmail,
  bookingPaidEmail,
} from "@/app/_lib/emailTemplates";

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

  const { bookingId } = await request.json().catch(() => ({}));
  if (!bookingId) {
    return json({ error: "missing_bookingId" }, { status: 400 });
  }

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("*, rooms(*), guests(fullName, email)")
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !booking) {
    return json({ error: "not_found" }, { status: 404 });
  }

  const obs = String(booking.observations || "");
  const m = obs.match(/聯絡\s*Email[：: ]\s*([^\s\n]+)/i);
  const contactEmail = m?.[1] || booking.guests?.email;
  const nameMatch = obs.match(/訂房聯絡人[：: ]\s*([^\n]+)/);
  const contactName = nameMatch?.[1]?.trim() || booking.guests?.fullName;

  if (!contactEmail) {
    return json({ error: "no_contact_email" }, { status: 400 });
  }

  const settings = await getSettings().catch(() => ({}));
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const builder = booking.isPaid ? bookingPaidEmail : bookingCreatedEmail;
  const { subject, html } = builder({
    booking,
    room: booking.rooms,
    contactName,
    settings: settings || {},
    siteUrl,
  });

  const result = await sendMail({ to: contactEmail, subject, html });
  if (!result.ok) {
    return json({ error: "send_failed" }, { status: 502 });
  }
  return json({ ok: true, sent: booking.isPaid ? "paid" : "unpaid" });
}
