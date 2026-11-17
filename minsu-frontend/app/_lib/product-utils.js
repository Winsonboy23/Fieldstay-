// 溫層設定與運費試算。
// 運費規則必須與 DB 的 create_shop_order_v2 RPC 一致，那裡才是最終計價依據；
// 這裡只負責前台顯示試算。
//
// 商品溫層有三種：normal 只能常溫／cold 必須低溫（冷藏、冷凍）／flex 兩種都可以。
// 訂單溫層只有兩種：購物車只要有一件「必須低溫」，整筆就是 cold，否則 normal。
// 舊資料的 chilled、frozen 一律視為 cold。
export const TEMPERATURES = [
  {
    value: "normal",
    label: "常溫",
    color: "#3276A8",
    delivery: "超商取貨或宅配",
    short: "常溫配送",
  },
  {
    value: "flex",
    label: "常溫／低溫",
    color: "#7A6FA8",
    delivery: "可常溫或低溫配送",
    short: "常溫或低溫",
  },
  {
    value: "cold",
    label: "低溫",
    color: "#3A8D83",
    delivery: "黑貓低溫宅配",
    short: "低溫宅配",
  },
];

export const TEMPERATURE_ORDER = ["normal", "flex", "cold"];

export function normalizeProductTemp(value) {
  if (value === "cold" || value === "chilled" || value === "frozen") return "cold";
  if (value === "flex") return "flex";
  return "normal";
}

export function getTemperature(value) {
  const key = normalizeProductTemp(value);
  return TEMPERATURES.find((t) => t.value === key) || TEMPERATURES[0];
}

// 訂單上的溫層標籤：舊訂單保留當時的「冷藏／冷凍」字樣
const ORDER_TEMPERATURES = {
  normal: { value: "normal", label: "常溫", color: "#3276A8" },
  cold: { value: "cold", label: "低溫", color: "#3A8D83" },
  chilled: { value: "cold", label: "冷藏", color: "#3A8D83" },
  frozen: { value: "cold", label: "冷凍", color: "#B44B4B" },
};

export function getOrderTemperature(value) {
  return ORDER_TEMPERATURES[value] || ORDER_TEMPERATURES.normal;
}

// 訂單的配送方式文字（舊的冷凍訂單是超商冷凍取貨）
export function deliveryLabel(order) {
  if (order?.delivery_type === "cvs") return "超商取貨";
  return getOrderTemperature(order?.temperature).value === "cold"
    ? "低溫宅配"
    : "宅配";
}

// 價格與庫存都在規格層；unitPrice / isSoldOut 皆以規格為對象
export function unitPrice(variant) {
  return Math.max(Number(variant?.price || 0) - Number(variant?.discount || 0), 0);
}

export function isSoldOut(variant) {
  return (
    variant?.stock !== null && variant?.stock !== undefined && variant.stock <= 0
  );
}

export function variantsOf(product) {
  return Array.isArray(product?.variants) ? product.variants : [];
}

// 是否要顯示規格選擇器：只有一筆且沒有名稱時視為「無規格區分」
export function hasVariantChoice(product) {
  const variants = variantsOf(product);
  return variants.length > 1 || (variants.length === 1 && !!variants[0].name);
}

export function firstAvailableVariant(product) {
  const variants = variantsOf(product);
  return variants.find((v) => !isSoldOut(v)) || variants[0] || null;
}

export function isProductSoldOut(product) {
  const variants = variantsOf(product);
  return variants.length > 0 && variants.every(isSoldOut);
}

// 商品卡的價格顯示：多規格時給區間
export function priceRange(product) {
  const prices = variantsOf(product).map(unitPrice);
  if (prices.length === 0) return { min: 0, max: 0, isRange: false };
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max, isRange: min !== max };
}

// ── 運費試算 ──────────────────────────────────────────────
// lines: [{ product, variant, qty }]

export const CVS_BRANDS = [
  {
    value: "UNIMART",
    label: "7-ELEVEN",
    url: "https://emap.pcsc.com.tw/",
  },
  {
    value: "FAMI",
    label: "全家",
    url: "https://www.family.com.tw/Marketing/inquiry/inquiry_store.aspx",
  },
];

// 購物車只要有一件必須低溫，整筆就走低溫
export function orderTemperatureOf(lines) {
  return lines.some((line) => normalizeProductTemp(line.product?.temperature) === "cold")
    ? "cold"
    : "normal";
}

// 沒有必須低溫的商品、但有「兩種都可以」的商品時，客人可以自己選擇整筆走低溫
export function canChooseCold(lines) {
  return (
    orderTemperatureOf(lines) !== "cold" &&
    lines.some((line) => normalizeProductTemp(line.product?.temperature) === "flex")
  );
}

// 沒填重量的規格先當 0 計（與 RPC 一致）
export function totalWeightG(lines) {
  return lines.reduce(
    (sum, line) => sum + Number(line.variant?.weight_g || 0) * Number(line.qty || 0),
    0
  );
}

export function formatWeight(grams) {
  const g = Number(grams || 0);
  if (g < 1000) return `${g} g`;
  return `${Number((g / 1000).toFixed(2))} kg`;
}

function positive(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function boxWeightG(settings) {
  return positive(settings?.ship_box_weight_g, 20000);
}

export function cvsWeightLimitG(brand, settings) {
  return brand === "UNIMART"
    ? positive(settings?.cvs_weight_limit_unimart_g, 10000)
    : positive(settings?.cvs_weight_limit_fami_g, 5000);
}

// 這筆訂單可以用哪些超商取貨：低溫一律不行；常溫看總重有沒有超過該超商限重
export function availableCvsBrands(temperature, weightG, settings) {
  if (temperature === "cold") return [];
  return CVS_BRANDS.filter(
    (brand) => weightG <= cvsWeightLimitG(brand.value, settings)
  );
}

// 回傳 { boxes, baseFee, freeBoxes, fee, threshold, freeGap }
//   超商取貨：一件一份運費
//   宅配：箱數 = 無條件進位(總重 / 每箱上限)，至少 1 箱
//   每滿一次免運門檻抵 1 箱；freeGap = 再買多少可以再抵 1 箱（沒門檻或已全免為 null）
export function getShippingQuote({
  temperature,
  deliveryType,
  itemsTotal,
  weightG,
  settings,
}) {
  let boxes = 1;
  let baseFee;
  let rawThreshold;

  if (deliveryType === "cvs") {
    baseFee = Number(settings?.ship_fee_normal || 0);
    rawThreshold = settings?.free_ship_threshold_normal;
  } else {
    boxes = Math.max(Math.ceil(weightG / boxWeightG(settings)), 1);
    if (temperature === "cold") {
      baseFee = Number(settings?.ship_fee_chilled_home || 0);
      rawThreshold = settings?.free_ship_threshold_chilled;
    } else {
      baseFee = Number(settings?.ship_fee_normal_home || 0);
      rawThreshold = settings?.free_ship_threshold_normal;
    }
  }

  const threshold = Number(rawThreshold) > 0 ? Number(rawThreshold) : null;
  const freeBoxes = threshold ? Math.floor(itemsTotal / threshold) : 0;
  const chargedBoxes = Math.max(boxes - freeBoxes, 0);
  const fee = chargedBoxes * baseFee;
  const freeGap =
    threshold && chargedBoxes > 0 && baseFee > 0
      ? (freeBoxes + 1) * threshold - itemsTotal
      : null;

  return { boxes, baseFee, freeBoxes, chargedBoxes, fee, threshold, freeGap };
}

export function formatPrice(value) {
  return `NT$${Number(value || 0).toLocaleString("zh-TW")}`;
}
