import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { toggleProductActive } from "../../services/apiProducts";

export function useToggleProductActive() {
  const queryClient = useQueryClient();

  const { mutate: toggleActive, isLoading: isToggling } = useMutation({
    mutationFn: ({ id, isActive }) => toggleProductActive(id, isActive),
    onSuccess: (product) => {
      toast.success(product.is_active ? "商品已上架" : "商品已下架");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { toggleActive, isToggling };
}
