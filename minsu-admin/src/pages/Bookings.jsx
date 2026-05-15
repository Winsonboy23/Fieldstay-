import { useState } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import {
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlineFunnel,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";

import BookingTable from "../features/bookings/BookingTable";
import ActivitySignupTable from "../features/activities/ActivitySignupTable";
import { useBookingStats } from "../features/bookings/useBookingStats";
import { useSignupStats } from "../features/activities/useSignupStats";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { formatCurrency } from "../utils/helpers";

const Page = styled.div`
  display: flex;
  flex-direction: column;

  & > *:nth-child(1) {
    margin-bottom: 1.6rem;
  }
  & > *:nth-child(2) {
    margin-bottom: 1.2rem;
  }
  & > *:nth-child(3) {
    margin-bottom: 2.4rem;
  }
`;

const PageHeader = styled.div``;

const PageTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--color-grey-800);
  margin-bottom: 0.4rem;
`;

const PageSubtitle = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

const ToolBar = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: center;
  padding: 1.6rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;

  & svg {
    position: absolute;
    left: 1.2rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-grey-400);
  }

  & input {
    width: 100%;
    background-color: var(--color-grey-50);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 1rem 1.2rem 1rem 3.6rem;
    font-size: 1.4rem;
    color: var(--color-grey-700);
  }

  & input:focus {
    outline: none;
    border-color: var(--color-brand-600);
  }
`;

const FilterWrap = styled.div`
  position: relative;
`;

const FilterButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1.4rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  color: var(--color-grey-700);
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  min-width: 14rem;
  justify-content: space-between;

  & svg {
    width: 1.6rem;
    height: 1.6rem;
    color: var(--color-grey-500);
  }

  &:hover {
    background-color: var(--color-grey-50);
  }
`;

const FilterMenu = styled.ul`
  position: absolute;
  right: 0;
  top: calc(100% + 0.6rem);
  min-width: 16rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: 0.6rem;
  z-index: 50;
`;

const FilterItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 0.8rem 1.2rem;
  font-size: 1.4rem;
  color: var(--color-grey-700);
  border-radius: var(--border-radius-sm);
  cursor: pointer;

  &:hover {
    background-color: var(--color-grey-50);
  }

  & svg {
    width: 1.6rem;
    height: 1.6rem;
    color: var(--color-brand-600);
  }
`;

const TopRow = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 2.4rem;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const StatColumn = styled.aside`
  display: flex;
  align-items: stretch;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  overflow: hidden;
`;

const StatRow = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.4rem 1.6rem;
  min-width: 0;

  &:not(:last-child) {
    border-right: 1px solid var(--color-grey-100);
  }
`;

const StatLabel = styled.span`
  font-size: 1.2rem;
  color: var(--color-grey-500);
  white-space: nowrap;
`;

const StatValue = styled.span`
  font-size: 1.8rem;
  font-weight: 700;
  white-space: nowrap;
  color: ${(p) => p.$color || "var(--color-grey-800)"};
`;

const ROOM_FILTERS = [
  { value: "all", label: "全部狀態" },
  { value: "pending", label: "待確認" },
  { value: "confirmed", label: "已確認" },
  { value: "in-progress", label: "進行中" },
  { value: "done", label: "已完成" },
  { value: "cancelled", label: "已取消" },
];

const ACTIVITY_FILTERS = [
  { value: "all", label: "全部狀態" },
  { value: "pending", label: "待確認" },
  { value: "confirmed", label: "已確認" },
  { value: "cancelled", label: "已取消" },
];

const TypeTabs = styled.div`
  display: inline-flex;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 0.4rem;
  gap: 0.4rem;
`;

const TypeTabButton = styled.button`
  padding: 0.8rem 1.6rem;
  border: none;
  border-radius: var(--border-radius-sm);
  background: ${(p) =>
    p.$active ? "var(--color-brand-600)" : "transparent"};
  color: ${(p) =>
    p.$active ? "white" : "var(--color-grey-600)"};
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: ${(p) =>
      p.$active ? "var(--color-brand-600)" : "var(--color-grey-50)"};
  }
`;

function Bookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useOutsideClick(() => setOpen(false), false);
  const type = searchParams.get("type") === "activity" ? "activity" : "room";
  const tab = searchParams.get("tab") || "all";
  const search = searchParams.get("q") || "";
  const { stats: roomStats } = useBookingStats();
  const { stats: activityStats } = useSignupStats();
  const isActivity = type === "activity";
  const stats = isActivity ? activityStats : roomStats;

  const FILTERS = isActivity ? ACTIVITY_FILTERS : ROOM_FILTERS;
  const current = FILTERS.find((f) => f.value === tab) || FILTERS[0];

  function handleType(value) {
    if (value === "room") searchParams.delete("type");
    else searchParams.set("type", value);
    searchParams.delete("tab");
    searchParams.delete("page");
    searchParams.delete("q");
    setSearchParams(searchParams);
  }

  function handleTab(value) {
    if (value === "all") searchParams.delete("tab");
    else searchParams.set("tab", value);
    searchParams.delete("page");
    setSearchParams(searchParams);
    setOpen(false);
  }

  function handleSearch(e) {
    const value = e.target.value;
    if (value) searchParams.set("q", value);
    else searchParams.delete("q");
    searchParams.delete("page");
    setSearchParams(searchParams);
  }

  return (
    <Page>
      <TopRow>
        <PageHeader>
          <PageTitle>訂單管理</PageTitle>
          <PageSubtitle>查看和管理所有房間訂單</PageSubtitle>
        </PageHeader>

        <StatColumn>
          <StatRow>
            <StatLabel>總訂單數</StatLabel>
            <StatValue>{stats.total}</StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>待確認</StatLabel>
            <StatValue $color="#f59e0b">{stats.pending}</StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>已確認</StatLabel>
            <StatValue $color="#16a34a">{stats.confirmed}</StatValue>
          </StatRow>
          {!isActivity && (
            <StatRow>
              <StatLabel>進行中</StatLabel>
              <StatValue $color="#2563eb">{stats.inProgress}</StatValue>
            </StatRow>
          )}
          <StatRow>
            <StatLabel>已取消</StatLabel>
            <StatValue $color="#6b7280">{stats.cancelled}</StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>總營收</StatLabel>
            <StatValue>{formatCurrency(stats.revenue)}</StatValue>
          </StatRow>
        </StatColumn>
      </TopRow>

      <TypeTabs>
        <TypeTabButton
          $active={!isActivity}
          onClick={() => handleType("room")}
        >
          住宿
        </TypeTabButton>
        <TypeTabButton
          $active={isActivity}
          onClick={() => handleType("activity")}
        >
          活動
        </TypeTabButton>
      </TypeTabs>

      <ToolBar>
            <SearchBox>
              <HiOutlineMagnifyingGlass />
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder={
                  isActivity
                    ? "搜尋報名編號、報名人或活動名稱…"
                    : "搜尋訂單編號、住客姓名或房間…"
                }
              />
            </SearchBox>
            <FilterWrap ref={ref}>
              <FilterButton onClick={() => setOpen((v) => !v)}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                  <HiOutlineFunnel />
                  {current.label}
                </span>
                <HiOutlineChevronDown />
              </FilterButton>
              {open ? (
                <FilterMenu>
                  {FILTERS.map((f) => (
                    <FilterItem key={f.value} onClick={() => handleTab(f.value)}>
                      <span>{f.label}</span>
                      {f.value === tab ? <HiOutlineCheck /> : null}
                    </FilterItem>
                  ))}
                </FilterMenu>
              ) : null}
            </FilterWrap>
          </ToolBar>

      {isActivity ? (
        <ActivitySignupTable search={search} />
      ) : (
        <BookingTable search={search} />
      )}
    </Page>
  );
}

export default Bookings;
