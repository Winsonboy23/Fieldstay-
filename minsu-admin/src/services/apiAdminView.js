// 用「管理者已登入 Supabase」的身分，向前台換一張短效員工證，
// 再開啟前台的訂單檢視頁。前台用 NEXTAUTH_SECRET 驗證員工證。
import supabase from "./supabase";
import { getFrontendUrl } from "../utils/frontendUrl";

async function fetchViewPass(type, id) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("尚未登入，請重新登入後再試");

  const res = await fetch(getFrontendUrl("/api/admin/view-pass"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type, id }),
  });
  if (!res.ok) {
    if (res.status === 403) throw new Error("沒有檢視權限");
    throw new Error("無法建立檢視連結，請稍後再試");
  }
  const { pass } = await res.json();
  const path =
    type === "shop"
      ? `/shop/thankyou?orderId=${id}&pass=${encodeURIComponent(pass)}`
      : `/rooms/thankyou?bookingId=${id}&pass=${encodeURIComponent(pass)}`;
  return getFrontendUrl(path);
}

// 先同步開一個空白分頁（避免被擋彈窗），拿到連結後再導過去。
export async function openAdminOrderView(type, id) {
  const win = window.open("about:blank", "_blank");
  try {
    const url = await fetchViewPass(type, id);
    if (win) win.location.href = url;
    else window.location.href = url;
  } catch (err) {
    if (win) win.close();
    throw err;
  }
}
