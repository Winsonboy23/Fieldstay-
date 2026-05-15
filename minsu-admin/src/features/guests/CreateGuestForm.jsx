import { useForm } from "react-hook-form";
import styled from "styled-components";

import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { useCreateGuest } from "./useCreateGuest";

const FormWrap = styled.form`
  width: 44rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.div`
  margin-bottom: 0.2rem;

  & h3 {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--color-grey-800);
    margin-bottom: 0.2rem;
  }
  & p {
    font-size: 1.3rem;
    color: var(--color-grey-500);
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  & label {
    font-size: 1.3rem;
    color: var(--color-grey-600);
  }
  & input {
    width: 100%;
  }
`;

const ErrorText = styled.span`
  font-size: 1.2rem;
  color: var(--color-red-700);
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.4rem;
`;

function CreateGuestForm({ onCloseModal }) {
  const { createGuest, isCreating } = useCreateGuest();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  function onSubmit(data) {
    createGuest(
      {
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
      },
      {
        onSuccess: () => {
          reset();
          onCloseModal?.();
        },
      }
    );
  }

  return (
    <FormWrap onSubmit={handleSubmit(onSubmit)}>
      <Title>
        <h3>新增顧客</h3>
        <p>建立新顧客資料。顧客本人需自行前往前台註冊來設定登入密碼。</p>
      </Title>

      <Field>
        <label htmlFor="fullName">姓名</label>
        <Input
          id="fullName"
          disabled={isCreating}
          {...register("fullName", { required: "必填" })}
        />
        {errors.fullName && <ErrorText>{errors.fullName.message}</ErrorText>}
      </Field>

      <Field>
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          type="email"
          disabled={isCreating}
          {...register("email", {
            required: "必填",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Email 格式不正確" },
          })}
        />
        {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
      </Field>

      <Field>
        <label htmlFor="phone">電話</label>
        <Input
          id="phone"
          disabled={isCreating}
          {...register("phone", { required: "必填" })}
        />
        {errors.phone && <ErrorText>{errors.phone.message}</ErrorText>}
      </Field>

      <Actions>
        <Button
          type="button"
          variation="secondary"
          onClick={() => onCloseModal?.()}
          disabled={isCreating}
        >
          取消
        </Button>
        <Button disabled={isCreating}>新增</Button>
      </Actions>
    </FormWrap>
  );
}

export default CreateGuestForm;
