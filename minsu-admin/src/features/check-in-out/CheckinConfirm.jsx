import styled from "styled-components";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import Button from "../../ui/Button";
import { formatCurrency } from "../../utils/helpers";
import { updateBooking } from "../../services/apiBookings";

const Wrap = styled.div`
  width: 44rem;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
`;

const Title = styled.div`
  margin-bottom: 0.2rem;
  & h3 {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--color-grey-800);
    margin-bottom: 0.2rem;
  }
  & p {
    font-size: 1.3rem;
    color: var(--color-grey-500);
  }
`;

const InfoBox = styled.dl`
  display: grid;
  grid-template-columns: 8rem 1fr;
  row-gap: 0.8rem;
  column-gap: 1.2rem;
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.4rem 1.6rem;
  font-size: 1.4rem;

  & dt {
    color: var(--color-grey-500);
  }
  & dd {
    color: var(--color-grey-800);
    font-weight: 500;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

function orderCode(id) {
  return `BK${String(id || "").replace(/\D/g, "").padStart(12, "0")}`;
}

function CheckinConfirm({ booking, onCloseModal }) {
  const queryClient = useQueryClient();

  const { mutate: checkin, isLoading } = useMutation({
    mutationFn: () =>
      updateBooking(booking.id, { status: "checked-in", isPaid: true }),
    onSuccess: () => {
      toast.success("已 Check-in，訂單狀態為進行中");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
      queryClient.invalidateQueries({ queryKey: ["bookingStats"] });
      onCloseModal?.();
    },
    onError: () => toast.error("Check-in 失敗"),
  });

  function handleConfirm() {
    if (!window.confirm("確認為此筆訂單辦理 Check-in？")) return;
    checkin();
  }

  return (
    <Wrap>
      <Title>
        <h3>確認 Check-in</h3>
        <p>請確認以下訂單資訊</p>
      </Title>

      <InfoBox>
        <dt>訂單編號</dt>
        <dd>{orderCode(booking.id)}</dd>
        <dt>住客</dt>
        <dd>{booking.guests?.fullName || "-"}</dd>
        <dt>房間</dt>
        <dd>{booking.rooms?.name || "-"}</dd>
        <dt>入住日期</dt>
        <dd>{String(booking.startDate).replaceAll("-", "/")}</dd>
        <dt>退房日期</dt>
        <dd>{String(booking.endDate).replaceAll("-", "/")}</dd>
        <dt>晚數</dt>
        <dd>{booking.numNights} 晚</dd>
        <dt>入住人數</dt>
        <dd>{booking.numGuests} 人</dd>
        <dt>總費用</dt>
        <dd>{formatCurrency(booking.totalPrice)}</dd>
      </InfoBox>

      <Actions>
        <Button
          type="button"
          variation="secondary"
          onClick={() => onCloseModal?.()}
          disabled={isLoading}
        >
          取消
        </Button>
        <Button onClick={handleConfirm} disabled={isLoading}>
          確認 Check-in
        </Button>
      </Actions>
    </Wrap>
  );
}

export default CheckinConfirm;
