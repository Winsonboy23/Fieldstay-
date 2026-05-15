import { useState } from "react";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";

import { getGuestBookings } from "../../services/apiGuests";
import { formatCurrency } from "../../utils/helpers";
import Spinner from "../../ui/Spinner";

const Wrap = styled.div`
  width: 60rem;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const Title = styled.div`
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

const InfoGrid = styled.dl`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem 2.4rem;
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 1.6rem 2rem;

  & dt {
    font-size: 1.2rem;
    color: var(--color-grey-500);
    margin-bottom: 0.3rem;
  }
  & dd {
    font-size: 1.4rem;
    color: var(--color-grey-800);
    font-weight: 500;
  }
`;

const Tabs = styled.div`
  display: flex;
  background-color: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  padding: 0.4rem;
  gap: 0.4rem;
`;

const TabBtn = styled.button`
  flex: 1;
  padding: 0.8rem 1rem;
  background-color: ${(p) => (p.$active ? "var(--color-grey-0)" : "transparent")};
  border: none;
  border-radius: var(--border-radius-sm);
  font-size: 1.3rem;
  font-weight: 600;
  color: ${(p) => (p.$active ? "var(--color-grey-800)" : "var(--color-grey-500)")};
  box-shadow: ${(p) => (p.$active ? "var(--shadow-sm)" : "none")};
`;

const TableWrap = styled.div`
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  overflow: hidden;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1.2rem 1.4rem;
  align-items: center;
  font-size: 1.3rem;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }
`;

const HeaderRow = styled(Row)`
  background-color: var(--color-grey-50);
  font-weight: 600;
  color: var(--color-grey-600);
  font-size: 1.2rem;
`;

const StatusTag = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.9rem;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 999px;
  background-color: ${(p) => p.$bg};
  color: ${(p) => p.$fg};
`;

const Empty = styled.div`
  padding: 2.4rem;
  text-align: center;
  color: var(--color-grey-500);
  font-size: 1.3rem;
`;

function orderCode(id) {
  return `BK${String(id || "").replace(/\D/g, "").padStart(12, "0")}`;
}

function statusBadge({ status, isPaid }) {
  if (status === "cancelled") return { label: "已取消", bg: "#f3f4f6", fg: "#6b7280" };
  if (status === "checked-out") return { label: "已完成", bg: "#dbeafe", fg: "#1d4ed8" };
  if (status === "checked-in") return { label: "進行中", bg: "#dbeafe", fg: "#1d4ed8" };
  if (status === "unconfirmed" && isPaid) return { label: "已確認", bg: "#dcfce7", fg: "#15803d" };
  return { label: "待確認", bg: "#fef3c7", fg: "#b45309" };
}

function guestCode(id) {
  return `CUS${String(id || "").replace(/\D/g, "").padStart(3, "0")}`;
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).slice(0, 10).replaceAll("/", "-");
}

function GuestDetailModal({ guest, onCloseModal }) {
  const [tab, setTab] = useState("stay");
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["guest-bookings", guest.id],
    queryFn: () => getGuestBookings(guest.id),
  });

  const stayCount = bookings.length;
  const activityCount = 0;

  return (
    <Wrap>
      <Title>
        <h3>顧客詳細資訊</h3>
        <p>
          {guest.fullName} ({guestCode(guest.id)})
        </p>
      </Title>

      <InfoGrid>
        <div>
          <dt>Email</dt>
          <dd>{guest.email}</dd>
        </div>
        <div>
          <dt>電話</dt>
          <dd>{guest.phone || "-"}</dd>
        </div>
        <div>
          <dt>註冊日期</dt>
          <dd>{formatDate(guest.created_at)}</dd>
        </div>
      </InfoGrid>

      <Tabs>
        <TabBtn $active={tab === "stay"} onClick={() => setTab("stay")}>
          住宿歷史 ({stayCount})
        </TabBtn>
        <TabBtn $active={tab === "activity"} onClick={() => setTab("activity")}>
          活動歷史 ({activityCount})
        </TabBtn>
      </Tabs>

      {tab === "stay" ? (
        isLoading ? (
          <Spinner />
        ) : bookings.length === 0 ? (
          <Empty>尚無住宿紀錄</Empty>
        ) : (
          <TableWrap>
            <HeaderRow>
              <div>訂單編號</div>
              <div>房間</div>
              <div>入住日期</div>
              <div>退房日期</div>
              <div>費用</div>
              <div>狀態</div>
            </HeaderRow>
            {bookings.map((b) => {
              const badge = statusBadge(b);
              return (
                <Row key={b.id}>
                  <div>{orderCode(b.id)}</div>
                  <div>{b.rooms?.name || "-"}</div>
                  <div>{formatDate(b.startDate)}</div>
                  <div>{formatDate(b.endDate)}</div>
                  <div>{formatCurrency(b.totalPrice)}</div>
                  <div>
                    <StatusTag $bg={badge.bg} $fg={badge.fg}>{badge.label}</StatusTag>
                  </div>
                </Row>
              );
            })}
          </TableWrap>
        )
      ) : (
        <Empty>尚無活動報名紀錄</Empty>
      )}
    </Wrap>
  );
}

export default GuestDetailModal;
