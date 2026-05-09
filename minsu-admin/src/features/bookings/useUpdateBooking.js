import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateBooking as updateBookingApi } from "../../services/apiBookings";

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  const { mutate: updateBooking, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, updates }) => updateBookingApi(id, updates),
    onSuccess: () => {
      toast.success("Booking updated");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { updateBooking, isUpdating };
}
