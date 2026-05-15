import { Outlet } from "react-router-dom";
import styled from "styled-components";

import Sidebar from "./Sidebar";
import Header from "./Header";

const SIDEBAR_WIDTH = "25rem";

const StyledAppLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto 1fr;
  height: 100dvh;
  background: var(--color-grey-50);
`;

const Main = styled.main`
  background-color: var(--color-grey-50);
  padding: 4rem 4.8rem 6.4rem;
  padding-left: calc(${SIDEBAR_WIDTH} + 4.8rem);
  overflow: auto;
  min-height: 0;

  @media (max-width: 1440px) {
    padding-left: calc(20rem + 4.8rem);
  }

  @media (max-width: 768px) {
    padding: 2rem;
    padding-left: 2rem;
  }
`;

const Container = styled.div`
  max-width: 128rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3.2rem;
`;

const HeaderWrap = styled.div`
  padding-left: ${SIDEBAR_WIDTH};

  @media (max-width: 1440px) {
    padding-left: 20rem;
  }

  @media (max-width: 768px) {
    padding-left: 0;
  }
`;

function AppLayout() {
  return (
    <StyledAppLayout>
      <HeaderWrap>
        <Header />
      </HeaderWrap>
      <Sidebar />
      <Main>
        <Container>
          <Outlet />
        </Container>
      </Main>
    </StyledAppLayout>
  );
}

export default AppLayout;
