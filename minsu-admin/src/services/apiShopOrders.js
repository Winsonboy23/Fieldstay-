import supabase from "./supabase";

export async function getShopOrders() {
  const { data, error } = await supabase
    .from("shop_orders")
    .select("*, shop_order_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Shop orders could not be loaded");
  }
  return data;
}

export async function updateShopOrder(id, patch) {
  // 取消時走 RPC 才會歸還商品庫存
  if (patch?.status === "cancelled") {
    const { data, error } = await supabase.rpc("cancel_shop_order", {
      p_order_id: id,
    });
    if (error) {
      console.error(error);
      if (String(error.message || "").includes("ALREADY_SHIPPED")) {
        throw new Error("訂單已出貨，無法取消");
      }
      throw new Error("Shop order could not be cancelled");
    }
    return data;
  }

  const { data, error } = await supabase
    .from("shop_orders")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Shop order could not be updated");
  }
  return data;
}

export async function deleteShopOrder(id) {
  const { error } = await supabase.from("shop_orders").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Shop order could not be deleted");
  }
}
