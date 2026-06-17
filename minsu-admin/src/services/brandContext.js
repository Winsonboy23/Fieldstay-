import supabase from "./supabase";

let cachedBrandId = null;

export async function getCurrentBrandId() {
  if (cachedBrandId !== null) return cachedBrandId;

  const { data: { session } } = await supabase.auth.getSession();
  const brandId = session?.user?.user_metadata?.brand_id;

  if (!brandId) {
    throw new Error(
      "目前登入帳號未設定 brand_id，請聯絡管理員",
    );
  }

  cachedBrandId = Number(brandId);
  return cachedBrandId;
}

export function clearBrandCache() {
  cachedBrandId = null;
}
