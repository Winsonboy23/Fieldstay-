import styled from "styled-components";
import {
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";

import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";
import CreateActivityForm from "./CreateActivityForm";
import { useDeleteActivity } from "./useDeleteActivity";
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
  position: relative;
`;

const CategoryBadge = styled.span`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.3rem 0.8rem;
  background: rgba(255, 255, 255, 0.93);
  color: var(--color-grey-700);
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: var(--border-radius-sm);
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

const FullTag = styled.strong`
  color: var(--color-red-700) !important;
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

function formatDateLabel(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDate();
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const wd = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
  return `${day} ${months[d.getMonth()]} (${wd})`;
}

function ActivityCard({ activity }) {
  const { isDeleting, deleteActivity } = useDeleteActivity();
  const isFull = activity.signupsCount >= activity.capacity;

  return (
    <Modal>
      <Card>
        <Cover
          style={
            activity.image ? { backgroundImage: `url(${activity.image})` } : undefined
          }
        >
          <CategoryBadge>{activity.category || "—"}</CategoryBadge>
        </Cover>
        <Body>
          <Title>{activity.title}</Title>

          <div>
            <StatRow>
              <span>日期</span>
              <strong>{formatDateLabel(activity.activity_date)}</strong>
            </StatRow>
            <StatRow>
              <span>時間</span>
              <strong>
                {(activity.start_time || "").slice(0, 5)} -{" "}
                {(activity.end_time || "").slice(0, 5)}
              </strong>
            </StatRow>
            <StatRow>
              <span>價格</span>
              <strong>{formatCurrency(activity.price)}</strong>
            </StatRow>
            <StatRow>
              <span>報名狀況</span>
              {isFull ? (
                <FullTag>
                  {activity.signupsCount} / {activity.capacity} 已額滿
                </FullTag>
              ) : (
                <strong>
                  {activity.signupsCount} / {activity.capacity}
                </strong>
              )}
            </StatRow>
          </div>

          <Actions>
            <ActionButton
              as="a"
              href={`http://localhost:3000/activities/${activity.id}`}
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
        <CreateActivityForm activityToEdit={activity} />
      </Modal.Window>

      <Modal.Window name="delete">
        <ConfirmDelete
          resourceName={`「${activity.title}」`}
          disabled={isDeleting}
          onConfirm={() => deleteActivity(activity.id)}
        />
      </Modal.Window>
    </Modal>
  );
}

export default ActivityCard;
