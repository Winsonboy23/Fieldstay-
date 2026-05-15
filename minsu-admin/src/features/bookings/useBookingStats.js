import { useQuery } from "@tanstack/react-query";
import supabase from "../../services/supabase";

async function getBookingStats() {
  const { data, error } = await supabase
    .from("bookings")
    .select("status, isPaid, payment_method, totalPrice");

  if (error) throw new Error("Booking stats could not be loaded");

  let total = 0;
  let pending = 0;
  let confirmed = 0;
  let inProgress = 0;
  let cancelled = 0;
  let revenue = 0;

  for (const b of data) {
    if (b.status === "cancelled") {
      cancelled += 1;
      continue;
    }
    total += 1;
    if (b.status === "unconfirmed" && !b.isPaid) pending += 1;
    if (b.status === "unconfirmed" && b.isPaid) confirmed += 1;
    if (b.status === "checked-in") inProgress += 1;
    if (
      (b.status === "unconfirmed" && b.isPaid) ||
      b.status === "checked-in" ||
      b.status === "checked-out"
    ) {
      revenue += Number(b.totalPrice || 0);
    }
  }

  return { total, pending, confirmed, inProgress, cancelled, revenue };
}

export function useBookingStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["bookingStats"],
    queryFn: getBookingStats,
  });
  return {
    isLoading,
    stats: data || {
      total: 0,
      pending: 0,
      confirmed: 0,
      inProgress: 0,
      cancelled: 0,
      revenue: 0,
    },
  };
}
