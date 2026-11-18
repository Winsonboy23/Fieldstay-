// 溫層設定。
// 溫層有三種：normal 常溫／chilled 冷藏／frozen 冷凍。
// 每個商品自己記「可以用哪些溫層寄送」（products.ship_temps，可複選）；
// 一張訂單只有一個溫層，購物車裡沒有共同溫層的商品會自動分成多筆訂單。
// 值域需與前台 minsu-frontend/app/_lib/product-utils.js 一致。
export const TEMPERATURES = [
  { value: "normal", label: "常溫", color: "#3276A8", delivery: "超商取貨或宅配" },
  { value: "chilled", label: "冷藏", color: "#3A8D83", delivery: "黑貓冷藏宅配" },
  {
    value: "frozen",
    label: "冷凍",
    color: "#B44B4B",
    delivery: "全家冷凍取貨或黑貓冷凍宅配",
  },
];

export const TEMPERATURE_ORDER = TEMPERATURES.map((t) => t.value);

export function getTemperature(value) {
  return TEMPERATURES.find((t) => t.value === value) || TEMPERATURES[0];
}

// ship_temps 還沒有值時，由舊的 temperature 欄位推回來
const LEGACY_SHIP_TEMPS = {
  normal: ["normal"],
  chilled: ["chilled"],
  frozen: ["frozen"],
  cold: ["chilled", "frozen"],
  flex: ["normal", "chilled", "frozen"],
};

// 這個商品可以用哪些溫層寄送，依 常溫→冷藏→冷凍 排序，至少會有一個
export function shipTempsOf(product) {
  const raw =
    Array.isArray(product?.ship_temps) && product.ship_temps.length > 0
      ? product.ship_temps
      : LEGACY_SHIP_TEMPS[product?.temperature] || ["normal"];
  const list = TEMPERATURE_ORDER.filter((t) => raw.includes(t));
  return list.length > 0 ? list : ["normal"];
}

// 商品卡用的溫層標示
export function getProductTemp(product) {
  const temps = shipTempsOf(product);
  const label = temps.map((t) => getTemperature(t).label).join("／");
  return {
    temps,
    label,
    color: getTemperature(temps[0]).color,
    delivery:
      temps.length === 1 ? getTemperature(temps[0]).delivery : `可用${label}配送`,
  };
}

// 舊欄位 products.temperature 仍保留（值域 normal / cold / flex），存檔時一併寫回
export function legacyTemperature(temps) {
  if (!temps.includes("normal")) return "cold";
  return temps.length === 1 ? "normal" : "flex";
}

// 訂單上的溫層標籤：cold 是曾經合併冷藏冷凍的那一版留下的訂單
const ORDER_TEMPERATURES = {
  normal: { value: "normal", label: "常溫", color: "#3276A8" },
  chilled: { value: "chilled", label: "冷藏", color: "#3A8D83" },
  frozen: { value: "frozen", label: "冷凍", color: "#B44B4B" },
  cold: { value: "cold", label: "低溫", color: "#3A8D83" },
};

export function getOrderTemperature(value) {
  return ORDER_TEMPERATURES[value] || ORDER_TEMPERATURES.normal;
}

const HOME_DELIVERY_LABEL = {
  normal: "宅配",
  chilled: "冷藏宅配",
  frozen: "冷凍宅配",
  cold: "低溫宅配",
};

// 宅配訂單的配送方式文字；多箱時帶上箱數方便備貨
export function homeDeliveryLabel(order) {
  const base = HOME_DELIVERY_LABEL[getOrderTemperature(order?.temperature).value];
  return Number(order?.box_count) > 1 ? `${base}・${order.box_count} 箱` : base;
}
