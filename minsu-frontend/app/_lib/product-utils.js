// 溫層設定與運費試算。
// 運費規則必須與 DB 的 create_shop_order_v3 RPC 一致，那裡才是最終計價依據；
// 這裡只負責前台顯示試算。
//
// 溫層有三種：normal 常溫／chilled 冷藏／frozen 冷凍。
// 每個商品自己記「可以用哪些溫層寄送」（products.ship_temps，可複選）。
// 一張訂單只有一個溫層，裡面每個商品都要能用那個溫層寄送；
// 購物車裡沒有共同溫層的商品會自動分成多筆訂單。
export const TEMPERATURES = [
  { value: "normal", label: "常溫", color: "#3276A8" },
  { value: "chilled", label: "冷藏", color: "#3A8D83" },
  { value: "frozen", label: "冷凍", color: "#B44B4B" },
];

export const TEMPERATURE_ORDER = ["normal", "chilled", "frozen"];

export function getTemperature(value) {
  return TEMPERATURES.find((t) => t.value === value) || TEMPERATURES[0];
}

// ship_temps 還沒有值時（migration 套用前），由舊的 temperature 欄位推回來
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

const TEMP_DELIVERY = {
  normal: "超商取貨或宅配",
  chilled: "黑貓冷藏宅配",
  frozen: "全家冷凍取貨或黑貓冷凍宅配",
};

// 商品頁、商品卡用的溫層標示
export function getProductTemp(product) {
  const temps = shipTempsOf(product);
  const first = getTemperature(temps[0]);
  const label = temps.map((t) => getTemperature(t).label).join("／");
  return {
    key: temps.join("+"),
    temps,
    label,
    color: first.color,
    delivery:
      temps.length === 1 ? TEMP_DELIVERY[temps[0]] : `可用${label}配送`,
  };
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

// 訂單的配送方式文字
export function deliveryLabel(order) {
  const temperature = getOrderTemperature(order?.temperature).value;
  if (order?.delivery_type === "cvs") {
    return temperature === "frozen" ? "冷凍超商取貨" : "超商取貨";
  }
  return HOME_DELIVERY_LABEL[temperature];
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

// ── 分筆與運費試算 ────────────────────────────────────────
// lines: [{ product, variant, qty }]

// 購物車頁勾選要結帳的訂單（存訂單 key 的陣列），帶到結帳頁用
export const CHECKOUT_GROUPS_KEY = "fieldstay-checkout-groups";

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

// 候選的溫層組合，由少到多；取第一個「每件商品都至少能走其中一個」的組合，
// 這樣分出來的訂單數最少
const TEMP_COMBOS = [
  ["normal"],
  ["chilled"],
  ["frozen"],
  ["normal", "chilled"],
  ["normal", "frozen"],
  ["chilled", "frozen"],
  ["normal", "chilled", "frozen"],
];

// 把購物車依溫層分成最少筆訂單。
// 回傳 [{ key, lines, temps }]：key 是這筆的代表溫層（同時是唯一識別），
// temps 是這筆裡所有商品都能走的溫層（可能不只一個，由顧客在結帳時選）。
//   例：只能冷凍 + 冷藏冷凍都可以 → 一筆，只能走冷凍
//       只能冷凍 + 只能冷藏       → 兩筆
export function groupLinesByTemp(lines) {
  if (!lines.length) return [];
  const sets = lines.map((line) => shipTempsOf(line.product));
  const combo = TEMP_COMBOS.find((candidate) =>
    sets.every((set) => set.some((t) => candidate.includes(t)))
  );
  const buckets = new Map(combo.map((t) => [t, []]));
  lines.forEach((line, index) => {
    const key = combo.find((t) => sets[index].includes(t));
    buckets.get(key).push(line);
  });
  return combo
    .filter((key) => buckets.get(key).length > 0)
    .map((key) => {
      const groupLines = buckets.get(key);
      return {
        key,
        lines: groupLines,
        temps: TEMPERATURE_ORDER.filter((t) =>
          groupLines.every((line) => shipTempsOf(line.product).includes(t))
        ),
      };
    });
}

// 一筆訂單的標題用字：「冷凍」或「冷藏／冷凍」
export function groupLabel(group) {
  return group.temps.map((t) => getTemperature(t).label).join("／");
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

// 超商取貨限重：冷凍只有全家，另有自己的限重
export function cvsWeightLimitG(brand, settings, temperature = "normal") {
  if (temperature === "frozen") {
    return positive(settings?.cvs_weight_limit_fami_frozen_g, 10000);
  }
  return brand === "UNIMART"
    ? positive(settings?.cvs_weight_limit_unimart_g, 10000)
    : positive(settings?.cvs_weight_limit_fami_g, 5000);
}

// 這個溫層有哪些超商可以取貨（不管重量）：常溫兩家、冷凍只有全家、冷藏沒有
export function cvsBrandsOf(temperature) {
  if (temperature === "normal") return CVS_BRANDS;
  if (temperature === "frozen") return CVS_BRANDS.filter((b) => b.value === "FAMI");
  return [];
}

// 扣掉超重的之後，實際可以選的超商
export function availableCvsBrands(temperature, weightG, settings) {
  return cvsBrandsOf(temperature).filter(
    (brand) => weightG <= cvsWeightLimitG(brand.value, settings, temperature)
  );
}

const METHOD_LABEL = {
  "normal:cvs": "超商取貨",
  "normal:home": "宅配",
  "chilled:home": "冷藏宅配（黑貓）",
  "frozen:cvs": "全家冷凍取貨",
  "frozen:home": "冷凍宅配（黑貓）",
};

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

  if (deliveryType === "cvs") {
    baseFee = Number(
      (temperature === "frozen"
        ? settings?.ship_fee_frozen_fami
        : settings?.ship_fee_normal) || 0
    );
  } else {
    boxes = Math.max(Math.ceil(weightG / boxWeightG(settings)), 1);
    baseFee = Number(
      (temperature === "frozen"
        ? settings?.ship_fee_frozen_home ?? 180
        : temperature === "chilled"
        ? settings?.ship_fee_chilled_home
        : settings?.ship_fee_normal_home) || 0
    );
  }

  const rawThreshold =
    temperature === "frozen"
      ? settings?.free_ship_threshold_frozen
      : temperature === "chilled"
      ? settings?.free_ship_threshold_chilled
      : settings?.free_ship_threshold_normal;
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

// 把一筆訂單算完整：小計、總重、可選的配送方式與各自的運費。
// methods: [{ id, temperature, deliveryType, label, brands, quote }]
//   id 形如 "frozen:cvs"；brands 是這個方式可選的超商（宅配為空陣列）
// overweight: 因為超重而不能選的超商取貨（給畫面提示用）
export function summarizeGroup(group, settings) {
  const itemsTotal = group.lines.reduce(
    (sum, line) => sum + unitPrice(line.variant) * line.qty,
    0
  );
  const weightG = totalWeightG(group.lines);
  const methods = [];
  const overweight = [];

  group.temps.forEach((temperature) => {
    const candidates = cvsBrandsOf(temperature);
    const brands = availableCvsBrands(temperature, weightG, settings);
    if (brands.length > 0) {
      methods.push({ temperature, deliveryType: "cvs", brands });
    } else if (candidates.length > 0) {
      overweight.push(METHOD_LABEL[`${temperature}:cvs`]);
    }
    methods.push({ temperature, deliveryType: "home", brands: [] });
  });

  return {
    ...group,
    label: groupLabel(group),
    color: getTemperature(group.key).color,
    itemsTotal,
    weightG,
    overweight,
    hasProblem: group.lines.some(
      (line) =>
        isSoldOut(line.variant) ||
        (line.variant.stock !== null &&
          line.variant.stock !== undefined &&
          line.qty > line.variant.stock)
    ),
    methods: methods.map((method) => {
      const id = `${method.temperature}:${method.deliveryType}`;
      return {
        ...method,
        id,
        label: METHOD_LABEL[id],
        quote: getShippingQuote({
          temperature: method.temperature,
          deliveryType: method.deliveryType,
          itemsTotal,
          weightG,
          settings,
        }),
      };
    }),
  };
}

export function formatPrice(value) {
  return `NT$${Number(value || 0).toLocaleString("zh-TW")}`;
}
