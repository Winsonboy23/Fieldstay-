import styled from "styled-components";
import { HiOutlineEye, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";

import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";
import CreateRoomForm from "./CreateRoomForm";
import { useDeleteRoom } from "./useDeleteRoom";
import { useToggleRoomActive } from "./useToggleRoomActive";
import { formatCurrency } from "../../utils/helpers";
import { getFrontendUrl } from "../../utils/frontendUrl";

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
  position: relative;
  aspect-ratio: 16 / 9;
  background-color: var(--color-grey-100);
  background-size: cover;
  background-position: center;
`;

const StatusBadge = styled.span`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  font-size: 1.1rem;
  font-weight: 600;
  background: ${(props) =>
    props.$active ? "rgba(22, 101, 52, 0.92)" : "rgba(120, 113, 108, 0.92)"};
  color: white;
  letter-spacing: 0.05em;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-top: 1px solid var(--color-grey-100);
  border-bottom: 1px solid var(--color-grey-100);
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

const ToggleSwitch = styled.button`
  position: relative;
  width: 4.4rem;
  height: 2.4rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  background: ${(props) =>
    props.$on ? "var(--color-brand-600)" : "var(--color-grey-300)"};
  transition: background 0.2s ease;
  padding: 0;
  flex-shrink: 0;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0.3rem;
    left: ${(props) => (props.$on ? "2.3rem" : "0.3rem")};
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 50%;
    background: white;
    transition: left 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
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
  const { toggleActive, isToggling } = useToggleRoomActive();
  const price = room.regularPrice - (room.discount || 0);
  const isActive = room.is_active !== false;

  return (
    <Modal>
      <Card style={{ opacity: isActive ? 1 : 0.7 }}>
        <Cover
          style={room.image ? { backgroundImage: `url(${room.image})` } : undefined}
        >
          <StatusBadge $active={isActive}>
            {isActive ? "開放中" : "暫不開放"}
          </StatusBadge>
        </Cover>
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

          <StatusRow>
            <span>{isActive ? "前台開放預訂" : "前台暫停預訂"}</span>
            <ToggleSwitch
              type="button"
              $on={isActive}
              disabled={isToggling}
              onClick={() =>
                toggleActive({ id: room.id, isActive: !isActive })
              }
              aria-label={isActive ? "點擊以暫停此房型" : "點擊以開放此房型"}
              aria-pressed={isActive}
            />
          </StatusRow>

          <Actions>
            <ActionButton
              as="a"
              href={getFrontendUrl(`/rooms/${room.id}`)}
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
