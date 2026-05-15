import {
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { PAGE_SIZE } from "../utils/constants";

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
`;

const PageBtn = styled.button`
  min-width: 3.6rem;
  height: 3.6rem;
  padding: 0 1rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-100);
  background-color: ${(p) =>
    p.$active ? "var(--color-grey-800)" : "var(--color-grey-0)"};
  color: ${(p) =>
    p.$active ? "var(--color-grey-0)" : "var(--color-grey-700)"};
  font-size: 1.4rem;
  font-weight: 600;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background-color: ${(p) =>
      p.$active ? "var(--color-grey-700)" : "var(--color-grey-50)"};
  }

  &:disabled {
    opacity: 0.4;
  }

  & svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

const Ellipsis = styled.span`
  min-width: 2.4rem;
  text-align: center;
  color: var(--color-grey-500);
  font-size: 1.4rem;
`;

function pageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    result.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
      result.push("…");
    }
  }
  return result;
}

function Pagination({ count }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = !searchParams.get("page")
    ? 1
    : Number(searchParams.get("page"));
  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (pageCount <= 1) return null;

  function goto(page) {
    if (page < 1 || page > pageCount || page === currentPage) return;
    searchParams.set("page", page);
    setSearchParams(searchParams);
  }

  const items = pageList(currentPage, pageCount);

  return (
    <Bar>
      <PageBtn
        onClick={() => goto(1)}
        disabled={currentPage === 1}
        aria-label="第一頁"
      >
        <HiOutlineChevronDoubleLeft />
      </PageBtn>
      <PageBtn
        onClick={() => goto(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="上一頁"
      >
        <HiOutlineChevronLeft />
      </PageBtn>

      {items.map((item, idx) =>
        item === "…" ? (
          <Ellipsis key={`e-${idx}`}>…</Ellipsis>
        ) : (
          <PageBtn
            key={item}
            $active={item === currentPage}
            onClick={() => goto(item)}
          >
            {item}
          </PageBtn>
        )
      )}

      <PageBtn
        onClick={() => goto(currentPage + 1)}
        disabled={currentPage === pageCount}
        aria-label="下一頁"
      >
        <HiOutlineChevronRight />
      </PageBtn>
      <PageBtn
        onClick={() => goto(pageCount)}
        disabled={currentPage === pageCount}
        aria-label="最末頁"
      >
        <HiOutlineChevronDoubleRight />
      </PageBtn>
    </Bar>
  );
}

export default Pagination;
