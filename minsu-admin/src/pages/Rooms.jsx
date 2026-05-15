import styled from "styled-components";
import { HiOutlinePlus } from "react-icons/hi2";

import Spinner from "../ui/Spinner";
import Empty from "../ui/Empty";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

import { useRooms } from "../features/rooms/useRooms";
import RoomCard from "../features/rooms/RoomCard";
import CreateRoomForm from "../features/rooms/CreateRoomForm";

const PageHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.6rem;
  margin-bottom: 2.4rem;

  h1 {
    font-size: 2.8rem;
    font-weight: 700;
    color: var(--color-grey-800);
    margin: 0 0 0.4rem;
  }

  p {
    color: var(--color-grey-500);
    font-size: 1.5rem;
    margin: 0;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.8rem;
`;

const AddButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
`;

function Rooms() {
  const { isLoading, rooms } = useRooms();

  if (isLoading) return <Spinner />;

  return (
    <Modal>
      <PageHeader>
        <div>
          <h1>房間管理</h1>
          <p>管理所有房間資訊和狀態</p>
        </div>
        <Modal.Open opens="create-room">
          <AddButton>
            <HiOutlinePlus />
            新增房間
          </AddButton>
        </Modal.Open>
      </PageHeader>

      {!rooms?.length ? (
        <Empty resourceName="rooms" />
      ) : (
        <Grid>
          {rooms.map((room) => (
            <RoomCard room={room} key={room.id} />
          ))}
        </Grid>
      )}

      <Modal.Window name="create-room">
        <CreateRoomForm />
      </Modal.Window>
    </Modal>
  );
}

export default Rooms;
