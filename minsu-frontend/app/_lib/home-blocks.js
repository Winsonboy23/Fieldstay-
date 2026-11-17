// 首頁可排序／可隱藏的區塊（主視覺 banner 固定置頂，不在此列）。
// 順序與顯示狀態存在 settings.home_blocks，由後台設定頁調整：
//   [{ "key": "about", "visible": true }, ...]
// 欄位是空的、缺項或有不認得的 key 時，一律退回預設順序、全部顯示。

export const HOME_BLOCK_KEYS = ["about", "rooms", "experience", "shop", "transport"];

export function resolveHomeBlocks(settings) {
  const saved = Array.isArray(settings?.home_blocks) ? settings.home_blocks : [];
  const seen = new Set();
  const blocks = [];
  for (const item of saved) {
    const key = item?.key;
    if (!HOME_BLOCK_KEYS.includes(key) || seen.has(key)) continue;
    seen.add(key);
    blocks.push({ key, visible: item.visible !== false });
  }
  for (const key of HOME_BLOCK_KEYS) {
    if (!seen.has(key)) blocks.push({ key, visible: true });
  }
  return blocks;
}

export function isHomeBlockVisible(settings, key) {
  return resolveHomeBlocks(settings).some((b) => b.key === key && b.visible);
}
