import { useForm } from "react-hook-form";
import styled from "styled-components";
import { differenceInCalendarDays } from "date-fns";

import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { useUpdateBooking } from "./useUpdateBooking";
import { useUpdateGuest } from "../guests/useUpdateGuest";

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

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.4rem;
`;

const PHONE_LABEL = "聯絡電話";

function observationValue(observations, label) {
  if (!observations) return "";
  const prefix = `${label}：`;
  const line = String(observations)
    .split("\n")
    .find((item) => item.startsWith(prefix));
  return line ? line.slice(prefix.length).trim() : "";
}

function setObservationValue(observations, label, value) {
  const prefix = `${label}：`;
  const lines = String(observations || "").split("\n").filter(Boolean);
  const next = lines.filter((line) => !line.startsWith(prefix));
  if (value) next.push(`${prefix}${value}`);
  return next.join("\n");
}

function EditBookingForm({ bookingToEdit, onCloseModal }) {
  const {
    id,
    startDate,
    endDate,
    numGuests,
    observations,
    guestId,
    guests = {},
  } = bookingToEdit;
  const phone = observationValue(observations, PHONE_LABEL);

  const { updateBooking, isUpdating } = useUpdateBooking();
  const { updateGuest, isUpdating: isUpdatingGuest } = useUpdateGuest();

  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      fullName: guests.fullName || "",
      phone,
      email: guests.email || "",
      startDate,
      endDate,
      numGuests,
    },
  });
  const { errors } = formState;

  function onSubmit(data) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const nights = Math.max(1, differenceInCalendarDays(end, start));

    const nextObservations = setObservationValue(
      observations,
      PHONE_LABEL,
      data.phone?.trim() || ""
    );

    updateBooking(
      {
        id,
        updates: {
          startDate: data.startDate,
          endDate: data.endDate,
          numNights: nights,
          numGuests: Number(data.numGuests),
          observations: nextObservations,
        },
      },
      { onSuccess: () => onCloseModal?.() }
    );

    if (guestId) {
      updateGuest({
        id: guestId,
        updates: {
          fullName: data.fullName?.trim() || guests.fullName,
          email: data.email?.trim() || guests.email,
        },
      });
    }
  }

  const disabled = isUpdating || isUpdatingGuest;

  return (
    <FormWrap onSubmit={handleSubmit(onSubmit)}>
      <Title>
        <h3>編輯訂單</h3>
        <p>修改訂單資訊</p>
      </Title>

      <Field>
        <label htmlFor="fullName">住客姓名</label>
        <Input
          id="fullName"
          {...register("fullName", { required: "必填" })}
          disabled={disabled}
        />
      </Field>

      <Field>
        <label htmlFor="phone">聯絡電話</label>
        <Input id="phone" {...register("phone")} disabled={disabled} />
      </Field>

      <Field>
        <label htmlFor="email">電子郵件</label>
        <Input
          id="email"
          type="email"
          {...register("email", { required: "必填" })}
          disabled={disabled}
        />
      </Field>

      <TwoCol>
        <Field>
          <label htmlFor="startDate">入住日期</label>
          <Input
            id="startDate"
            type="date"
            {...register("startDate", { required: "必填" })}
            disabled={disabled}
          />
        </Field>
        <Field>
          <label htmlFor="endDate">退房日期</label>
          <Input
            id="endDate"
            type="date"
            {...register("endDate", { required: "必填" })}
            disabled={disabled}
          />
        </Field>
      </TwoCol>

      <Field>
        <label htmlFor="numGuests">入住人數</label>
        <Input
          id="numGuests"
          type="number"
          min="1"
          {...register("numGuests", {
            required: "必填",
            min: { value: 1, message: "至少 1 人" },
          })}
          disabled={disabled}
        />
      </Field>

      {errors?.fullName?.message ||
      errors?.email?.message ||
      errors?.startDate?.message ||
      errors?.endDate?.message ||
      errors?.numGuests?.message ? (
        <p style={{ color: "var(--color-red-700)", fontSize: "1.3rem" }}>
          請完整填寫必填欄位
        </p>
      ) : null}

      <Actions>
        <Button
          type="button"
          variation="secondary"
          onClick={() => onCloseModal?.()}
        >
          取消
        </Button>
        <Button disabled={disabled}>儲存變更</Button>
      </Actions>
    </FormWrap>
  );
}

export default EditBookingForm;
