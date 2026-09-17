import { NextResponse } from "next/server";
import { BRAND_BY_SUB_TYPE, siteOrigin } from "@/app/_lib/ecpayLogistics";

// 綠界電子地圖選完門市後，由使用者的瀏覽器 POST 回這裡，
// 我們把門市資料帶回結帳頁（query string），結帳頁再填進表單。
export async function POST(request) {
  const data = await request.formData().catch(() => null);
  const get = (key) => String(data?.get(key) || "").trim();

  const brand = BRAND_BY_SUB_TYPE[get("LogisticsSubType")];
  const storeId = get("CVSStoreID");
  const storeName = get("CVSStoreName");

  const url = new URL("/checkout", siteOrigin(request));
  if (!brand || !storeName || !/^\d{4,8}$/.test(storeId)) {
    url.searchParams.set("cvsMap", "error");
  } else {
    url.searchParams.set("cvsMap", "ok");
    url.searchParams.set("cvsBrand", brand);
    url.searchParams.set("cvsStoreId", storeId);
    url.searchParams.set("cvsStoreName", storeName);
    url.searchParams.set("cvsStoreAddress", get("CVSAddress"));
  }
  return NextResponse.redirect(url, 303);
}
