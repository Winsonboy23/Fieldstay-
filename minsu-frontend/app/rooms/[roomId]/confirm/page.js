import { redirect } from "next/navigation";
import { auth } from "@/app/_lib/auth";
import { getRoom } from "@/app/_lib/data-service";
import ConfirmReservationClient from "./ConfirmReservationClient";

export const metadata = {
  title: "確認預訂",
};

function getValidDate(value, fallback) {
  const date = new Date(value || fallback);
  if (Number.isNaN(date.getTime())) return fallback;
  return value || fallback;
}

export default async function Page({ params, searchParams }) {
  const session = await auth();
  const roomId = Number(params.roomId);

  if (!session?.user) {
    const query = new URLSearchParams({
      checkin: searchParams.checkin || "",
      checkout: searchParams.checkout || "",
      guests: String(searchParams.guests || 1),
    });
    const next = encodeURIComponent(`/rooms/${roomId}/confirm?${query.toString()}`);
    redirect(`/login?next=${next}`);
  }

  const room = await getRoom(roomId);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const fallbackStart = today.toISOString().slice(0, 10);
  const fallbackEnd = tomorrow.toISOString().slice(0, 10);

  const startDate = getValidDate(searchParams.checkin, fallbackStart);
  const endDate = getValidDate(searchParams.checkout, fallbackEnd);

  return (
    <ConfirmReservationClient
      room={room}
      user={session.user}
      booking={{
        startDate,
        endDate,
        numGuests: Number(searchParams.guests || 1),
      }}
    />
  );
}
