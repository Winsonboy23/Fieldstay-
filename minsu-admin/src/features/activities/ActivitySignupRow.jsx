import styled from "styled-components";
import {
  HiOutlineBanknotes,
  HiOutlineTrash,
  HiOutlineXCircle,
} from "react-icons/hi2";

import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";
import { formatCurrency } from "../../utils/helpers";
import { useUpdateAnySignup, useDeleteAnySignup } from "./useAllSignups";

const OrderCode = styled.span`
  font-family: "Noto Sans TC", sans-serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-brand-700);
`;

const Cell = styled.div`
  font-weight: 500;
  color: var(--color-grey-700);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Stacked = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  & span:first-child {
    font-weight: 500;
    color: var(--color-grey-700);
  }

  & span:last-child {
    color: var(--color-grey-500);
    font-size: 1.2rem;
  }
`;

const Amount = styled.div`
  font-family: "Noto Sans TC", sans-serif;
  font-weight: 600;
  color: var(--color-grey-700);
`;

const StatusCell = styled.div`
  display: flex;
  justify-content: center;
`;

const StatusTag = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  font-size: 1.3rem;
  font-weight: 600;
  padding: 0.6rem 1.6rem;
  border-radius: 100px;
  background-color: ${(p) => p.$bg};
  color: ${(p) => p.$fg};
  min-width: 7rem;
`;

function signupCode(id) {
  return `AC${String(id || "").replace(/\D/g, "").padStart(12, "0")}`;
}

function statusBadge(signup) {
  if (signup.status === "cancelled")
    return { label: "已取消", bg: "#f3f4f6", fg: "#6b7280" };
  if (signup.payment_status === "paid")
    return { label: "已確認", bg: "#dcfce7", fg: "#15803d" };
  return { label: "待確認", bg: "#fef3c7", fg: "#b45309" };
}

function ActivitySignupRow({ signup }) {
  const { updateSignup, isUpdating } = useUpdateAnySignup();
  const { deleteSignup, isDeleting } = useDeleteAnySignup();

  const badge = statusBadge(signup);
  const isCancelled = signup.status === "cancelled";
  const isPaid = signup.payment_status === "paid";
  const activityTitle = signup.activities?.title || "—";
  const activityDate = signup.activities?.activity_date
    ? String(signup.activities.activity_date).replaceAll("-", "/")
    : "—";

  function handleConfirmPaid() {
    if (!window.confirm("確認此筆活動報名已收到款項？")) return;
    updateSignup({ id: signup.id, patch: { payment_status: "paid" } });
  }

  function handleCancel() {
    if (!window.confirm("確定要取消此筆報名？")) return;
    updateSignup({ id: signup.id, patch: { status: "cancelled" } });
  }

  return (
    <Table.Row>
      <OrderCode>{signupCode(signup.id)}</OrderCode>

      <Cell>{activityTitle}</Cell>

      <Stacked>
        <span>{signup.contact_name || "—"}</span>
        <span>{signup.contact_phone || "-"}</span>
      </Stacked>

      <Cell>{activityDate}</Cell>

      <div>{signup.quantity || 1} 人</div>

      <Amount>{formatCurrency(signup.total_price || 0)}</Amount>

      <StatusCell>
        <StatusTag $bg={badge.bg} $fg={badge.fg}>{badge.label}</StatusTag>
      </StatusCell>

      <Modal>
        <Menus.Menu>
          <Menus.Toggle id={signup.id} />
          <Menus.List id={signup.id}>
            {!isCancelled && !isPaid && (
              <Menus.Button
                icon={<HiOutlineBanknotes />}
                onClick={handleConfirmPaid}
                disabled={isUpdating}
              >
                確認轉帳
              </Menus.Button>
            )}

            {!isCancelled && (
              <Menus.Button
                icon={<HiOutlineXCircle />}
                onClick={handleCancel}
                disabled={isUpdating}
              >
                取消報名
              </Menus.Button>
            )}

            <Modal.Open opens="delete">
              <Menus.Button icon={<HiOutlineTrash />}>刪除</Menus.Button>
            </Modal.Open>
          </Menus.List>
        </Menus.Menu>

        <Modal.Window name="delete">
          <ConfirmDelete
            resourceName="這筆活動報名"
            disabled={isDeleting}
            onConfirm={() => deleteSignup(signup.id)}
          />
        </Modal.Window>
      </Modal>
    </Table.Row>
  );
}

export default ActivitySignupRow;
