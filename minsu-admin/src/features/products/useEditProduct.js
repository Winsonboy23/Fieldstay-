import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createEditProduct } from "../../services/apiProducts";

export function useEditProduct() {
  const queryClient = useQueryClient();

  const { mutate: editProduct, isLoading: isEditing } = useMutation({
    mutationFn: ({ newProductData, id }) => createEditProduct(newProductData, id),
    onSuccess: () => {
      toast.success("商品已更新");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isEditing, editProduct };
}
