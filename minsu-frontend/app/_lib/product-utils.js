// 三溫層設定與運費試算。
// 運費規則必須與 DB 的 create_shop_order RPC 一致，那裡才是最終計價依據；
// 這裡只負責前台顯示試算。
export const TEMPERATURES = [
  {
    value: "normal",
    label: "常溫",
    color: "#3276A8",
    delivery: "超商取貨（7-11 / 全家）",
    short: "超商取貨",
  },
  {
    value: "chilled",
    label: "冷藏",
    color: "#3A8D83",
    delivery: "黑貓低溫宅配",
    short: "低溫宅配",
  },
  {
    value: "frozen",
    label: "冷凍",
    color: "#B44B4B",
    delivery: "超商取貨",
    short: "超商取貨",
  },
];

export const TEMPERATURE_ORDER = ["normal", "chilled", "frozen"];

export function getTemperature(value) {
  return TEMPERATURES.find((t) => t.value === value) || TEMPERATURES[0];
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

// v1 冷凍僅開放全家取貨，所以冷凍固定用全家運費
function baseFee(temperature, settings) {
  if (temperature === "normal") return Number(settings?.ship_fee_normal || 0);
  if (temperature === "frozen") return Number(settings?.ship_fee_frozen_fami || 0);
  return Number(settings?.ship_fee_chilled_home || 0);
}

function threshold(temperature, settings) {
  const value =
    temperature === "normal"
      ? settings?.free_ship_threshold_normal
      : temperature === "frozen"
      ? settings?.free_ship_threshold_frozen
      : settings?.free_ship_threshold_chilled;
  return value === null || value === undefined ? null : Number(value);
}

export function getShippingFee(temperature, itemsTotal, settings) {
  const limit = threshold(temperature, settings);
  if (limit !== null && itemsTotal >= limit) return 0;
  return baseFee(temperature, settings);
}

// 還差多少才免運；沒有設門檻或已達標則回 null
export function getFreeShippingGap(temperature, itemsTotal, settings) {
  const limit = threshold(temperature, settings);
  if (limit === null || itemsTotal >= limit) return null;
  return limit - itemsTotal;
}

export function formatPrice(value) {
  return `NT$${Number(value || 0).toLocaleString("zh-TW")}`;
}
