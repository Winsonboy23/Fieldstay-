import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getShopOrders,
  updateShopOrder,
  deleteShopOrder,
} from "../../services/apiShopOrders";

export function useShopOrders() {
  const { isLoading, data: orders, error } = useQuery({
    queryKey: ["shop-orders"],
    queryFn: getShopOrders,
  });
  return { isLoading, orders: orders || [], error };
}

export function useUpdateShopOrder() {
  const qc = useQueryClient();
  const { mutate, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, patch }) => updateShopOrder(id, patch),
    onSuccess: () => {
      toast.success("已更新");
      qc.invalidateQueries({ queryKey: ["shop-orders"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => toast.error(err.message),
  });
  return { updateOrder: mutate, isUpdating };
}

export function useDeleteShopOrder() {
  const qc = useQueryClient();
  const { mutate, isLoading: isDeleting } = useMutation({
    mutationFn: deleteShopOrder,
    onSuccess: () => {
      toast.success("已刪除");
      qc.invalidateQueries({ queryKey: ["shop-orders"] });
    },
    onError: (err) => toast.error(err.message),
  });
  return { deleteOrder: mutate, isDeleting };
}

// 訂單管理頁右上角統計列用
export function useShopOrderStats() {
  const { orders, isLoading } = useShopOrders();

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) =>
      ["paid", "shipped", "arrived", "picked_up"].includes(o.status)
    ).length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    revenue: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total_price || 0), 0),
  };

  return { stats, isLoading };
}
