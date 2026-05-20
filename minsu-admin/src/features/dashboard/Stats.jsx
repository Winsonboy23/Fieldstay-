import { formatCurrency } from "../../utils/helpers";
import Stat from "./Stat";

import {
  HiOutlineCalendarDays,
  HiOutlineCurrencyDollar,
  HiOutlineHome,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

const PALETTE = {
  mint: { bg: "#dff3e7", fg: "#2f7a5a", spark: "#5a9f80" },
  sand: { bg: "#f8ead1", fg: "#b07a2a", spark: "#c89572" },
  sky: { bg: "#e3eef8", fg: "#3d6da6", spark: "#6aaedb" },
};

function Stats({ bookings, confirmedStays, numDays, roomCount }) {
  const numBookings = bookings.length;
  const sales = bookings.reduce((acc, cur) => acc + cur.totalPrice, 0);
  const totalNights = confirmedStays.reduce(
    (acc, cur) => acc + cur.numNights,
    0
  );
  const checkins = confirmedStays.length;
  const occupation =
    totalNights / Math.max(numDays * roomCount, 1);

  return (
    <>
      <Stat
        title="本週訂房"
        icon={<HiOutlineCalendarDays />}
        iconBg={PALETTE.mint.bg}
        iconFg={PALETTE.mint.fg}
        sparkColor={PALETTE.mint.spark}
        value={totalNights}
        unit="夜"
        trend={18.2}
        sparkline={[3, 5, 4, 6, 7, 6, 9]}
      />
      <Stat
        title="本週營收"
        icon={<HiOutlineCurrencyDollar />}
        iconBg={PALETTE.mint.bg}
        iconFg={PALETTE.mint.fg}
        sparkColor={PALETTE.mint.spark}
        value={formatCurrency(sales)}
        trend={12.4}
        sparkline={[10, 12, 11, 13, 12, 15, 18]}
      />
      <Stat
        title="入住率"
        icon={<HiOutlineHome />}
        iconBg={PALETTE.sand.bg}
        iconFg={PALETTE.sand.fg}
        sparkColor={PALETTE.sand.spark}
        value={Math.round(occupation * 100)}
        unit="%"
        trend={-2.1}
        sparkline={[12, 11, 13, 10, 11, 9, 8]}
      />
      <Stat
        title="活動報名"
        icon={<HiOutlineShieldCheck />}
        iconBg={PALETTE.sky.bg}
        iconFg={PALETTE.sky.fg}
        sparkColor={PALETTE.sky.spark}
        value={checkins || numBookings}
        unit="人"
        trend={24}
        sparkline={[4, 5, 4, 6, 7, 9, 11]}
      />
    </>
  );
}

export default Stats;
