import styled from "styled-components";

const StyledLogo = styled.a`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
`;

const Mark = styled.div`
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 50%;
  background: var(--color-brand-600);
  color: var(--color-brand-50);
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const Text = styled.div`
  line-height: 1;
`;

const Name = styled.div`
  color: var(--color-grey-900);
  font-family: "Noto Serif TC", Georgia, serif;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
`;

const Sub = styled.div`
  color: var(--color-grey-500);
  font-size: 1rem;
  letter-spacing: 0.22em;
  margin-top: 0.6rem;
`;

function Logo() {
  const frontendUrl =
    import.meta.env.VITE_FRONTEND_URL || "http://localhost:3000";

  return (
    <StyledLogo href={frontendUrl} title="前往前台首頁">
      <Mark aria-hidden="true">
        <svg width="34" height="34" viewBox="0 0 38 38" fill="none">
          <path d="M6 28 C9 28 13 16 19 19.5 C25 16 29 28 32 28 Z" fill="currentColor" opacity="0.95" />
          <path d="M23.5 13 L24.4 15.5 L27 16.4 L24.4 17.3 L23.5 19.8 L22.6 17.3 L20 16.4 L22.6 15.5 Z" fill="currentColor" />
        </svg>
      </Mark>
      <Text>
        <Name>後台管理</Name>
      </Text>
    </StyledLogo>
  );
}

export default Logo;
