import styled from "styled-components";
import { HiOutlineEye, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";

import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";
import CreateRoomForm from "./CreateRoomForm";
import { useDeleteRoom } from "./useDeleteRoom";
import { formatCurrency } from "../../utils/helpers";

const Card = styled.article`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
`;

const Cover = styled.div`
  aspect-ratio: 16 / 9;
  background-color: var(--color-grey-100);
  background-size: cover;
  background-position: center;
`;

const Body = styled.div`
  padding: 1.6rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
`;

const Title = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-grey-700);
  margin: 0;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 1.4rem;
  color: var(--color-grey-500);

  strong {
    color: var(--color-grey-700);
    font-weight: 600;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: 0.4rem;
`;

const ActionButton = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.9rem 1rem;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  color: var(--color-grey-700);
  font-size: 1.3rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: var(--color-grey-50);
    border-color: var(--color-grey-300);
  }

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

const DeleteButton = styled(ActionButton)`
  flex: 0 0 auto;
  width: 4rem;
  color: var(--color-red-700);

  &:hover {
    background: var(--color-red-100);
    border-color: var(--color-red-700);
  }
`;

function RoomCard({ room }) {
  const { isDeleting, deleteRoom } = useDeleteRoom();
  const price = room.regularPrice - (room.discount || 0);

  return (
    <Modal>
      <Card>
        <Cover
          style={room.image ? { backgroundImage: `url(${room.image})` } : undefined}
        />
        <Body>
          <Title>{room.name}</Title>

          <div>
            <StatRow>
              <span>價格</span>
              <strong>{formatCurrency(price)} / 晚</strong>
            </StatRow>
            <StatRow>
              <span>最多人數</span>
              <strong>{room.maxCapacity || 0} 位</strong>
            </StatRow>
            <StatRow>
              <span>總訂單數</span>
              <strong>{room.bookingsCount || 0} 筆</strong>
            </StatRow>
          </div>

          <Actions>
            <ActionButton
              as="a"
              href={`http://localhost:3000/rooms/${room.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <HiOutlineEye />
              預覽
            </ActionButton>

            <Modal.Open opens="edit">
              <ActionButton type="button">
                <HiOutlinePencilSquare />
                編輯
              </ActionButton>
            </Modal.Open>

            <Modal.Open opens="delete">
              <DeleteButton type="button" aria-label="刪除">
                <HiOutlineTrash />
              </DeleteButton>
            </Modal.Open>
          </Actions>
        </Body>
      </Card>

      <Modal.Window name="edit">
        <CreateRoomForm roomToEdit={room} />
      </Modal.Window>

      <Modal.Window name="delete">
        <ConfirmDelete
          resourceName={`「${room.name}」`}
          disabled={isDeleting}
          onConfirm={() => deleteRoom(room.id)}
        />
      </Modal.Window>
    </Modal>
  );
}

export default RoomCard;
