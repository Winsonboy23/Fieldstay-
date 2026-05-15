import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getSignupsByActivity,
  updateSignup,
  deleteSignup,
} from "../../services/apiActivitySignups";

export function useActivitySignups(activityId) {
  const { isLoading, data: signups, error } = useQuery({
    queryKey: ["activity-signups", activityId],
    queryFn: () => getSignupsByActivity(activityId),
    enabled: Boolean(activityId),
  });
  return { isLoading, signups, error };
}

export function useUpdateSignup(activityId) {
  const qc = useQueryClient();
  const { mutate, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, patch }) => updateSignup(id, patch),
    onSuccess: () => {
      toast.success("已更新");
      qc.invalidateQueries({ queryKey: ["activity-signups", activityId] });
    },
    onError: (err) => toast.error(err.message),
  });
  return { updateSignup: mutate, isUpdating };
}

export function useDeleteSignup(activityId) {
  const qc = useQueryClient();
  const { mutate, isLoading: isDeleting } = useMutation({
    mutationFn: deleteSignup,
    onSuccess: () => {
      toast.success("已刪除");
      qc.invalidateQueries({ queryKey: ["activity-signups", activityId] });
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (err) => toast.error(err.message),
  });
  return { deleteSignup: mutate, isDeleting };
}
