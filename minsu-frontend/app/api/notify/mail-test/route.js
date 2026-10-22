// 寄信診斷 API：寄一封測試信並回傳 mailer 的結果（供應者、錯誤代碼）。
// 驗證：Authorization: Bearer <NOTIFY_SECRET>；body: { "to": "someone@example.com" }
// 用途：部署後確認 Cloudflare Email Service / Zeabur 是否真的能寄出，不用翻 log。

import { sendMail } from "@/app/_lib/mailer";

export const dynamic = "force-dynamic";

const NOTIFY_SECRET = process.env.NOTIFY_SECRET;

export async function POST(request) {
  if (!NOTIFY_SECRET) {
    return Response.json({ error: "server_misconfigured" }, { status: 500 });
  }
  const auth = request.headers.get("authorization") || "";
  if (auth !== `Bearer ${NOTIFY_SECRET}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const to = String(body.to || "").trim();
  if (!to || !to.includes("@")) {
    return Response.json({ error: "invalid_to" }, { status: 400 });
  }

  const sentAt = new Date().toISOString();
  const result = await sendMail({
    to,
    subject: `【山田寓所 FIELDSTAY】寄信測試 ${sentAt}`,
    html: `<p>這是一封寄信測試信，送出時間 ${sentAt}。</p><p>收到代表 field-stay.com 的寄信功能正常。</p>`,
  });

  return Response.json(
    { ...result, to, sentAt, from: process.env.EMAIL_FROM || null },
    { status: result.ok ? 200 : 502 }
  );
}
