import { useRef } from "react";
import styled from "styled-components";
import { useRecentBookings } from "./useRecentBookings";
import Spinner from "../../ui/Spinner";
import { useRecentStays } from "./useRecentStays";
import Stats from "./Stats";
import { useRooms } from "../rooms/useRooms";
import SalesChart from "./SalesChart";

const StyledDashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 2.4rem;
  opacity: ${(p) => (p.$loading ? 0.5 : 1)};
  transition: opacity 0.3s;
`;

function DashboardLayout() {
  const { bookings, isLoading: isLoading1 } = useRecentBookings();
  const { confirmedStays, isLoading: isLoading2, numDays } = useRecentStays();
  const { rooms, isLoading: isLoading3 } = useRooms();
  const isLoading = isLoading1 || isLoading2 || isLoading3;

  // 換日期範圍時先留著上一份資料（變淡），新資料到了再換，不要整塊閃成轉圈圈
  const shown = useRef(null);
  if (!isLoading)
    shown.current = { bookings, confirmedStays, numDays, roomCount: rooms.length };

  if (!shown.current) return <Spinner />;
  const view = shown.current;

  return (
    <StyledDashboardLayout $loading={isLoading}>
      <Stats
        bookings={view.bookings}
        confirmedStays={view.confirmedStays}
        numDays={view.numDays}
        roomCount={view.roomCount}
      />
      <SalesChart bookings={view.bookings} numDays={view.numDays} />
    </StyledDashboardLayout>
  );
}

export default DashboardLayout;
