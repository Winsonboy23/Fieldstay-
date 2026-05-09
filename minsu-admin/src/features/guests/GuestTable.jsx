import Spinner from "../../ui/Spinner";
import Empty from "../../ui/Empty";
import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import GuestRow from "./GuestRow";
import { useGuests } from "./useGuests";

function GuestTable() {
  const { isLoading, guests = [] } = useGuests();

  if (isLoading) return <Spinner />;
  if (!guests.length) return <Empty resourceName="guests" />;

  return (
    <Menus>
      <Table columns="1.2fr 1.8fr 1.2fr 3.2rem">
        <Table.Header>
          <div>姓名</div>
          <div>Email</div>
          <div>職業</div>
          <div></div>
        </Table.Header>

        <Table.Body
          data={guests}
          render={(guest) => <GuestRow key={guest.id} guest={guest} />}
        />
      </Table>
    </Menus>
  );
}

export default GuestTable;
