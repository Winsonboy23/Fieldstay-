import { useAllSignups } from "./useAllSignups";

export function useSignupStats() {
  const { signups, isLoading } = useAllSignups();

  const stats = signups.reduce(
    (acc, s) => {
      acc.total += 1;
      if (s.status === "cancelled") acc.cancelled += 1;
      else if (s.payment_status === "paid") {
        acc.confirmed += 1;
        acc.revenue += Number(s.total_price || 0);
      } else acc.pending += 1;
      return acc;
    },
    { total: 0, pending: 0, confirmed: 0, cancelled: 0, revenue: 0 }
  );

  return { stats, isLoading };
}
