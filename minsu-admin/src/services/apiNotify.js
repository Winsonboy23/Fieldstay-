// 呼叫前台的「已匯款通知」內部 API
// 環境變數：
//   VITE_NOTIFY_URL    例：http://localhost:3000  或正式 https://your-site.com
//   VITE_NOTIFY_SECRET 與前台 NOTIFY_SECRET 一致

const BASE = import.meta.env.VITE_NOTIFY_URL;
const SECRET = import.meta.env.VITE_NOTIFY_SECRET;

async function postNotify(path, body) {
  if (!BASE || !SECRET) {
    console.warn("[notify] VITE_NOTIFY_URL / VITE_NOTIFY_SECRET not set; skip");
    return { ok: false, skipped: true };
  }
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SECRET}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[notify] failed", res.status, text);
      return { ok: false, status: res.status };
    }
    return { ok: true };
  } catch (err) {
    console.error("[notify] fetch error", err);
    return { ok: false, error: err };
  }
}

export function notifyBookingPaid(bookingId) {
  return postNotify("/api/notify/booking-paid", { bookingId });
}

export function resendBookingNotification(bookingId) {
  return postNotify("/api/notify/booking-resend", { bookingId });
}

export function notifyActivityPaid(signupId) {
  return postNotify("/api/notify/activity-paid", { signupId });
}

export function resendActivityNotification(signupId) {
  return postNotify("/api/notify/activity-resend", { signupId });
}

export function notifyBookingCancelled(bookingId) {
  return postNotify("/api/notify/booking-cancelled", { bookingId });
}

export function notifyActivityCancelled(signupId) {
  return postNotify("/api/notify/activity-cancelled", { signupId });
}
