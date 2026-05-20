import styled from "styled-components";
import DashboardFilter from "../features/dashboard/DashboardFilter";
import DashboardLayout from "../features/dashboard/DashboardLayout";

const Header = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2.4rem;
  margin-bottom: 0.4rem;
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Title = styled.h1`
  font-family: "Noto Serif TC", Georgia, serif;
  font-size: 3.6rem;
  font-weight: 700;
  color: var(--color-grey-900);
  letter-spacing: -0.5px;
  line-height: 1.1;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.35rem;
  color: var(--color-grey-500);
`;

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.2rem 0.9rem;
  border-radius: 999px;
  background: var(--color-green-100);
  color: var(--color-green-700);
  font-size: 1.25rem;
  font-weight: 500;

  &::before {
    content: "";
    width: 0.5rem;
    height: 0.5rem;
    background: var(--color-green-700);
    border-radius: 50%;
  }
`;

const SOLAR_TERMS = {
  1: "小寒",
  2: "立春",
  3: "驚蟄",
  4: "清明",
  5: "立夏",
  6: "芒種",
  7: "小暑",
  8: "立秋",
  9: "白露",
  10: "寒露",
  11: "立冬",
  12: "大雪",
};

function getSolarTermLabel(date) {
  const term = SOLAR_TERMS[date.getMonth() + 1] || "";
  const suffix = date.getDate() >= 15 ? "將盡" : "時節";
  return term ? `${term}${suffix}` : "";
}

function formatDateLong(d) {
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

function Dashboard() {
  const today = new Date();
  return (
    <>
      <Header>
        <TitleGroup>
          <Title>營運總覽</Title>
          <Meta>
            <span>
              {formatDateLong(today)} · {getSolarTermLabel(today)}
            </span>
            <LiveBadge>即時資料</LiveBadge>
          </Meta>
        </TitleGroup>
        <DashboardFilter />
      </Header>

      <DashboardLayout />
    </>
  );
}

export default Dashboard;
