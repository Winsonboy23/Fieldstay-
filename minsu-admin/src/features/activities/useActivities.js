import { useQuery } from "@tanstack/react-query";
import { getActivities } from "../../services/apiActivities";

export function useActivities() {
  const {
    isLoading,
    data: activities,
    error,
  } = useQuery({
    queryKey: ["activities"],
    queryFn: getActivities,
  });

  return { isLoading, error, activities };
}
