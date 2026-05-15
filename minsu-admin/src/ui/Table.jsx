import { createContext, useContext, Children } from "react";
import styled from "styled-components";

const StyledTable = styled.div`
  border: 1px solid var(--color-grey-100);
  font-size: 1.4rem;
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
`;

const ScrollArea = styled.div`
  overflow-x: auto;
`;

const CommonRow = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.columns};
  column-gap: 2.4rem;
  align-items: center;
  transition: none;
  min-width: ${(props) => props.$minWidth || "0"};
`;

const StyledHeader = styled(CommonRow)`
  padding: 1.6rem 2.4rem;
  background-color: var(--color-grey-0);
  border-bottom: 1px solid var(--color-grey-100);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
  color: var(--color-grey-600);
`;

const StyledRow = styled(CommonRow)`
  padding: 1.2rem 2.4rem;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }
`;

const StyledBody = styled.section`
  margin: 0;
`;

const Footer = styled.footer`
  background-color: var(--color-grey-0);
  border-top: 1px solid var(--color-grey-100);
  display: flex;
  justify-content: center;
  padding: 1.6rem 2.4rem;

  &:not(:has(*)) {
    display: none;
  }
`;

const Empty = styled.p`
  font-size: 1.6rem;
  font-weight: 500;
  text-align: center;
  margin: 2.4rem;
`;

const TableContext = createContext();

function Table({ columns, minWidth, children }) {
  const arr = Children.toArray(children);
  const footers = arr.filter((c) => c?.type === Footer);
  const rest = arr.filter((c) => c?.type !== Footer);
  return (
    <TableContext.Provider value={{ columns, minWidth }}>
      <StyledTable role="table">
        <ScrollArea>{rest}</ScrollArea>
        {footers}
      </StyledTable>
    </TableContext.Provider>
  );
}

function Header({ children }) {
  const { columns, minWidth } = useContext(TableContext);
  return (
    <StyledHeader role="row" columns={columns} $minWidth={minWidth} as="header">
      {children}
    </StyledHeader>
  );
}
function Row({ children }) {
  const { columns, minWidth } = useContext(TableContext);
  return (
    <StyledRow role="row" columns={columns} $minWidth={minWidth}>
      {children}
    </StyledRow>
  );
}
function Body({ data, render }) {
  if (!data.length) return <Empty>No data to show at the moment.</Empty>;
  return <StyledBody>{data.map(render)}</StyledBody>;
}

Table.Header = Header;
Table.Row = Row;
Table.Body = Body;
Table.Footer = Footer;

export default Table;
