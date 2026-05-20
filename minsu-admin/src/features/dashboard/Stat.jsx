import styled from "styled-components";
import { HiArrowTrendingUp, HiArrowTrendingDown } from "react-icons/hi2";

const StyledStat = styled.div`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-lg);
  padding: 2rem 2.4rem 1.8rem;
  box-shadow: var(--shadow-sm);

  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  min-height: 17rem;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const IconBadge = styled.div`
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 0.8rem;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$fg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  & svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

const Title = styled.h5`
  font-family: "Noto Sans TC", sans-serif;
  font-size: 1.35rem;
  font-weight: 500;
  color: var(--color-grey-700);
  letter-spacing: 0.2px;
`;

const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
`;

const Value = styled.span`
  font-family: "Noto Serif TC", Georgia, serif;
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--color-grey-900);
  line-height: 1;
  letter-spacing: -0.5px;
`;

const Unit = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
`;

const Trend = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.3rem;
  color: var(--color-grey-500);

  & svg {
    width: 1.4rem;
    height: 1.4rem;
    color: ${(p) => (p.$up ? "var(--color-green-700)" : "var(--color-red-700)")};
  }

  & .pct {
    font-weight: 600;
    color: ${(p) => (p.$up ? "var(--color-green-700)" : "var(--color-red-700)")};
  }
`;

const Spark = styled.svg`
  width: 8rem;
  height: 3rem;
  overflow: visible;
`;

function buildPath(points) {
  if (!points || points.length < 2) return "";
  const w = 80;
  const h = 30;
  const pad = 2;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = (w - pad * 2) / (points.length - 1);
  return points
    .map((p, i) => {
      const x = pad + i * step;
      const y = h - pad - ((p - min) / range) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function Stat({
  icon,
  title,
  value,
  unit,
  iconBg,
  iconFg,
  sparkColor,
  trend,
  sparkline,
}) {
  const up = trend >= 0;
  const path = buildPath(sparkline);

  return (
    <StyledStat>
      <TopRow>
        <IconBadge $bg={iconBg} $fg={iconFg}>
          {icon}
        </IconBadge>
        <Title>{title}</Title>
      </TopRow>

      <ValueRow>
        <Value>{value}</Value>
        {unit ? <Unit>{unit}</Unit> : null}
      </ValueRow>

      <Footer>
        <Trend $up={up}>
          {up ? <HiArrowTrendingUp /> : <HiArrowTrendingDown />}
          <span className="pct">
            {up ? "+" : ""}
            {trend}%
          </span>
          <span>較上週</span>
        </Trend>
        <Spark viewBox="0 0 80 30">
          <path
            d={path}
            fill="none"
            stroke={sparkColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Spark>
      </Footer>
    </StyledStat>
  );
}

export default Stat;
