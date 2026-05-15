import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteGuest as deleteGuestApi } from "../../services/apiGuests";

export function useDeleteGuest() {
  const queryClient = useQueryClient();

  const { mutate: deleteGuest, isLoading: isDeleting } = useMutation({
    mutationFn: deleteGuestApi,
    onSuccess: () => {
      toast.success("顧客已刪除");
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { deleteGuest, isDeleting };
}
