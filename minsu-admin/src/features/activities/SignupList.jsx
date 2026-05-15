import styled from "styled-components";
import { HiOutlineTrash } from "react-icons/hi2";

import {
  useActivitySignups,
  useUpdateSignup,
  useDeleteSignup,
} from "./useActivitySignups";

const Wrapper = styled.div`
  width: min(880px, 92vw);
  max-height: 86vh;
  overflow-y: auto;
`;

const Header = styled.header`
  margin-bottom: 1.8rem;

  h2 {
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--color-grey-800);
    margin: 0 0 0.4rem;
  }

  p {
    font-size: 1.3rem;
    color: var(--color-grey-500);
    margin: 0;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.8rem;

  div {
    background: var(--color-grey-50);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 1.2rem 1.4rem;
  }

  small {
    display: block;
    font-size: 1.2rem;
    color: var(--color-grey-500);
    margin-bottom: 0.4rem;
  }

  strong {
    font-size: 1.8rem;
    color: var(--color-grey-800);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 1.3rem;

  th,
  td {
    text-align: left;
    padding: 1rem 0.8rem;
    border-bottom: 1px solid var(--color-grey-100);
  }

  th {
    font-weight: 600;
    color: var(--color-grey-500);
    background: var(--color-grey-50);
    font-size: 1.2rem;
  }
`;

const StatusPill = styled.span`
  display: inline-block;
  padding: 0.25rem 0.8rem;
  border-radius: 999px;
  font-size: 1.1rem;
  font-weight: 600;
  background: ${(p) =>
    p.$kind === "confirmed"
      ? "#dcfce7"
      : p.$kind === "waitlist"
      ? "#fef3c7"
      : "#f3f4f6"};
  color: ${(p) =>
    p.$kind === "confirmed"
      ? "#166534"
      : p.$kind === "waitlist"
      ? "#92400e"
      : "#6b7280"};
`;

const Empty = styled.p`
  text-align: center;
  color: var(--color-grey-500);
  padding: 3rem;
`;

const StyledSelect = styled.select`
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  background: var(--color-grey-0);
  font-size: 1.2rem;
  font-family: inherit;
`;

const DelBtn = styled.button`
  border: none;
  background: none;
  color: var(--color-grey-500);
  cursor: pointer;
  padding: 0.4rem;

  &:hover {
    color: var(--color-red-700);
  }

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

function fmtDate(s) {
  if (!s) return "—";
  const d = new Date(s);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

const STATUS_LABELS = {
  confirmed: "已確認",
  waitlist: "候補",
  cancelled: "取消",
};

const PAY_LABELS = {
  unpaid: "未付款",
  paid: "已付款",
  refunded: "已退款",
};

function SignupList({ activity }) {
  const { isLoading, signups } = useActivitySignups(activity.id);
  const { updateSignup, isUpdating } = useUpdateSignup(activity.id);
  const { deleteSignup, isDeleting } = useDeleteSignup(activity.id);

  const confirmed = (signups || []).filter((s) => s.status === "confirmed");
  const waitlist = (signups || []).filter((s) => s.status === "waitlist");
  const totalRevenue = confirmed.reduce((sum, s) => sum + (s.total_price || 0), 0);

  return (
    <Wrapper>
      <Header>
        <h2>{activity.title}</h2>
        <p>報名管理</p>
      </Header>

      <Stats>
        <div>
          <small>容量</small>
          <strong>{activity.capacity}</strong>
        </div>
        <div>
          <small>已確認</small>
          <strong>{confirmed.length}</strong>
        </div>
        <div>
          <small>候補</small>
          <strong>{waitlist.length}</strong>
        </div>
        <div>
          <small>已確認營收</small>
          <strong>NT${totalRevenue.toLocaleString()}</strong>
        </div>
      </Stats>

      {isLoading ? (
        <Empty>載入中...</Empty>
      ) : !signups?.length ? (
        <Empty>尚無報名紀錄</Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>報名時間</th>
              <th>姓名</th>
              <th>聯絡方式</th>
              <th>人數</th>
              <th>金額</th>
              <th>狀態</th>
              <th>付款</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {signups.map((s) => (
              <tr key={s.id}>
                <td>{fmtDate(s.created_at)}</td>
                <td>{s.contact_name}</td>
                <td>
                  {s.contact_email}
                  <br />
                  <small style={{ color: "var(--color-grey-500)" }}>
                    {s.contact_phone}
                  </small>
                </td>
                <td>{s.quantity}</td>
                <td>NT${Number(s.total_price || 0).toLocaleString()}</td>
                <td>
                  <StyledSelect
                    value={s.status}
                    disabled={isUpdating}
                    onChange={(e) =>
                      updateSignup({ id: s.id, patch: { status: e.target.value } })
                    }
                  >
                    {Object.entries(STATUS_LABELS).map(([v, lbl]) => (
                      <option key={v} value={v}>
                        {lbl}
                      </option>
                    ))}
                  </StyledSelect>
                  <div style={{ display: "none" }}>
                    <StatusPill $kind={s.status}>
                      {STATUS_LABELS[s.status] || s.status}
                    </StatusPill>
                  </div>
                </td>
                <td>
                  <StyledSelect
                    value={s.payment_status}
                    disabled={isUpdating}
                    onChange={(e) =>
                      updateSignup({
                        id: s.id,
                        patch: { payment_status: e.target.value },
                      })
                    }
                  >
                    {Object.entries(PAY_LABELS).map(([v, lbl]) => (
                      <option key={v} value={v}>
                        {lbl}
                      </option>
                    ))}
                  </StyledSelect>
                </td>
                <td>
                  <DelBtn
                    type="button"
                    aria-label="刪除"
                    disabled={isDeleting}
                    onClick={() => {
                      if (window.confirm("確定要刪除這筆報名嗎？"))
                        deleteSignup(s.id);
                    }}
                  >
                    <HiOutlineTrash />
                  </DelBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Wrapper>
  );
}

export default SignupList;
