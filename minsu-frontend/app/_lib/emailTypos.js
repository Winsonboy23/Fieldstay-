// 常見打錯的 email 網域 → 正確網域
const TYPO_DOMAINS = {
  // gmail
  "gmal.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmil.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.om": "gmail.com",
  "gmail.comm": "gmail.com",
  "gmail.co.tw": "gmail.com",
  "gmail.com.tw": "gmail.com",
  // yahoo
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yahoo.cm": "yahoo.com",
  "yaho.com.tw": "yahoo.com.tw",
  "yahoo.com.t": "yahoo.com.tw",
  "yahoo.com.w": "yahoo.com.tw",
  "yahoo.comtw": "yahoo.com.tw",
  "yahoo.co.tw": "yahoo.com.tw",
  // hotmail / outlook / live
  "hotmal.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloook.com": "outlook.com",
  "outlook.co": "outlook.com",
  "outlook.con": "outlook.com",
  "live.con": "live.com",
  // icloud
  "iclod.com": "icloud.com",
  "icloud.co": "icloud.com",
  "icloud.con": "icloud.com",
};

/**
 * 若 email 的網域是常見錯字，回傳修正後的 email；否則回傳 null。
 */
export function suggestEmailFix(email) {
  const value = String(email || "").trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at < 1) return null;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const fixed = TYPO_DOMAINS[domain];
  return fixed ? `${local}@${fixed}` : null;
}
