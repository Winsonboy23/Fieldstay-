// 共用寄信函式
//
// 供應者依序挑第一個能用的：
//   1. Cloudflare Email Service：部署在 Cloudflare Workers 時，wrangler.jsonc 的 `send_email` binding（EMAIL）。
//      不需要 API key；寄件網域（field-stay.com）要先在儀表板 Email Service → Email Sending 完成驗證。
//   2. Zeabur Email API：沒有 binding、或 Cloudflare 寄送失敗時，有 ZEABUR_EMAIL_API_KEY 就改走 Zeabur（舊方案）。
//   3. 都沒有：只印 log，不寄信（本機開發用）。
//
// sendMail 永遠不丟例外，失敗一律回 { ok: false, error }，不影響訂房／報名流程。

import { getCloudflareContext } from "@opennextjs/cloudflare";

const DEFAULT_FROM = "FIELDSTAY <noreply@field-stay.com>";

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

async function sendViaCloudflare(binding, { to, subject, html, text }) {
  const result = await binding.send({
    from: parseFrom(getFrom()),
    to,
    subject,
    text,
    html,
  });
  console.info("[mailer] sent via cloudflare", { to, subject, messageId: result?.messageId });
  return { ok: true, provider: "cloudflare", messageId: result?.messageId };
}

async function sendViaZeabur(apiKey, { to, subject, html, text }) {
  const res = await fetch("https://api.zeabur.com/api/v1/zsend/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from: getFrom(), to, subject, html, text }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("[mailer] zeabur send failed", res.status, body);
    return { ok: false, provider: "zeabur", error: "send_failed", status: res.status };
  }
  console.info("[mailer] sent via zeabur", { to, subject });
  return { ok: true, provider: "zeabur" };
}

export async function sendMail({ to, subject, html, text }) {
  if (!to || !subject || !html) {
    return { ok: false, error: "invalid_payload" };
  }
  const recipients = Array.isArray(to) ? to : [to];
  const message = {
    to: recipients,
    subject,
    html,
    text: text || stripHtml(html),
  };

  const binding = getEmailBinding();
  const zeaburKey = process.env.ZEABUR_EMAIL_API_KEY;

  try {
    if (binding) {
      try {
        // Email Service 一次一位收件人
        let last = { ok: true, provider: "cloudflare" };
        for (const rcpt of recipients) {
          last = await sendViaCloudflare(binding, { ...message, to: rcpt });
        }
        return last;
      } catch (err) {
        // 寄件網域尚未驗證（E_SENDER_NOT_VERIFIED）等情況：有 Zeabur key 就退回 Zeabur，否則往外丟
        console.error("[mailer] cloudflare send error", err?.code || "", err?.message || err);
        if (!zeaburKey) throw err;
      }
    }
    if (zeaburKey) {
      return await sendViaZeabur(zeaburKey, message);
    }
    console.info("[mailer] no mail provider configured, skip:", subject, "→", recipients.join(", "));
    return { ok: false, provider: "none", error: "no_provider" };
  } catch (err) {
    // Cloudflare binding 未完成寄件網域驗證時會丟出帶 code 的錯誤（例如 E_SENDER_NOT_VERIFIED）
    console.error("[mailer] send error", err?.code || "", err?.message || err);
    return { ok: false, error: err?.code || "send_error" };
  }
}

function stripHtml(html) {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
