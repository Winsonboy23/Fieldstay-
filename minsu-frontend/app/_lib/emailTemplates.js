// Email 範本（樣式 B）— 訂房 / 報名 / 已收款通知
// 沿用 auth email-hook 的視覺語言：米白底、藍色主色 #3a7ea1、Georgia 標題

const BRAND_BLUE = "#3a7ea1";

function formatPrice(n) {
  const num = Number(n || 0);
  return `NT$ ${num.toLocaleString("zh-TW")}`;
}

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shell({ title, intro, body, ctaText, ctaLink, footer }) {
  return `<!DOCTYPE html>
<html lang="zh-Hant">
  <body style="margin:0;padding:0;background:#f5f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans TC',sans-serif;color:#231f1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1ea;padding:48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf9;border:1px solid #e5dccd;border-radius:18px;padding:40px;">
            <tr>
              <td style="font-size:12px;letter-spacing:0.22em;color:${BRAND_BLUE};font-weight:700;padding-bottom:10px;">FIELDSTAY MEMBER</td>
            </tr>
            <tr>
              <td style="font-family:Georgia,serif;font-size:26px;font-weight:700;padding:8px 0 16px;">${title}</td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:1.8;color:#4a463f;padding-bottom:24px;">${intro}</td>
            </tr>
            <tr>
              <td>${body}</td>
            </tr>
            ${
              ctaText && ctaLink
                ? `<tr>
                    <td align="center" style="padding:8px 0 24px;">
                      <a href="${ctaLink}" style="display:inline-block;background:${BRAND_BLUE};color:#fff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:10px;">${ctaText}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:12px;line-height:1.7;color:#7a7468;padding-bottom:8px;">
                      如果按鈕無法點擊，請複製以下連結到瀏覽器：<br>
                      <span style="word-break:break-all;color:${BRAND_BLUE};">${ctaLink}</span>
                    </td>
                  </tr>`
                : ""
            }
            <tr>
              <td style="border-top:1px solid #ece4d5;margin-top:24px;padding-top:20px;font-size:12px;color:#9a9486;line-height:1.7;">
                ${footer || ""}<br><br>
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

function infoCard({ title, rows, accent = false }) {
  const titleBar = title
    ? `<tr><td colspan="2" style="font-size:13px;letter-spacing:0.12em;color:${
        accent ? "#fff" : BRAND_BLUE
      };background:${
        accent ? BRAND_BLUE : "transparent"
      };font-weight:700;padding:${
        accent ? "10px 16px" : "12px 16px 8px"
      };border-radius:${accent ? "8px 8px 0 0" : "0"};">${title}</td></tr>`
    : "";
  const trs = rows
    .filter((r) => r && r.value !== "" && r.value != null)
    .map(
      (r) => `<tr>
        <td style="padding:8px 16px;font-size:13px;color:#7a7468;width:110px;vertical-align:top;white-space:nowrap;">${r.label}</td>
        <td style="padding:8px 16px;font-size:14px;color:#231f1a;line-height:1.7;">${r.value}</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf6ee;border:1px solid #ece4d5;border-radius:8px;margin-bottom:18px;">
    ${titleBar}
    ${trs}
  </table>`;
}

function notesList(notes) {
  if (!Array.isArray(notes) || notes.length === 0) return "";
  const items = notes
    .map(
      (n) =>
        `<li style="margin:4px 0;line-height:1.7;font-size:14px;color:#231f1a;">${escape(
          n
        )}</li>`
    )
    .join("");
  return `<ul style="margin:6px 0 0;padding-left:20px;">${items}</ul>`;
}

function escape(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function customFieldRows(activity, signup) {
  const defs = Array.isArray(activity?.custom_fields) ? activity.custom_fields : [];
  if (defs.length === 0) return [];
  const answers = signup?.customFieldAnswers || signup?.custom_field_answers || {};
  return defs.map((f) => ({
    label: escape(f.label),
    value: escape(answers[f.label] || "—"),
  }));
}

// ============================================================
// 1A. 房間預約成功 + 請完成匯款
// ============================================================
export function bookingCreatedEmail({
  booking,
  room,
  contactName,
  settings,
  siteUrl,
}) {
  const orderId = booking.id;
  const link = `${siteUrl}/account/reservations/${orderId}`;
  const deadline = settings?.payment_deadline_hours ?? 48;

  const orderCard = infoCard({
    title: "訂單資訊",
    rows: [
      { label: "訂單編號", value: `#${orderId}` },
      { label: "房型", value: escape(room?.name) },
      { label: "入住", value: formatDate(booking.startDate) },
      {
        label: "退房",
        value: `${formatDate(booking.endDate)}（${booking.numNights} 晚）`,
      },
      { label: "人數", value: `${booking.numGuests} 位` },
      { label: "總金額", value: formatPrice(booking.totalPrice) },
    ],
  });

  const bankCard = infoCard({
    title: "匯款資訊",
    accent: true,
    rows: [
      {
        label: "銀行",
        value: `${escape(settings?.bank_name)} ${escape(settings?.bank_branch || "")}`,
      },
      { label: "戶名", value: escape(settings?.bank_account_name) },
      { label: "帳號", value: escape(settings?.bank_account_number) },
      { label: "金額", value: formatPrice(booking.totalPrice) },
      { label: "備註", value: `請填訂單編號 #${orderId}` },
      { label: "期限", value: `請於 ${deadline} 小時內完成匯款` },
    ],
  });

  return {
    subject: `【山田寓所】訂房成功 #${orderId}，請完成匯款`,
    html: shell({
      title: "訂房成功，請完成匯款",
      intro: `${escape(contactName) || "貴賓"} 您好，您的訂房已成立，請於下方期限內完成匯款，我們將盡快為您確認。`,
      body: orderCard + bankCard,
      ctaText: "查看我的訂單",
      ctaLink: link,
      footer: settings?.contact_phone
        ? `如有任何問題，請聯絡 ${escape(settings.contact_phone)}`
        : "如有任何問題，歡迎來信與我們聯繫。",
    }),
  };
}

// ============================================================
// 1B. 活動報名成功 + 請完成匯款
// ============================================================
export function activityCreatedEmail({
  signup,
  activity,
  settings,
  siteUrl,
}) {
  const orderId = signup.id;
  const link = `${siteUrl}/account/experiences/${activity.id}`;
  const deadline = settings?.payment_deadline_hours ?? 48;
  const totalPrice = Number(activity?.price || 0) * Number(signup.quantity || 1);

  const orderCard = infoCard({
    title: "報名資訊",
    rows: [
      { label: "報名編號", value: `#${orderId}` },
      { label: "活動", value: escape(activity?.title) },
      { label: "日期", value: formatDate(activity?.activity_date) },
      {
        label: "時間",
        value:
          activity?.start_time && activity?.end_time
            ? `${activity.start_time} – ${activity.end_time}`
            : activity?.start_time || "",
      },
      { label: "人數", value: `${signup.quantity} 位` },
      { label: "總金額", value: formatPrice(totalPrice) },
      ...customFieldRows(activity, signup),
    ],
  });

  const bankCard = infoCard({
    title: "匯款資訊",
    accent: true,
    rows: [
      {
        label: "銀行",
        value: `${escape(settings?.bank_name)} ${escape(settings?.bank_branch || "")}`,
      },
      { label: "戶名", value: escape(settings?.bank_account_name) },
      { label: "帳號", value: escape(settings?.bank_account_number) },
      { label: "金額", value: formatPrice(totalPrice) },
      { label: "備註", value: `請填報名編號 #${orderId}` },
      { label: "期限", value: `請於 ${deadline} 小時內完成匯款` },
    ],
  });

  return {
    subject: `【山田寓所】活動報名成功 #${orderId}，請完成匯款`,
    html: shell({
      title: "報名成功，請完成匯款",
      intro: `${escape(signup.contactName) || "貴賓"} 您好，感謝您報名「${escape(
        activity?.title || "活動"
      )}」，請於下方期限內完成匯款，我們將盡快為您確認。`,
      body: orderCard + bankCard,
      ctaText: "查看我的報名",
      ctaLink: link,
      footer: settings?.contact_phone
        ? `如有任何問題，請聯絡 ${escape(settings.contact_phone)}`
        : "如有任何問題，歡迎來信與我們聯繫。",
    }),
  };
}

// ============================================================
// 2A. 房間匯款已確認
// ============================================================
export function bookingPaidEmail({
  booking,
  room,
  contactName,
  settings,
  siteUrl,
}) {
  const orderId = booking.id;
  const link = `${siteUrl}/account/reservations/${orderId}`;

  const orderCard = infoCard({
    title: "訂單資訊",
    rows: [
      { label: "訂單編號", value: `#${orderId}` },
      { label: "房型", value: escape(room?.name) },
      { label: "入住", value: formatDate(booking.startDate) },
      {
        label: "退房",
        value: `${formatDate(booking.endDate)}（${booking.numNights} 晚）`,
      },
      { label: "人數", value: `${booking.numGuests} 位` },
      {
        label: "已付金額",
        value: `<span style="color:#15803d;font-weight:700;">${formatPrice(
          booking.totalPrice
        )} ✓</span>`,
      },
    ],
  });

  const addressFull = [room?.city, room?.address].filter(Boolean).join(" ");
  const stayCard = infoCard({
    title: "入住須知",
    accent: true,
    rows: [
      { label: "地址", value: escape(addressFull) },
      {
        label: "入住時間",
        value: room?.check_in_time ? `${room.check_in_time} 以後` : "15:00 以後",
      },
      {
        label: "退房時間",
        value: room?.check_out_time
          ? `${room.check_out_time} 以前`
          : "11:00 以前",
      },
      { label: "聯絡電話", value: escape(settings?.contact_phone) },
      { label: "Wi-Fi", value: escape(settings?.wifi_info) },
      { label: "注意事項", value: escape(settings?.house_notes) },
    ],
  });

  return {
    subject: `【山田寓所】訂單 #${orderId} 匯款已確認，期待您的到來`,
    html: shell({
      title: "匯款已確認，期待您的到來",
      intro: `${escape(contactName) || "貴賓"} 您好，我們已收到您的款項，您的訂房正式確認，以下為入住相關資訊。`,
      body: orderCard + stayCard,
      ctaText: "查看訂單詳情",
      ctaLink: link,
      footer: "期待與您相見！",
    }),
  };
}

// ============================================================
// 3A. 房間訂單已取消
// ============================================================
export function bookingCancelledEmail({
  booking,
  room,
  contactName,
  settings,
  siteUrl,
}) {
  const orderId = booking.id;
  const link = `${siteUrl}/account/reservations/${orderId}`;

  const orderCard = infoCard({
    title: "訂單資訊",
    rows: [
      { label: "訂單編號", value: `#${orderId}` },
      { label: "房型", value: escape(room?.name) },
      { label: "入住", value: formatDate(booking.startDate) },
      {
        label: "退房",
        value: `${formatDate(booking.endDate)}（${booking.numNights} 晚）`,
      },
      { label: "人數", value: `${booking.numGuests} 位` },
      {
        label: "狀態",
        value: `<span style="color:#b91c1c;font-weight:700;">已取消</span>`,
      },
    ],
  });

  return {
    subject: `【山田寓所】訂單 #${orderId} 已取消`,
    html: shell({
      title: "訂單已取消",
      intro: `${escape(contactName) || "貴賓"} 您好，您的訂房已取消，以下為訂單明細。如有任何疑問，請聯絡客服。`,
      body: orderCard,
      ctaText: "查看訂單詳情",
      ctaLink: link,
      footer: settings?.contact_phone
        ? `如有疑問，請聯絡客服 ${escape(settings.contact_phone)}`
        : "如有疑問，請聯絡客服。",
    }),
  };
}

// ============================================================
// 3B. 活動報名已取消
// ============================================================
export function activityCancelledEmail({
  signup,
  activity,
  settings,
  siteUrl,
}) {
  const orderId = signup.id;
  const link = `${siteUrl}/account/experiences/${activity?.id || ""}`;
  const totalPrice =
    Number(activity?.price || 0) * Number(signup.quantity || 1);

  const orderCard = infoCard({
    title: "報名資訊",
    rows: [
      { label: "報名編號", value: `#${orderId}` },
      { label: "活動", value: escape(activity?.title) },
      { label: "日期", value: formatDate(activity?.activity_date) },
      { label: "人數", value: `${signup.quantity} 位` },
      { label: "金額", value: formatPrice(totalPrice) },
      {
        label: "狀態",
        value: `<span style="color:#b91c1c;font-weight:700;">已取消</span>`,
      },
      ...customFieldRows(activity, signup),
    ],
  });

  return {
    subject: `【山田寓所】活動報名 #${orderId} 已取消`,
    html: shell({
      title: "報名已取消",
      intro: `${escape(signup.contactName) || "貴賓"} 您好，您報名的「${escape(
        activity?.title || "活動"
      )}」已取消。如有任何疑問，請聯絡客服。`,
      body: orderCard,
      ctaText: "查看報名詳情",
      ctaLink: link,
      footer: settings?.contact_phone
        ? `如有疑問，請聯絡客服 ${escape(settings.contact_phone)}`
        : "如有疑問，請聯絡客服。",
    }),
  };
}

// ============================================================
// 2B. 活動匯款已確認
// ============================================================
export function activityPaidEmail({
  signup,
  activity,
  settings,
  siteUrl,
}) {
  const orderId = signup.id;
  const link = `${siteUrl}/account/experiences/${activity.id}`;
  const totalPrice = Number(activity?.price || 0) * Number(signup.quantity || 1);

  const orderCard = infoCard({
    title: "報名資訊",
    rows: [
      { label: "報名編號", value: `#${orderId}` },
      { label: "活動", value: escape(activity?.title) },
      { label: "日期", value: formatDate(activity?.activity_date) },
      {
        label: "時間",
        value:
          activity?.start_time && activity?.end_time
            ? `${activity.start_time} – ${activity.end_time}`
            : activity?.start_time || "",
      },
      { label: "人數", value: `${signup.quantity} 位` },
      {
        label: "已付金額",
        value: `<span style="color:#15803d;font-weight:700;">${formatPrice(
          totalPrice
        )} ✓</span>`,
      },
      ...customFieldRows(activity, signup),
    ],
  });

  const summary = activity?.summary
    ? `<div style="margin-top:6px;font-size:14px;line-height:1.7;color:#231f1a;">${escape(
        activity.summary
      )}</div>`
    : "";
  const notes = notesList(activity?.notes);
  const notesHtml = notes
    ? `<div style="margin-top:10px;"><div style="font-size:13px;color:#7a7468;margin-bottom:4px;">注意事項</div>${notes}</div>`
    : "";

  const activityCard = infoCard({
    title: "活動資訊",
    accent: true,
    rows: [
      { label: "地點", value: escape(activity?.location) },
      { label: "地址", value: escape(activity?.address) },
      { label: "講師", value: escape(activity?.instructor) },
      { label: "聯絡電話", value: escape(settings?.contact_phone) },
      summary || notesHtml
        ? {
            label: "活動說明",
            value: summary + notesHtml,
          }
        : null,
    ],
  });

  return {
    subject: `【山田寓所】活動 #${orderId} 匯款已確認，期待與您共度時光`,
    html: shell({
      title: "報名已確認，期待與您共度時光",
      intro: `${escape(signup.contactName) || "貴賓"} 您好，我們已收到您的款項，您報名的「${escape(
        activity?.title || "活動"
      )}」正式確認，以下為活動重要資訊。`,
      body: orderCard + activityCard,
      ctaText: "查看報名詳情",
      ctaLink: link,
      footer: "期待您的參與！",
    }),
  };
}
