import BookingRow from "./BookingRow";
import { useBookings } from "./useBookings";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Empty from "../../ui/Empty";
import Spinner from "../../ui/Spinner";
import Pagination from "../../ui/Pagination";

function BookingTable({ search = "" }) {
  const { bookings, isLoading, count, isSearching } = useBookings();

  if (isLoading) return <Spinner />;
  if (!bookings.length) return <Empty resourceName="bookings" />;

  const orderCode = (id) =>
    `BK${String(id || "").replace(/\D/g, "").padStart(12, "0")}`;

  const keyword = search.trim().toLowerCase();
  const filtered = !keyword
    ? bookings
    : bookings.filter((b) => {
        const code = orderCode(b.id).toLowerCase();
        const name = (b.guests?.fullName || "").toLowerCase();
        const room = (b.rooms?.name || "").toLowerCase();
        return (
          code.includes(keyword) ||
          name.includes(keyword) ||
          room.includes(keyword)
        );
      });

  if (!filtered.length) return <Empty resourceName="bookings" />;

  return (
    <Menus>
      <Table
        columns="1.4fr 2.2fr 1.5fr 1.5fr 0.7fr 1.2fr 1.4fr 1fr 3.2rem"
        minWidth="92rem"
      >
        <Table.Header>
          <div>訂單編號</div>
          <div>房間</div>
          <div>住客</div>
          <div>入住日期</div>
          <div>晚數</div>
          <div>總費用</div>
          <div>付款方式</div>
          <div style={{ textAlign: "center" }}>狀態</div>
          <div></div>
        </Table.Header>

        <Table.Body
          data={filtered}
          render={(booking) => (
            <BookingRow key={booking.id} booking={booking} />
          )}
        />

        {isSearching ? null : (
          <Table.Footer>
            <Pagination count={count} />
          </Table.Footer>
        )}
      </Table>
    </Menus>
  );
}

export default BookingTable;
