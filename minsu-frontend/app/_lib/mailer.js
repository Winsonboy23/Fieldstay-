// 共用寄信函式 — 透過 Zeabur Email API
// 重用 auth email-hook 的同一組 ZEABUR_EMAIL_API_KEY / EMAIL_FROM

const ZEABUR_API_KEY = process.env.ZEABUR_EMAIL_API_KEY;
const EMAIL_FROM =
  process.env.EMAIL_FROM || "FIELDSTAY <noreply@field-stay.com>";

export async function sendMail({ to, subject, html, text }) {
  if (!ZEABUR_API_KEY) {
    console.error("[mailer] missing env ZEABUR_EMAIL_API_KEY");
    return { ok: false, error: "missing_api_key" };
  }
  if (!to || !subject || !html) {
    return { ok: false, error: "invalid_payload" };
  }

  try {
    const res = await fetch("https://api.zeabur.com/api/v1/zsend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ZEABUR_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text || stripHtml(html),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[mailer] zeabur send failed", res.status, body);
      return { ok: false, error: "send_failed", status: res.status };
    }
    return { ok: true };
  } catch (err) {
    console.error("[mailer] fetch error", err);
    return { ok: false, error: "fetch_error" };
  }
}

function stripHtml(html) {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
