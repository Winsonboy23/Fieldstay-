"use client";

import { TrashIcon } from "@heroicons/react/24/solid";

import { useTransition } from "react";
import SpinnerMini from "./SpinnerMini";

function DeleteReservation({ bookingId, onDelete }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (confirm("確定要取消這筆訂單嗎？"))
      startTransition(() => {
        onDelete(bookingId);
      });
  }

  return (
    <button
      onClick={handleDelete}
      className="group flex flex-grow items-center justify-center gap-2 px-3 py-4 text-xs font-bold uppercase text-clay-700 transition-colors hover:bg-clay-500 hover:text-white md:justify-start md:py-0"
    >
      {!isPending ? (
        <>
          {" "}
          <TrashIcon className="h-5 w-5 text-clay-500 transition-colors group-hover:text-white" />
          <span className="mt-1">取消</span>
        </>
      ) : (
        <span className="mx-auto ">
          <SpinnerMini />
        </span>
      )}
    </button>
  );
}

export default DeleteReservation;
