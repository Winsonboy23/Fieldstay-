import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createEditActivity } from "../../services/apiActivities";

export function useEditActivity() {
  const queryClient = useQueryClient();

  const { mutate: editActivity, isLoading: isEditing } = useMutation({
    mutationFn: ({ newActivityData, id }) =>
      createEditActivity(newActivityData, id),
    onSuccess: () => {
      toast.success("活動已更新");
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isEditing, editActivity };
}
