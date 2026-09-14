import { useSearchParams } from "react-router-dom";
import styled, { css } from "styled-components";
import { useSlidingPill } from "../../hooks/useSlidingPill";

const StyledFilter = styled.div`
  position: relative;
  display: inline-flex;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: 999px;
  padding: 0.4rem;
  gap: 0.2rem;
  box-shadow: var(--shadow-sm);
`;

const Pill = styled.span`
  position: absolute;
  top: 0.4rem;
  bottom: 0.4rem;
  left: 0;
  border-radius: 999px;
  background: var(--color-grey-900);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    width 0.35s cubic-bezier(0.22, 1, 0.36, 1);
`;

const FilterButton = styled.button`
  position: relative;
  background: transparent;
  border: none;
  padding: 0.7rem 1.6rem;
  border-radius: 999px;
  font-weight: 500;
  font-size: 1.4rem;
  color: var(--color-grey-600);
  transition: color 0.35s;

  &:hover:not(:disabled) {
    color: var(--color-grey-900);
  }

  /* 滑鼠點擊不出現外框；鍵盤 Tab 時照常顯示 */
  &:focus:not(:focus-visible) {
    outline: none;
  }

  ${(props) =>
    props.$active === "true" &&
    css`
      color: var(--color-grey-0);

      &:hover:not(:disabled) {
        color: var(--color-grey-0);
      }
    `}
`;

const options = [
  { value: "1", label: "今日" },
  { value: "7", label: "本週" },
  { value: "30", label: "本月" },
  { value: "90", label: "近 90 天" },
];

function DashboardFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = searchParams.get("last") || "7";
  const [ref, pill] = useSlidingPill(current);

  function handleClick(value) {
    searchParams.set("last", value);
    setSearchParams(searchParams);
  }

  return (
    <StyledFilter ref={ref}>
      {pill && (
        <Pill
          style={{
            width: pill.width,
            transform: `translateX(${pill.left}px)`,
          }}
        />
      )}
      {options.map((option) => (
        <FilterButton
          key={option.value}
          onClick={() => handleClick(option.value)}
          $active={String(option.value === current)}
          data-active={option.value === current}
          disabled={option.value === current}
        >
          {option.label}
        </FilterButton>
      ))}
    </StyledFilter>
  );
}

export default DashboardFilter;
