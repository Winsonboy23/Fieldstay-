import { useForm } from "react-hook-form";

import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";
import Button from "../../ui/Button";
import { useUpdateBooking } from "./useUpdateBooking";

function EditBookingForm({ bookingToEdit, onCloseModal }) {
  const { id, numGuests, observations } = bookingToEdit;
  const { updateBooking, isUpdating } = useUpdateBooking();

  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: {
      numGuests,
      observations: observations || "",
    },
  });

  const { errors } = formState;

  function onSubmit(data) {
    updateBooking(
      {
        id,
        updates: {
          numGuests: Number(data.numGuests),
          observations: data.observations?.slice(0, 1000) || "",
        },
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
    <Form onSubmit={handleSubmit(onSubmit)} type="modal">
      <FormRow label="入住人數" error={errors?.numGuests?.message}>
        <Input
          type="number"
          id="numGuests"
          disabled={isUpdating}
          {...register("numGuests", {
            required: "This field is required",
            min: {
              value: 1,
              message: "At least 1 guest is required",
            },
          })}
        />
      </FormRow>

      <FormRow label="備註" error={errors?.observations?.message}>
        <Textarea
          id="observations"
          disabled={isUpdating}
          {...register("observations", {
            maxLength: {
              value: 1000,
              message: "Observations must be 1000 characters or less",
            },
          })}
        />
      </FormRow>

      <FormRow>
        <Button
          variation="secondary"
          type="reset"
          onClick={() => onCloseModal?.()}
        >
          取消
        </Button>
        <Button disabled={isUpdating}>儲存</Button>
      </FormRow>
    </Form>
  );
}

export default EditBookingForm;
