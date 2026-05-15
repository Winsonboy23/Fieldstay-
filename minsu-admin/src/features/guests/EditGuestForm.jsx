import { useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import toast from "react-hot-toast";

import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { useUpdateGuest } from "./useUpdateGuest";
import { sendPasswordResetForGuest } from "../../services/apiGuests";

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

const ResetSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.4rem;
  padding: 1.2rem;
  background-color: var(--color-grey-50);
  border-radius: var(--border-radius-md);

  & p {
    font-size: 1.2rem;
    color: var(--color-grey-600);
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.4rem;
`;

function EditGuestForm({ guestToEdit, onCloseModal }) {
  const { id, fullName, email, phone } = guestToEdit;
  const { updateGuest, isUpdating } = useUpdateGuest();
  const [sending, setSending] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: fullName || "",
      email: email || "",
      phone: phone || "",
    },
  });

  function onSubmit(data) {
    const updates = {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
    };
    updateGuest(
      { id, updates },
      { onSuccess: () => onCloseModal?.() }
    );
  }

  async function handleSendReset() {
    if (!email) return;
    if (!window.confirm(`要寄送重設密碼信給 ${email} 嗎？`)) return;
    setSending(true);
    try {
      await sendPasswordResetForGuest(email);
      toast.success("已寄出重設密碼信");
    } catch (err) {
      toast.error(err.message || "寄送失敗");
    }
    setSending(false);
  }

  return (
    <FormWrap onSubmit={handleSubmit(onSubmit)}>
      <Title>
        <h3>編輯顧客資料</h3>
        <p>更新顧客基本資訊。密碼請由顧客本人重設。</p>
      </Title>

      <Field>
        <label htmlFor="fullName">姓名</label>
        <Input
          id="fullName"
          disabled={isUpdating}
          {...register("fullName", { required: "必填" })}
        />
        {errors.fullName && <ErrorText>{errors.fullName.message}</ErrorText>}
      </Field>

      <Field>
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          type="email"
          disabled={isUpdating}
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
          disabled={isUpdating}
          {...register("phone", { required: "必填" })}
        />
        {errors.phone && <ErrorText>{errors.phone.message}</ErrorText>}
      </Field>

      <ResetSection>
        <p>顧客忘記密碼？寄送重設密碼信給此顧客的 email。</p>
        <Button
          type="button"
          variation="secondary"
          onClick={handleSendReset}
          disabled={sending}
        >
          {sending ? "寄送中…" : "寄送重設密碼信"}
        </Button>
      </ResetSection>

      <Actions>
        <Button
          type="button"
          variation="secondary"
          onClick={() => onCloseModal?.()}
          disabled={isUpdating}
        >
          取消
        </Button>
        <Button disabled={isUpdating}>儲存</Button>
      </Actions>
    </FormWrap>
  );
}

export default EditGuestForm;
