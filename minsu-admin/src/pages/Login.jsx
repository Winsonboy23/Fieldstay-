import { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { useLogin } from "../features/authentication/useLogin";
import SpinnerMini from "../ui/SpinnerMini";

const GlobalReset = createGlobalStyle`
  html, body, #root {
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
  }
  body {
    background: #1c1814;
    font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
`;

const Page = styled.main`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: white;
`;

const Bg = styled.div`
  position: fixed;
  inset: 0;
  z-index: -3;
  background: url('/banner4.jpg') center/cover no-repeat;
`;

const BgOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background: linear-gradient(180deg,
    oklch(38% 0.05 60 / 0.2) 0%,
    oklch(28% 0.06 50 / 0.32) 100%);
`;

const BgNoise = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  mix-blend-mode: overlay;
  opacity: 0.5;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
`;

const TopBar = styled.header`
  position: fixed;
  top: 0; left: 0; right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.75rem 2.5rem;
  z-index: 5;
  text-shadow: 0 1px 4px rgba(0,0,0,0.35);
`;

const Brand = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
  color: white;

  .brand-zh {
    font-family: 'Noto Serif TC', Georgia, serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.12em;
  }
  .brand-en {
    font-size: 9px;
    letter-spacing: 0.22em;
    color: rgba(255,255,255,0.62);
    text-transform: uppercase;
    margin-top: 2px;
    display: block;
  }
`;

const Glass = styled.main`
  position: relative;
  width: 100%;
  max-width: 440px;
  padding: 2.5rem 2.5rem 2.25rem;
  border-radius: 32px;
  background: radial-gradient(ellipse 90% 80% at 50% 50%,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0.01) 60%,
    rgba(255,255,255,0.06) 100%);
  backdrop-filter: blur(4px) saturate(140%) brightness(1.03);
  -webkit-backdrop-filter: blur(4px) saturate(140%) brightness(1.03);
  border: 1px solid rgba(255,255,255,0.30);
  box-shadow:
    inset 4px 4px 12px 0 rgba(255,255,255,0.25),
    inset -2px -2px 15px 0 rgba(255,255,255,0.25),
    inset 0 0 18px 0 rgba(255,255,255,0.18),
    0 30px 60px -20px rgba(0,0,0,0.45),
    0 8px 24px -8px rgba(0,0,0,0.25);

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 8%; right: 8%;
    height: 26%;
    border-radius: 32px 32px 60% 60% / 32px 32px 100% 100%;
    background: linear-gradient(180deg,
      rgba(255,255,255,0.32) 0%,
      rgba(255,255,255,0.06) 70%,
      rgba(255,255,255,0) 100%);
    filter: blur(8px);
    pointer-events: none;
    opacity: 0.7;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0; left: 6%; right: 6%;
    height: 14%;
    border-radius: 60% 60% 32px 32px / 100% 100% 32px 32px;
    background: linear-gradient(0deg,
      rgba(255,255,255,0.18) 0%,
      rgba(255,255,255,0) 100%);
    filter: blur(6px);
    pointer-events: none;
    opacity: 0.55;
  }

  & > * { position: relative; z-index: 1; }

  @media (max-width: 560px) {
    padding: 2rem 1.75rem 1.75rem;
    border-radius: 26px;
  }
`;

const Title = styled.h1`
  font-family: 'Noto Serif TC', Georgia, serif;
  font-weight: 700;
  font-size: 2.6rem;
  letter-spacing: 0.06em;
  line-height: 1.05;
  margin-bottom: 0.7rem;
  color: white;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);

  @media (max-width: 560px) {
    font-size: 2rem;
  }
`;

const Sub = styled.p`
  font-size: 14px;
  color: rgba(255,255,255,0.82);
  margin-bottom: 1.85rem;
  letter-spacing: 0.04em;
  line-height: 1.65;
`;

const Field = styled.div`
  position: relative;
  margin-bottom: 0.65rem;

  input {
    width: 100%;
    padding: 17px 20px 17px 22px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.28);
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(8px) saturate(150%);
    -webkit-backdrop-filter: blur(8px) saturate(150%);
    font-family: inherit;
    font-size: 14.5px;
    color: white;
    letter-spacing: 0.04em;
    outline: none;
    transition: all 0.25s ease;
    box-shadow:
      inset 2px 2px 8px 1px rgba(255,255,255,0.16),
      inset -1px -1px 8px 0 rgba(255,255,255,0.10),
      inset 0 0 10px 1px rgba(255,255,255,0.10);
  }
  input::placeholder {
    color: rgba(255,255,255,0.78);
    font-weight: 400;
  }
  input:focus {
    border-color: rgba(255,255,255,0.55);
    background: rgba(255,255,255,0.20);
    box-shadow:
      inset 2px 2px 10px 1px rgba(255,255,255,0.26),
      inset -1px -1px 10px 0 rgba(255,255,255,0.18),
      inset 0 0 12px 1px rgba(255,255,255,0.18),
      0 0 0 4px rgba(255,255,255,0.10);
  }
`;

const Eye = styled.button`
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.65);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;

  &:hover { color: white; }
`;

const RowFlex = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 1rem 0.4rem 1.85rem;
  font-size: 13.5px;
`;

const Check = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  cursor: pointer;
  color: rgba(255,255,255,0.82);
  user-select: none;

  input { display: none; }
  .box {
    width: 16px;
    height: 16px;
    border: 1.5px solid rgba(255,255,255,0.55);
    border-radius: 4px;
    background: rgba(255,255,255,0.10);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  input:checked + .box {
    background: rgba(255,255,255,0.95);
    border-color: rgba(255,255,255,0.95);
    color: oklch(36% 0.08 50);
  }
  input:not(:checked) + .box svg { opacity: 0; }
`;

const SubmitWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const SubmitBtn = styled.button`
  min-width: 230px;
  padding: 15px 32px;
  border-radius: 999px;
  background: rgba(255,255,255,0.10);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1.5px solid rgba(255,255,255,0.62);
  font-family: 'Noto Serif TC', Georgia, serif;
  font-size: 15.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: white;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow:
    inset 2px 2px 10px 1px rgba(255,255,255,0.26),
    inset -1px -1px 10px 0 rgba(255,255,255,0.18),
    inset 0 0 12px 1px rgba(255,255,255,0.18),
    0 8px 24px -8px rgba(0,0,0,0.35);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;

  &:hover {
    background: rgba(255,255,255,0.95);
    color: oklch(28% 0.08 60);
    border-color: white;
    transform: translateY(-1px);
    box-shadow:
      0 12px 32px -8px rgba(0,0,0,0.4),
      inset 0 1.5px 1px rgba(255,255,255,0.9);
  }
  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.7; cursor: progress; }
`;

const Foot = styled.div`
  text-align: center;
  font-size: 13.5px;
  color: rgba(255,255,255,0.82);
  letter-spacing: 0.04em;
`;

function EyeOpenIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const { login, isLoading } = useLogin();

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    login(
      { email, password },
      {
        onSettled: () => {
          setEmail("");
          setPassword("");
        },
      }
    );
  }

  return (
    <Page>
      <GlobalReset />
      <Bg aria-hidden="true" />
      <BgOverlay aria-hidden="true" />
      <BgNoise aria-hidden="true" />

      <TopBar>
        <Brand href="/">
          <svg width="34" height="34" viewBox="0 0 38 38" fill="none" aria-hidden="true">
            <circle cx="19" cy="19" r="19" fill="rgba(255,255,255,0.18)" />
            <path d="M6 28 C9 28 13 16 19 19.5 C25 16 29 28 32 28 Z" fill="white" opacity="0.95" />
            <path d="M23.5 13 L24.4 15.5 L27 16.4 L24.4 17.3 L23.5 19.8 L22.6 17.3 L20 16.4 L22.6 15.5 Z" fill="white" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span className="brand-zh">山田寓所</span>
            <span className="brand-en">ADMIN PANEL</span>
          </div>
        </Brand>
      </TopBar>

      <Glass>
        <Title>後台系統</Title>
        <Sub>請使用管理者帳號登入，進入管理介面。</Sub>

        <form onSubmit={handleSubmit}>
          <Field>
            <input
              type="email"
              placeholder="管理者帳號"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </Field>

          <Field>
            <input
              type={showPwd ? "text" : "password"}
              placeholder="密碼"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <Eye
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              aria-label="顯示密碼"
            >
              {showPwd ? <EyeOffIcon /> : <EyeOpenIcon />}
            </Eye>
          </Field>

          <RowFlex>
            <Check>
              <input type="checkbox" defaultChecked />
              <span className="box">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              保持登入
            </Check>
          </RowFlex>

          <SubmitWrap>
            <SubmitBtn type="submit" disabled={isLoading}>
              {isLoading ? <SpinnerMini /> : <span>登　入</span>}
            </SubmitBtn>
          </SubmitWrap>

          <Foot>僅限授權管理者登入</Foot>
        </form>
      </Glass>
    </Page>
  );
}

export default Login;
