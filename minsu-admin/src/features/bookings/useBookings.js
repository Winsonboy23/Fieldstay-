import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBookings } from "../../services/apiBookings";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";

function buildFilterFromTab(tab) {
  switch (tab) {
    case "pending":
      return [
        { field: "status", value: "unconfirmed" },
        { field: "isPaid", value: false },
      ];
    case "confirmed":
      return [
        { field: "status", value: "unconfirmed" },
        { field: "isPaid", value: true },
      ];
    case "in-progress":
      return [{ field: "status", value: "checked-in" }];
    case "done":
      return [{ field: "status", value: "checked-out" }];
    case "cancelled":
      return [{ field: "status", value: "cancelled" }];
    default:
      return null;
  }
}

export function useBookings() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const tab = searchParams.get("tab") || "all";
  const search = (searchParams.get("q") || "").trim();
  const filter = buildFilterFromTab(tab);

  const sortByRaw = searchParams.get("sortBy") || "startDate-desc";
  const [field, direction] = sortByRaw.split("-");
  const sortBy = { field, direction };

  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const usePagination = !search;

  const {
    isLoading,
    data: { data: bookings, count } = {},
    error,
  } = useQuery({
    queryKey: ["bookings", tab, sortBy, usePagination ? page : "all", search ? "with-search" : "no-search"],
    queryFn: () =>
      getBookings({ filter, sortBy, page: usePagination ? page : null }),
  });

  if (usePagination) {
    const pageCount = Math.ceil((count || 0) / PAGE_SIZE);
    if (page < pageCount)
      queryClient.prefetchQuery({
        queryKey: ["bookings", tab, sortBy, page + 1, "no-search"],
        queryFn: () => getBookings({ filter, sortBy, page: page + 1 }),
      });
    if (page > 1)
      queryClient.prefetchQuery({
        queryKey: ["bookings", tab, sortBy, page - 1, "no-search"],
        queryFn: () => getBookings({ filter, sortBy, page: page - 1 }),
      });
  }

  return {
    isLoading,
    error,
    bookings: bookings || [],
    count: count || 0,
    isSearching: !usePagination,
  };
}
