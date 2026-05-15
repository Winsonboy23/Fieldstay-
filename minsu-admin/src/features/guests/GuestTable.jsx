import { useGuests } from "./useGuests";
import GuestRow from "./GuestRow";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Empty from "../../ui/Empty";
import Spinner from "../../ui/Spinner";
import Pagination from "../../ui/Pagination";

function GuestTable({ search = "" }) {
  const { guests, isLoading, count, isSearching } = useGuests();

  if (isLoading) return <Spinner />;
  if (!guests.length) return <Empty resourceName="guests" />;

  const keyword = search.trim().toLowerCase();
  const filtered = !keyword
    ? guests
    : guests.filter((g) => {
        const code = `cus${String(g.id || "").padStart(3, "0")}`.toLowerCase();
        return (
          code.includes(keyword) ||
          String(g.fullName || "").toLowerCase().includes(keyword) ||
          String(g.email || "").toLowerCase().includes(keyword) ||
          String(g.phone || "").toLowerCase().includes(keyword)
        );
      });

  if (!filtered.length) return <Empty resourceName="guests" />;

  return (
    <Menus>
      <Table
        columns="0.9fr 0.8fr 1.6fr 1.2fr 1.1fr 0.7fr 0.7fr 3.2rem"
        minWidth="82rem"
      >
        <Table.Header>
          <div>顧客編號</div>
          <div>姓名</div>
          <div>Email</div>
          <div>電話</div>
          <div>註冊日期</div>
          <div>訂單數</div>
          <div>活動數</div>
          <div></div>
        </Table.Header>

        <Table.Body
          data={filtered}
          render={(guest) => <GuestRow key={guest.id} guest={guest} />}
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

export default GuestTable;
