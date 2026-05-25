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

  @media (max-width: 1024px) {
    width: 24rem;
    transform: translateX(${(props) => (props.$open ? "0" : "-100%")});
    transition: transform 0.25s ease;
    box-shadow: ${(props) =>
      props.$open ? "0 10px 30px rgba(0, 0, 0, 0.18)" : "none"};
  }
`;

function Sidebar({ open = false }) {
  return (
    <StyledSidebar $open={open}>
      <Logo />
      <MainNav />
    </StyledSidebar>
  );
}

export default Sidebar;
