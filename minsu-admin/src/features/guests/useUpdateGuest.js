import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateGuest as updateGuestApi } from "../../services/apiGuests";

export function useUpdateGuest() {
  const queryClient = useQueryClient();

  const { mutate: updateGuest, isLoading: isUpdating } = useMutation({
    mutationFn: updateGuestApi,
    onSuccess: () => {
      toast.success("Guest updated");
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { updateGuest, isUpdating };
}
