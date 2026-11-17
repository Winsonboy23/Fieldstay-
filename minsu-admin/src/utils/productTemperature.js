// 溫層設定。
// 商品有三種：normal 只能常溫／flex 常溫低溫都可以／cold 必須低溫（冷藏、冷凍）。
// 訂單只有兩種：購物車只要有一件必須低溫，整筆就走低溫宅配。
// 舊資料的 chilled、frozen 一律視為 cold。
// 值域需與前台 minsu-frontend/app/_lib/product-utils.js 一致。
export const TEMPERATURES = [
  {
    value: "normal",
    label: "常溫",
    optionLabel: "只能常溫",
    color: "#3276A8",
    delivery: "超商取貨或宅配",
  },
  {
    value: "flex",
    label: "常溫／低溫",
    optionLabel: "常溫、低溫都可以",
    color: "#7A6FA8",
    delivery: "超商取貨、宅配或低溫宅配",
  },
  {
    value: "cold",
    label: "低溫",
    optionLabel: "必須低溫（冷藏／冷凍）",
    color: "#3A8D83",
    delivery: "黑貓低溫宅配",
  },
];

export function normalizeProductTemp(value) {
  if (value === "cold" || value === "chilled" || value === "frozen") return "cold";
  if (value === "flex") return "flex";
  return "normal";
}

export function getTemperature(value) {
  const key = normalizeProductTemp(value);
  return TEMPERATURES.find((t) => t.value === key) || TEMPERATURES[0];
}

// 訂單上的溫層標籤：改版前的舊訂單保留當時的「冷藏／冷凍」字樣
const ORDER_TEMPERATURES = {
  normal: { value: "normal", label: "常溫", color: "#3276A8" },
  cold: { value: "cold", label: "低溫", color: "#3A8D83" },
  chilled: { value: "cold", label: "冷藏", color: "#3A8D83" },
  frozen: { value: "cold", label: "冷凍", color: "#B44B4B" },
};

export function getOrderTemperature(value) {
  return ORDER_TEMPERATURES[value] || ORDER_TEMPERATURES.normal;
}

// 宅配訂單的配送方式文字；多箱時帶上箱數方便備貨
export function homeDeliveryLabel(order) {
  const base =
    getOrderTemperature(order?.temperature).value === "cold" ? "低溫宅配" : "宅配";
  return Number(order?.box_count) > 1 ? `${base}・${order.box_count} 箱` : base;
}
