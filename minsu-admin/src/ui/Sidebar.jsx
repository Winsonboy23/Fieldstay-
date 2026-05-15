import styled from "styled-components";

import Logo from "./Logo";
import MainNav from "./MainNav";

const StyledSidebar = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 25rem;
  z-index: 9999;
  background-color: var(--color-grey-0);
  padding: 2.8rem 2rem;
  border-right: 1px solid var(--color-grey-100);
  display: flex;
  flex-direction: column;
  gap: 3rem;

  @media (max-width: 1440px) {
    width: 20rem;
  }
`;

function Sidebar() {
  return (
    <StyledSidebar>
      <Logo />
      <MainNav />
    </StyledSidebar>
  );
}

export default Sidebar;
