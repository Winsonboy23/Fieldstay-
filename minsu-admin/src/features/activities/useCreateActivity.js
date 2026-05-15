import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createEditActivity } from "../../services/apiActivities";

export function useCreateActivity() {
  const queryClient = useQueryClient();

  const { mutate: createActivity, isLoading: isCreating } = useMutation({
    mutationFn: createEditActivity,
    onSuccess: () => {
      toast.success("活動已建立");
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isCreating, createActivity };
}
