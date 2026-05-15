import { NavLink } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineCalendarDays,
  HiOutlineCog6Tooth,
  HiOutlineHome,
  HiOutlineHomeModern,
  HiOutlineSparkles,
  HiOutlineUsers,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";

import { useLogout } from "../features/authentication/useLogout";

const Wrap = styled.nav`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: auto;
`;

const StyledLink = styled(NavLink)`
  &:link,
  &:visited {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    color: var(--color-grey-600);
    font-size: 1.5rem;
    font-weight: 500;
    padding: 1.1rem 1.4rem;
    transition: all 0.2s;
    border-radius: var(--border-radius-md);
  }

  &:hover,
  &:active,
  &.active:link,
  &.active:visited {
    color: var(--color-brand-700);
    background-color: var(--color-brand-50);
  }

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-grey-400);
    transition: all 0.2s;
  }

  &:hover svg,
  &:active svg,
  &.active:link svg,
  &.active:visited svg {
    color: var(--color-brand-600);
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  color: var(--color-grey-600);
  font-size: 1.5rem;
  font-weight: 500;
  padding: 1.1rem 1.4rem;
  background: none;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  width: 100%;
  text-align: left;

  &:hover {
    color: var(--color-brand-700);
    background-color: var(--color-brand-50);
  }

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-grey-400);
  }

  &:hover svg {
    color: var(--color-brand-600);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function MainNav() {
  const { logout, isLoading } = useLogout();

  return (
    <Wrap>
      <NavList>
        <li>
          <StyledLink to="/dashboard">
            <HiOutlineHome />
            <span>總覽</span>
          </StyledLink>
        </li>
        <li>
          <StyledLink to="/rooms">
            <HiOutlineHomeModern />
            <span>房間管理</span>
          </StyledLink>
        </li>
        <li>
          <StyledLink to="/bookings">
            <HiOutlineCalendarDays />
            <span>訂單管理</span>
          </StyledLink>
        </li>
        <li>
          <StyledLink to="/guests">
            <HiOutlineUsers />
            <span>顧客管理</span>
          </StyledLink>
        </li>
        <li>
          <StyledLink to="/activities">
            <HiOutlineSparkles />
            <span>活動管理</span>
          </StyledLink>
        </li>
        <li>
          <StyledLink to="/settings">
            <HiOutlineCog6Tooth />
            <span>系統設定</span>
          </StyledLink>
        </li>
      </NavList>

      <LogoutButton onClick={logout} disabled={isLoading}>
        <HiOutlineArrowRightOnRectangle />
        <span>登出</span>
      </LogoutButton>
    </Wrap>
  );
}

export default MainNav;
