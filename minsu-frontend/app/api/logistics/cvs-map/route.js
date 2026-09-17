import { NextResponse } from "next/server";
import {
  ECPAY_MAP_URL,
  ECPAY_MERCHANT_ID,
  SUB_TYPE_BY_BRAND,
  siteOrigin,
} from "@/app/_lib/ecpayLogistics";

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// 綠界電子地圖只接受表單 POST，所以先回一頁會自動送出的表單。
// 選完門市後綠界會把瀏覽器 POST 回 /api/logistics/cvs-map/callback。
export function GET(request) {
  const { searchParams } = new URL(request.url);
  const subType = SUB_TYPE_BY_BRAND[searchParams.get("brand")];
  if (!subType) {
    return NextResponse.json({ error: "brand invalid" }, { status: 400 });
  }

  const isMobile = /Mobile|Android|iPhone|iPad/i.test(
    request.headers.get("user-agent") || ""
  );
  const fields = {
    MerchantID: ECPAY_MERCHANT_ID,
    // 綠界要求唯一英數編號，選店流程用不到，回傳時原樣帶回
    MerchantTradeNo: `MAP${Date.now().toString(36)}${Math.random()
      .toString(36)
      .slice(2, 8)}`.toUpperCase(),
    LogisticsType: "CVS",
    LogisticsSubType: subType,
    IsCollection: "N",
    ServerReplyURL: `${siteOrigin(request)}/api/logistics/cvs-map/callback`,
    Device: isMobile ? 1 : 0,
  };

  const inputs = Object.entries(fields)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${name}" value="${escapeAttr(value)}">`
    )
    .join("");

  const html = `<!doctype html>
<html lang="zh-Hant">
<head><meta charset="utf-8"><title>前往門市地圖</title></head>
<body onload="document.forms[0].submit()">
<p style="font-family:sans-serif;padding:2rem;text-align:center">正在前往門市地圖…</p>
<form method="post" action="${escapeAttr(ECPAY_MAP_URL)}">${inputs}</form>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
