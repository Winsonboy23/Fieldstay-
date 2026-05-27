// Internal API：後台確認匯款後呼叫，寄送「匯款已確認」通知信給訂房者
// 驗證：Authorization: Bearer <NOTIFY_SECRET>

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/_lib/supabase-admin";
import { getSettings } from "@/app/_lib/data-service";
import { sendMail } from "@/app/_lib/mailer";
import { bookingPaidEmail } from "@/app/_lib/emailTemplates";

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
    console.error("booking-paid lookup failed", error);
    return json({ error: "not_found" }, { status: 404 });
  }

  if (booking.paid_email_sent_at) {
    return json({ ok: true, skipped: "already_sent" });
  }

  // 從 observations 文字中解析聯絡 email；若無則 fallback 到 guest.email
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

  const { subject, html } = bookingPaidEmail({
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

  await supabaseAdmin
    .from("bookings")
    .update({ paid_email_sent_at: new Date().toISOString() })
    .eq("id", bookingId);

  return json({ ok: true });
}
