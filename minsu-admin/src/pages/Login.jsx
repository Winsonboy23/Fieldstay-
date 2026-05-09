import styled from "styled-components";
import LoginForm from "../features/authentication/LoginForm";
import Logo from "../ui/Logo";
import Heading from "../ui/Heading";

const LoginLayout = styled.main`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 48rem;
  align-content: center;
  justify-content: center;
  gap: 2.4rem;
  background:
    linear-gradient(180deg, rgba(0, 63, 55, 0.88), rgba(0, 63, 55, 0.62)),
    var(--color-grey-50);
  padding: 2.4rem;

  & > * {
    background: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
  }

  & > :first-child {
    padding: 2.4rem;
  }

  & > h4 {
    padding: 2rem 2.4rem;
    margin: 0;
  }
`;

function Login() {
  return (
    <LoginLayout>
      <Logo />
      <Heading as="h4">登入山田後台</Heading>
      <LoginForm />
    </LoginLayout>
  );
}

export default Login;
