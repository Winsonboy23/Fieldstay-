import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { toggleRoomActive } from "../../services/apiRooms";

export function useToggleRoomActive() {
  const queryClient = useQueryClient();

  const { mutate: toggleActive, isLoading: isToggling } = useMutation({
    mutationFn: ({ id, isActive }) => toggleRoomActive(id, isActive),
    onSuccess: (room) => {
      toast.success(room.is_active ? "房型已開放" : "房型已暫停");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { toggleActive, isToggling };
}
