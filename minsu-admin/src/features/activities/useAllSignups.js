import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getAllSignups,
  updateSignup,
  deleteSignup,
} from "../../services/apiActivitySignups";

export function useAllSignups() {
  const { isLoading, data: signups, error } = useQuery({
    queryKey: ["activity-signups", "all"],
    queryFn: getAllSignups,
  });
  return { isLoading, signups: signups || [], error };
}

export function useUpdateAnySignup() {
  const qc = useQueryClient();
  const { mutate, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, patch }) => updateSignup(id, patch),
    onSuccess: () => {
      toast.success("已更新");
      qc.invalidateQueries({ queryKey: ["activity-signups"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (err) => toast.error(err.message),
  });
  return { updateSignup: mutate, isUpdating };
}

export function useDeleteAnySignup() {
  const qc = useQueryClient();
  const { mutate, isLoading: isDeleting } = useMutation({
    mutationFn: deleteSignup,
    onSuccess: () => {
      toast.success("已刪除");
      qc.invalidateQueries({ queryKey: ["activity-signups"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (err) => toast.error(err.message),
  });
  return { deleteSignup: mutate, isDeleting };
}
