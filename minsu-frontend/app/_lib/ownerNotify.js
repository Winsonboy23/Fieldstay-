// 店家通知信 — 客人成立訂房／活動報名／商店訂單時，寄一封摘要信給店家
//
// 收件人：環境變數 NOTIFY_EMAIL（可用逗號分隔多個）；未設定就只印 log、不寄。
// 「到後台查看」連結：ADMIN_ORIGIN + adminPath（例如 /bookings/123）。
// 與 sendMail 一樣永不丟例外，失敗回 { ok: false, error }，不影響訂單流程。

import { sendMail } from "./mailer";
import { ownerNoticeEmail } from "./emailTemplates";

function getRecipients() {
  return String(process.env.NOTIFY_EMAIL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function notifyOwner({
  kind,
  title,
  summaryRows,
  note,
  adminPath = "",
  settings,
}) {
  try {
    const to = getRecipients();
    if (to.length === 0) {
      console.info("[ownerNotify] NOTIFY_EMAIL not set, skip:", kind, title);
      return { ok: false, error: "no_notify_email" };
    }

    const origin = String(process.env.ADMIN_ORIGIN || "").replace(/\/+$/, "");
    const adminUrl = origin ? `${origin}${adminPath}` : "";

    const { subject, html, text } = ownerNoticeEmail({
      kind,
      title,
      summaryRows,
      note,
      adminUrl,
      settings,
    });
    return await sendMail({ to, subject, html, text });
  } catch (err) {
    console.error("[ownerNotify] failed", err?.message || err);
    return { ok: false, error: "owner_notify_error" };
  }
}
