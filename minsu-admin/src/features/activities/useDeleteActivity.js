import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteActivity as deleteActivityApi } from "../../services/apiActivities";

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  const { isLoading: isDeleting, mutate: deleteActivity } = useMutation({
    mutationFn: deleteActivityApi,
    onSuccess: () => {
      toast.success("活動已刪除");
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isDeleting, deleteActivity };
}
