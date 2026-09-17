// 綠界物流（電子地圖）共用設定
// 預設是測試環境：測試環境不會真的跳出地圖，而是直接回傳一間固定的測試門市。
// 正式上線時在 .env.local 設定 ECPAY_LOGISTICS_MAP_URL 與 ECPAY_LOGISTICS_MERCHANT_ID。
export const ECPAY_MAP_URL =
  process.env.ECPAY_LOGISTICS_MAP_URL ||
  "https://logistics-stage.ecpay.com.tw/Express/map";

// 2000933 是綠界公開的 C2C（店到店）測試特店
export const ECPAY_MERCHANT_ID =
  process.env.ECPAY_LOGISTICS_MERCHANT_ID || "2000933";

// 我們的超商代碼 → 綠界店到店（C2C）物流子類型
export const SUB_TYPE_BY_BRAND = {
  UNIMART: "UNIMARTC2C",
  FAMI: "FAMIC2C",
};

export const BRAND_BY_SUB_TYPE = Object.fromEntries(
  Object.entries(SUB_TYPE_BY_BRAND).map(([brand, sub]) => [sub, brand])
);

// 綠界會把使用者的瀏覽器導回這個網域，所以要是對外可連的網址。
// 開發時 dev server 的 port 不一定等於 NEXTAUTH_URL，直接用當下請求的 origin。
export function siteOrigin(request) {
  if (process.env.NODE_ENV === "development") {
    return new URL(request.url).origin;
  }
  return process.env.NEXTAUTH_URL || new URL(request.url).origin;
}
