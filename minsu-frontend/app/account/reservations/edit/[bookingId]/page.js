import { notFound } from "next/navigation";
import SubmitButton from "@/app/_components/SubmitButton";
import { auth } from "@/app/_lib/auth";
import { updateReservation } from "@/app/_lib/actions";
import { getBookings, getRoom } from "@/app/_lib/data-service";

export const metadata = {
  title: "Edit Reservation",
};

export default async function Page({ params }) {
  const bookingId = params.bookingId;
  // 只能看、改自己的訂單
  const session = await auth();
  if (!session?.user?.guestId) notFound();
  const bookings = await getBookings(session.user.guestId);
  const booking = bookings.find(
    (item) => String(item.id) === String(bookingId)
  );
  if (!booking) notFound();

  const { numGuests, observations, roomId } = booking;
  const room = roomId ? await getRoom(roomId) : null;
  const maxCapacity = room?.maxCapacity || numGuests || 1;

  return (
    <div>
      <h2 className="font-semibold text-lg md:text-2xl text-accent-400 mb-7">
        Edit Reservation #{bookingId}
      </h2>

      <form
        action={updateReservation}
        className="bg-primary-900 p-4 md:py-8 md:px-12 text-lg flex gap-6 flex-col"
      >
        <input type="hidden" name="bookingId" defaultValue={bookingId} />

        <div className="space-y-2">
          <label htmlFor="numGuests">How many guests?</label>
          <select
            name="numGuests"
            id="numGuests"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            required
            defaultValue={numGuests}
          >
            <option value="" key="">
              Select number of guests...
            </option>
            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
              <option value={x} key={x}>
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="observations">
            Anything we should know about your stay?
          </label>
          <textarea
            name="observations"
            id="observations"
            defaultValue={observations}
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
          />
        </div>

        <div className="flex justify-end items-center gap-6">
          <SubmitButton pendingLebel="Updating...">
            Update reservation
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
