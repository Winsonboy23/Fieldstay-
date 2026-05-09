import styled from "styled-components";

const Input = styled.input`
  border: 1px solid var(--color-grey-200);
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: 1rem 1.3rem;

  &:focus {
    outline: 2px solid var(--color-brand-600);
    outline-offset: 1px;
  }
`;

export default Input;
