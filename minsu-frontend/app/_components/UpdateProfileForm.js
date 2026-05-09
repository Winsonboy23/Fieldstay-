"use client";

import { useFormStatus } from "react-dom";
import { UpdateGuest } from "../_lib/actions";

function UpdateProfileForm({ guest }) {
  const { fullName, email, occupation } = guest;
  const nameParts = (fullName || "").trim().split(/\s+/);
  const firstName =
    nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : fullName?.slice(0, 1);
  const lastName =
    nameParts.length > 1 ? nameParts.at(-1) : fullName?.slice(1) || "";

  return (
    <form
      action={UpdateGuest}
      className="rounded-xl border border-primary-200 bg-primary-50 p-7"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="姓氏">
          <input
            disabled
            defaultValue={firstName}
            className="member-input"
          />
        </Field>

        <Field label="名字">
          <input
            disabled
            defaultValue={lastName}
            className="member-input"
          />
        </Field>

        <Field label="電子郵件" className="md:col-span-2">
          <input
            disabled
            defaultValue={email}
            className="member-input"
          />
        </Field>

        <Field label="手機號碼" className="md:col-span-2">
          <input
            placeholder="0912-345-678"
            className="member-input"
          />
        </Field>

        <Field label="緊急聯絡人" className="md:col-span-2">
          <input
            placeholder="姓名 / 關係 / 電話"
            className="member-input"
          />
        </Field>

        <Field label="職業" className="md:col-span-2">
          <input
            defaultValue={occupation || ""}
            name="occupation"
            placeholder="例如：設計師、工程師、自由工作者"
            className="member-input"
          />
        </Field>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="reset"
          className="rounded-lg border border-primary-200 bg-primary-50 px-5 py-3 text-sm font-semibold text-primary-600 transition hover:border-primary-300 hover:text-primary-900"
        >
          取消
        </button>
        <SaveButton />
      </div>
    </form>
  );
}

function Field({ label, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-bold text-primary-900">{label}</span>
      {children}
    </label>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="rounded-lg bg-accent-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "儲存中..." : "儲存變更"}
    </button>
  );
}

export default UpdateProfileForm;
