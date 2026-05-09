import { useForm } from "react-hook-form";

import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { useUpdateGuest } from "./useUpdateGuest";

function EditGuestForm({ guestToEdit, onCloseModal }) {
  const { id, fullName, email, occupation } = guestToEdit;
  const { updateGuest, isUpdating } = useUpdateGuest();

  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: {
      occupation: occupation || "",
    },
  });

  const { errors } = formState;

  function onSubmit(data) {
    updateGuest(
      {
        id,
        updates: {
          occupation: data.occupation?.trim() || null,
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
      <FormRow label="姓名">
        <Input value={fullName} disabled />
      </FormRow>

      <FormRow label="Email">
        <Input value={email} disabled />
      </FormRow>

      <FormRow label="職業" error={errors?.occupation?.message}>
        <Input
          id="occupation"
          disabled={isUpdating}
          {...register("occupation", {
            maxLength: {
              value: 80,
              message: "Occupation is too long",
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

export default EditGuestForm;
