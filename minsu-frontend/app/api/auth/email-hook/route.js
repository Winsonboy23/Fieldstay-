import { Webhook } from "standardwebhooks";

// Supabase Send Email Hook → 由我們呼叫 Zeabur Email 寄出驗證信
// 設定方式：Supabase Dashboard → Authentication → Hooks → Send Email Hook
//   URL: https://<your-domain>/api/auth/email-hook
//   Secret: 啟用後 Supabase 會給你，貼進 SUPABASE_EMAIL_HOOK_SECRET

export const dynamic = "force-dynamic";

const HOOK_SECRET = process.env.SUPABASE_EMAIL_HOOK_SECRET;
const ZEABUR_API_KEY = process.env.ZEABUR_EMAIL_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "FIELDSTAY <noreply@field-stay.com>";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

export async function POST(req) {
  if (!HOOK_SECRET || !ZEABUR_API_KEY) {
    console.error("[email-hook] missing env: SUPABASE_EMAIL_HOOK_SECRET or ZEABUR_EMAIL_API_KEY");
    return new Response(JSON.stringify({ error: "server_misconfigured" }), { status: 500 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  let event;
  try {
    const wh = new Webhook(HOOK_SECRET.replace("v1,whsec_", ""));
    event = wh.verify(payload, headers);
  } catch (err) {
    console.error("[email-hook] invalid signature", err);
    return new Response(JSON.stringify({ error: "invalid_signature" }), { status: 401 });
  }

  const { user, email_data } = event;
  const { token_hash, redirect_to, email_action_type, site_url } = email_data;

  const verifyUrl =
    `${SUPABASE_URL}/auth/v1/verify` +
    `?token=${encodeURIComponent(token_hash)}` +
    `&type=${encodeURIComponent(email_action_type)}` +
    `&redirect_to=${encodeURIComponent(redirect_to || site_url || "")}`;

  const { subject, html, text } = buildEmail({
    type: email_action_type,
    user,
    link: verifyUrl,
  });

  const res = await fetch("https://api.zeabur.com/api/v1/zsend/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ZEABUR_API_KEY}`,
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [user.email],
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email-hook] Zeabur send failed", res.status, body);
    return new Response(JSON.stringify({ error: "send_failed" }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function buildEmail({ type, user, link }) {
  const fullName = user?.user_metadata?.fullName || "貴賓";

  if (type === "signup") {
    return {
      subject: "【山田寓所 FIELDSTAY】請驗證您的 Email 完成註冊",
      text: `${fullName} 您好，\n\n感謝您註冊山田寓所會員。請點擊以下連結完成 Email 驗證：\n${link}\n\n如果不是您本人操作，請忽略此信。\n\n— 山田寓所 FIELDSTAY`,
      html: layout({
        title: "歡迎加入山田寓所",
        intro: `${fullName} 您好，感謝您註冊山田寓所會員。請點擊下方按鈕完成 Email 驗證。`,
        cta: "驗證 Email 並啟用帳號",
        link,
        footer: "如果不是您本人操作，請忽略此信。",
      }),
    };
  }

  if (type === "recovery") {
    return {
      subject: "【山田寓所 FIELDSTAY】重設您的密碼",
      text: `${fullName} 您好，\n\n我們收到您重設密碼的請求。請點擊以下連結重設：\n${link}\n\n如果不是您本人操作，請忽略此信，您的密碼不會被更改。\n\n— 山田寓所 FIELDSTAY`,
      html: layout({
        title: "重設您的密碼",
        intro: `${fullName} 您好，我們收到您重設密碼的請求。請點擊下方按鈕設定新密碼。`,
        cta: "重設密碼",
        link,
        footer: "如果不是您本人操作，請忽略此信，您的密碼不會被更改。",
      }),
    };
  }

  if (type === "email_change_current" || type === "email_change_new") {
    return {
      subject: "【山田寓所 FIELDSTAY】確認變更 Email",
      text: `${fullName} 您好，\n\n請點擊以下連結確認 Email 變更：\n${link}\n\n— 山田寓所 FIELDSTAY`,
      html: layout({
        title: "確認 Email 變更",
        intro: `${fullName} 您好，請點擊下方按鈕確認 Email 變更。`,
        cta: "確認變更",
        link,
        footer: "如果不是您本人操作，請忽略此信。",
      }),
    };
  }

  // magiclink, invite 等其他類型 fallback
  return {
    subject: "【山田寓所 FIELDSTAY】登入連結",
    text: `${fullName} 您好，\n\n請點擊以下連結登入：\n${link}\n\n— 山田寓所 FIELDSTAY`,
    html: layout({
      title: "山田寓所 FIELDSTAY",
      intro: `${fullName} 您好，請點擊下方按鈕繼續。`,
      cta: "繼續",
      link,
      footer: "如果不是您本人操作，請忽略此信。",
    }),
  };
}

function layout({ title, intro, cta, link, footer }) {
  return `<!DOCTYPE html>
<html lang="zh-Hant">
  <body style="margin:0;padding:0;background:#f5f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans TC',sans-serif;color:#231f1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1ea;padding:48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fffdf9;border:1px solid #e5dccd;border-radius:18px;padding:40px;">
            <tr>
              <td style="font-size:12px;letter-spacing:0.22em;color:#3a7ea1;font-weight:700;margin-bottom:10px;">FIELDSTAY MEMBER</td>
            </tr>
            <tr>
              <td style="font-family:Georgia,serif;font-size:26px;font-weight:700;padding:8px 0 16px;">${title}</td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:1.8;color:#4a463f;padding-bottom:28px;">${intro}</td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:28px;">
                <a href="${link}" style="display:inline-block;background:#3a7ea1;color:#fff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:10px;">${cta}</a>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;line-height:1.7;color:#7a7468;padding-bottom:8px;">
                如果按鈕無法點擊，請複製以下連結到瀏覽器：<br>
                <span style="word-break:break-all;color:#3a7ea1;">${link}</span>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #ece4d5;margin-top:24px;padding-top:20px;font-size:12px;color:#9a9486;">
                ${footer}<br><br>
                — 山田寓所 FIELDSTAY
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
