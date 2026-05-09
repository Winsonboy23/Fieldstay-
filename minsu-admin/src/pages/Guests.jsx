import GuestTable from "../features/guests/GuestTable";
import Heading from "../ui/Heading";
import Row from "../ui/Row";

function Guests() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">住客資料</Heading>
      </Row>

      <GuestTable />
    </>
  );
}

export default Guests;
