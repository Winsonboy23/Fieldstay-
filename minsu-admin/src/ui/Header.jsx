import styled from "styled-components";
import { HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2";
import HeaderMenu from "./HeaderMenu";

const StyledHeader = styled.header`
  background-color: rgba(253, 251, 248, 0.92);
  backdrop-filter: blur(14px);
  padding: 1.4rem 4.8rem;
  border-bottom: 1px solid var(--color-grey-100);

  display: flex;
  gap: 2.4rem;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 1024px) {
    padding: 1.2rem 1.6rem;
    justify-content: space-between;
  }
`;

const MenuButton = styled.button`
  display: none;

  @media (max-width: 1024px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 4.4rem;
    height: 4.4rem;
    border: 1px solid var(--color-grey-200);
    border-radius: var(--border-radius-md);
    background: var(--color-grey-0);
    color: var(--color-grey-700);
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: var(--color-grey-50);
    }

    & svg {
      width: 2.4rem;
      height: 2.4rem;
    }
  }
`;

function Header({ onMenuToggle, navOpen }) {
  return (
    <StyledHeader>
      <MenuButton
        type="button"
        onClick={onMenuToggle}
        aria-label={navOpen ? "關閉選單" : "開啟選單"}
        aria-expanded={navOpen}
      >
        {navOpen ? <HiOutlineXMark /> : <HiOutlineBars3 />}
      </MenuButton>
      <HeaderMenu />
    </StyledHeader>
  );
}

export default Header;
