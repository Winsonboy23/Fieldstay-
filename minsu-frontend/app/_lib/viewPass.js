import "server-only";
import crypto from "crypto";

// 後台檢視訂單用的「短效員工證」。
// 由 /api/admin/view-pass 在驗證管理者身分後簽發，前台頁面再驗證。
// 簽章金鑰用 NEXTAUTH_SECRET（僅存在前台伺服器端，後台瀏覽器拿不到）。
const SECRET = process.env.NEXTAUTH_SECRET;
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 分鐘

function sign(payload) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function signViewPass(type, id, ttlMs = DEFAULT_TTL_MS) {
  if (!SECRET) throw new Error("NEXTAUTH_SECRET not set");
  const exp = Date.now() + ttlMs;
  const payload = `${type}:${id}:${exp}`;
  const body = Buffer.from(payload).toString("base64url");
  return `${body}.${sign(payload)}`;
}

// 驗證員工證是否對應這個 type + id 且尚未過期。任何不符都回 false（安全預設）。
export function verifyViewPass(pass, type, id) {
  if (!pass || !SECRET) return false;
  const [body, sig] = String(pass).split(".");
  if (!body || !sig) return false;

  let payload;
  try {
    payload = Buffer.from(body, "base64url").toString();
  } catch {
    return false;
  }

  const expected = sign(payload);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;

  const [t, i, expStr] = payload.split(":");
  if (t !== String(type) || i !== String(id)) return false;
  if (!expStr || Date.now() > Number(expStr)) return false;
  return true;
}
