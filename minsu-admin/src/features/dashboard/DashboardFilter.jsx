import { useSearchParams } from "react-router-dom";
import styled, { css } from "styled-components";

const StyledFilter = styled.div`
  display: inline-flex;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: 999px;
  padding: 0.4rem;
  gap: 0.2rem;
  box-shadow: var(--shadow-sm);
`;

const FilterButton = styled.button`
  background: transparent;
  border: none;
  padding: 0.7rem 1.6rem;
  border-radius: 999px;
  font-weight: 500;
  font-size: 1.4rem;
  color: var(--color-grey-600);
  transition: color 0.2s, background-color 0.2s;

  &:hover:not(:disabled) {
    color: var(--color-grey-900);
  }

  ${(props) =>
    props.active === "true" &&
    css`
      background: var(--color-grey-900);
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

  function handleClick(value) {
    searchParams.set("last", value);
    setSearchParams(searchParams);
  }

  return (
    <StyledFilter>
      {options.map((option) => (
        <FilterButton
          key={option.value}
          onClick={() => handleClick(option.value)}
          active={String(option.value === current)}
          disabled={option.value === current}
        >
          {option.label}
        </FilterButton>
      ))}
    </StyledFilter>
  );
}

export default DashboardFilter;
