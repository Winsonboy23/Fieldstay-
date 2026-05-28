// Internal API：手動重寄活動通知信
// - 未付款 → 重寄「報名成功，請完成匯款」(信 #1)
// - 已付款 → 重寄「匯款已確認」(信 #2)
// 不檢查 paid_email_sent_at（重寄本來就是要忽略 dedup）

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/_lib/supabase-admin";
import { getSettings } from "@/app/_lib/data-service";
import { sendMail } from "@/app/_lib/mailer";
import {
  activityCreatedEmail,
  activityPaidEmail,
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

  const { signupId } = await request.json().catch(() => ({}));
  if (!signupId) {
    return json({ error: "missing_signupId" }, { status: 400 });
  }

  const { data: signup, error } = await supabaseAdmin
    .from("activity_signups")
    .select("*, activities(*)")
    .eq("id", signupId)
    .maybeSingle();

  if (error || !signup) {
    return json({ error: "not_found" }, { status: 404 });
  }
  if (!signup.contact_email) {
    return json({ error: "no_contact_email" }, { status: 400 });
  }

  const settings = await getSettings().catch(() => ({}));
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const isPaid = signup.payment_status === "paid";

  const builder = isPaid ? activityPaidEmail : activityCreatedEmail;
  const { subject, html } = builder({
    signup: {
      id: signup.id,
      contactName: signup.contact_name,
      quantity: signup.quantity,
      customFieldAnswers: signup.custom_field_answers || {},
    },
    activity: signup.activities,
    settings: settings || {},
    siteUrl,
  });

  const result = await sendMail({ to: signup.contact_email, subject, html });
  if (!result.ok) {
    return json({ error: "send_failed" }, { status: 502 });
  }
  return json({ ok: true, sent: isPaid ? "paid" : "unpaid" });
}
