// 共用寄信函式 — Cloudflare Email Service
//
// 部署在 Cloudflare Workers，wrangler.jsonc 的 `send_email` binding（EMAIL）負責寄信。
// 不需要 API key；寄件網域（field-stay.com）已在儀表板 Email Service → Email Sending 完成驗證。
// 沒有 binding（例如純 next dev）時只印 log、不寄信。
//
// sendMail 永遠不丟例外，失敗一律回 { ok: false, error }，不影響訂房／報名流程。
// 線上驗證寄信用 POST /api/notify/mail-test（Bearer NOTIFY_SECRET）。

import { getCloudflareContext } from "@opennextjs/cloudflare";

const DEFAULT_FROM = "FIELDSTAY 山田寓所 <noreply@field-stay.com>";

function getFrom() {
  return process.env.EMAIL_FROM || DEFAULT_FROM;
}

// "FIELDSTAY <noreply@field-stay.com>" → { name: "FIELDSTAY", email: "noreply@field-stay.com" }
function parseFrom(from) {
  const m = String(from).match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim() || "FIELDSTAY", email: m[2].trim() };
  return { name: "FIELDSTAY", email: String(from).trim() };
}

function getEmailBinding() {
  try {
    const { env } = getCloudflareContext();
    return env?.EMAIL && typeof env.EMAIL.send === "function" ? env.EMAIL : null;
  } catch {
    // 不在 Cloudflare 環境（例如純 next dev 未啟動 OpenNext dev context）
    return null;
  }
}

export async function sendMail({ to, subject, html, text }) {
  if (!to || !subject || !html) {
    return { ok: false, error: "invalid_payload" };
  }
  const recipients = Array.isArray(to) ? to : [to];
  const message = { subject, html, text: text || stripHtml(html) };

  const binding = getEmailBinding();
  if (!binding) {
    console.info("[mailer] no EMAIL binding, skip:", subject, "→", recipients.join(", "));
    return { ok: false, provider: "none", error: "no_provider" };
  }

  try {
    // Email Service 一次一位收件人
    let last = { ok: true, provider: "cloudflare" };
    for (const rcpt of recipients) {
      const result = await binding.send({
        from: parseFrom(getFrom()),
        to: rcpt,
        ...message,
      });
      console.info("[mailer] sent via cloudflare", { to: rcpt, subject, messageId: result?.messageId });
      last = { ok: true, provider: "cloudflare", messageId: result?.messageId };
    }
    return last;
  } catch (err) {
    // 例如寄件網域驗證失效（E_SENDER_NOT_VERIFIED）、收件人在抑制名單（E_RECIPIENT_SUPPRESSED）
    console.error("[mailer] cloudflare send error", err?.code || "", err?.message || err);
    return { ok: false, provider: "cloudflare", error: err?.code || "send_error" };
  }
}

function stripHtml(html) {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
