import styled from "styled-components";
import { getFrontendUrl } from "../utils/frontendUrl";

const BRAND_LOGO_URL =
  "https://wnvqbozqsdvaszfgumkg.supabase.co/storage/v1/object/public/site-images/1778689945313-0.1766648174384008-528684274_18019731992746464_3668865358020989427_n--1-.jpg";

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

const Mark = styled.img`
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 50%;
  object-fit: cover;
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
  return (
    <StyledLogo href={getFrontendUrl()} title="前往前台首頁">
      <Mark src={BRAND_LOGO_URL} alt="山田寓所" />
      <Text>
        <Name>山田寓所</Name>
        <Sub>後台管理</Sub>
      </Text>
    </StyledLogo>
  );
}

export default Logo;
