import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { getGuests } from "../../services/apiGuests";
import { PAGE_SIZE } from "../../utils/constants";

export function useGuests() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const search = (searchParams.get("q") || "").trim();
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const usePagination = !search;

  const {
    isLoading,
    data: { data: guests, count } = {},
    error,
  } = useQuery({
    queryKey: ["guests", usePagination ? page : "all", search],
    queryFn: () => getGuests({ page: usePagination ? page : null, search }),
  });

  if (usePagination) {
    const pageCount = Math.ceil((count || 0) / PAGE_SIZE);
    if (page < pageCount)
      queryClient.prefetchQuery({
        queryKey: ["guests", page + 1, ""],
        queryFn: () => getGuests({ page: page + 1 }),
      });
    if (page > 1)
      queryClient.prefetchQuery({
        queryKey: ["guests", page - 1, ""],
        queryFn: () => getGuests({ page: page - 1 }),
      });
  }

  return {
    isLoading,
    error,
    guests: guests || [],
    count: count || 0,
    isSearching: !usePagination,
  };
}
