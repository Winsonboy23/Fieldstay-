import styled from "styled-components";
import {
  HiOutlineArrowUpOnSquare,
  HiOutlineBanknotes,
  HiOutlineCheckCircle,
  HiOutlinePencilSquare,
  HiOutlineXCircle,
} from "react-icons/hi2";
import toast from "react-hot-toast";

import Table from "../../ui/Table";
import Menus from "../../ui/Menus";
import Modal from "../../ui/Modal";
import { formatCurrency } from "../../utils/helpers";

import EditBookingForm from "./EditBookingForm";
import CheckinConfirm from "../check-in-out/CheckinConfirm";
import { useUpdateBooking } from "./useUpdateBooking";
import { useCheckout } from "../check-in-out/useCheckout";

const OrderCode = styled.a`
  font-family: "Noto Sans TC", sans-serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-brand-700);
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const Room = styled.div`
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

const PayWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: flex-start;

  & .method {
    color: var(--color-grey-700);
    font-size: 1.3rem;
  }
`;

const SubTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.2rem 0.8rem;
  border-radius: 100px;
  background-color: ${(p) => (p.$paid ? "#dcfce7" : "#fee2e2")};
  color: ${(p) => (p.$paid ? "#15803d" : "#b91c1c")};

  & svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

const StatusCell = styled.div`
  display: flex;
  justify-content: center;
`;

const StatusTag = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  font-size: 1.3rem;
  font-weight: 600;
  padding: 0.6rem 1.6rem;
  border-radius: 100px;
  background-color: ${(p) => p.$bg};
  color: ${(p) => p.$fg};
  min-width: 7rem;
`;

function orderCode(id) {
  return `BK${String(id || "").replace(/\D/g, "").padStart(12, "0")}`;
}

function formatDateRange(startDate, endDate) {
  return {
    start: String(startDate || "").replaceAll("-", "/"),
    end: String(endDate || "").replaceAll("-", "/"),
  };
}

function observationValue(observations, label) {
  if (!observations) return "";
  const prefix = `${label}：`;
  const line = String(observations)
    .split("\n")
    .find((item) => item.startsWith(prefix));
  return line ? line.slice(prefix.length).trim() : "";
}

function statusBadge({ status, isPaid }) {
  if (status === "cancelled") return { label: "已取消", bg: "#f3f4f6", fg: "#6b7280" };
  if (status === "checked-out") return { label: "已完成", bg: "#dbeafe", fg: "#1d4ed8" };
  if (status === "checked-in") return { label: "進行中", bg: "#dbeafe", fg: "#1d4ed8" };
  if (status === "unconfirmed" && isPaid) return { label: "已確認", bg: "#dcfce7", fg: "#15803d" };
  return { label: "待確認", bg: "#fef3c7", fg: "#b45309" };
}

function BookingRow({ booking }) {
  const {
    id: bookingId,
    startDate,
    endDate,
    numNights,
    totalPrice,
    status,
    isPaid,
    payment_method: paymentMethod,
    observations,
    guests: { fullName: guestName } = {},
    rooms: { name: roomName } = {},
  } = booking;

  const { updateBooking, isUpdating } = useUpdateBooking();
  const { checkout, isCheckingOut } = useCheckout();

  const dates = formatDateRange(startDate, endDate);
  const badge = statusBadge({ status, isPaid });
  const isBankTransfer = paymentMethod !== "credit_card";
  const phone = observationValue(observations, "聯絡電話");

  const isPendingConfirm = status === "unconfirmed" && !isPaid;
  const isConfirmed = status === "unconfirmed" && isPaid;
  const isCheckedIn = status === "checked-in";

  function handleConfirmTransfer() {
    if (!window.confirm("確認此筆訂單已收到轉帳款項？")) return;
    updateBooking({ id: bookingId, updates: { isPaid: true } });
  }

  function handleCancel() {
    if (!window.confirm("確定要取消此筆訂單？取消後將無法復原。")) return;
    updateBooking(
      { id: bookingId, updates: { status: "cancelled" } },
      { onSuccess: () => toast.success("訂單已取消") }
    );
  }

  function handleCheckout() {
    if (!window.confirm("確認辦理退房？")) return;
    checkout(bookingId);
  }

  return (
    <Table.Row>
      <OrderCode
        href={`http://localhost:3000/rooms/thankyou?bookingId=${bookingId}&admin=1`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {orderCode(bookingId)}
      </OrderCode>

      <Room>{roomName}</Room>

      <Stacked>
        <span>{guestName}</span>
        <span>{phone || "-"}</span>
      </Stacked>

      <Stacked>
        <span>{dates.start}</span>
        <span>至 {dates.end}</span>
      </Stacked>

      <div>{numNights} 晚</div>

      <Amount>{formatCurrency(totalPrice)}</Amount>

      <PayWrap>
        <span className="method">{isBankTransfer ? "銀行轉帳" : "信用卡"}</span>
        {isBankTransfer ? (
          <SubTag $paid={isPaid}>
            {isPaid ? <HiOutlineCheckCircle /> : <HiOutlineXCircle />}
            {isPaid ? "已轉帳" : "未轉帳"}
          </SubTag>
        ) : null}
      </PayWrap>

      <StatusCell>
        <StatusTag $bg={badge.bg} $fg={badge.fg}>
          {badge.label}
        </StatusTag>
      </StatusCell>

      <Modal>
        <Menus.Menu>
          <Menus.Toggle id={bookingId} />
          <Menus.List id={bookingId}>
            {isPendingConfirm && (
              <Menus.Button
                icon={<HiOutlineBanknotes />}
                onClick={handleConfirmTransfer}
                disabled={isUpdating}
              >
                確認轉帳
              </Menus.Button>
            )}

            {isConfirmed && (
              <Modal.Open opens="checkin">
                <Menus.Button icon={<HiOutlineCheckCircle />}>
                  Check-in
                </Menus.Button>
              </Modal.Open>
            )}

            {isCheckedIn && (
              <Menus.Button
                icon={<HiOutlineArrowUpOnSquare />}
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                Check-out
              </Menus.Button>
            )}

            <Modal.Open opens="edit">
              <Menus.Button icon={<HiOutlinePencilSquare />}>編輯訂單</Menus.Button>
            </Modal.Open>

            {(isPendingConfirm || isConfirmed) && (
              <Menus.Button
                icon={<HiOutlineXCircle />}
                onClick={handleCancel}
                disabled={isUpdating}
              >
                取消訂單
              </Menus.Button>
            )}
          </Menus.List>
        </Menus.Menu>

        <Modal.Window name="edit">
          <EditBookingForm bookingToEdit={booking} />
        </Modal.Window>

        <Modal.Window name="checkin">
          <CheckinConfirm booking={booking} />
        </Modal.Window>
      </Modal>
    </Table.Row>
  );
}

export default BookingRow;
