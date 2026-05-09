import { NavLink } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineCalendarDays,
  HiOutlineCog6Tooth,
  HiOutlineHome,
  HiOutlineHomeModern,
  HiOutlineIdentification,
  HiOutlineUsers,
} from "react-icons/hi2";

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const StyledLink = styled(NavLink)`
  &:link,
  &:visited {
    display: flex;
    align-items: center;
    gap: 1.2rem;

    color: var(--color-grey-600);
    font-size: 1.6rem;
    font-weight: 600;
    padding: 1.25rem 1.6rem;
    transition: all 0.3s;
    border-radius: var(--border-radius-md);
  }

  /* This works because react-router places the active class on the active NavLink */
  &:hover,
  &:active,
  &.active:link,
  &.active:visited {
    color: var(--color-grey-800);
    background-color: var(--color-brand-50);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-400);
    transition: all 0.3s;
  }

  &:hover svg,
  &:active svg,
  &.active:link svg,
  &.active:visited svg {
    color: var(--color-brand-600);
  }
`;

function MainNav() {
  return (
    <nav>
      <NavList>
        <li>
          <StyledLink to="/dashboard">
            <HiOutlineHome />
            <span>總覽</span>
          </StyledLink>
        </li>
        <li>
          <StyledLink to="/bookings">
            <HiOutlineCalendarDays />
            <span>訂單</span>
          </StyledLink>
        </li>
        <li>
          <StyledLink to="/rooms">
            <HiOutlineHomeModern />
            <span>房型</span>
          </StyledLink>
        </li>
        <li>
          <StyledLink to="/guests">
            <HiOutlineIdentification />
            <span>住客</span>
          </StyledLink>
        </li>
        <li>
          <StyledLink to="/users">
            <HiOutlineUsers />
            <span>使用者</span>
          </StyledLink>
        </li>
        <li>
          <StyledLink to="/settings">
            <HiOutlineCog6Tooth />
            <span>設定</span>
          </StyledLink>
        </li>
      </NavList>
    </nav>
  );
}

export default MainNav;
