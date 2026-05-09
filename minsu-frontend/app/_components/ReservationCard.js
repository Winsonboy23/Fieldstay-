import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { format, formatDistance, isPast, isToday, parseISO } from "date-fns";
import DeleteReservation from "./DeleteReservation";
import Image from "next/image";
import Link from "next/link";

export const formatDistanceFromNow = (dateStr) =>
  formatDistance(parseISO(dateStr), new Date(), {
    addSuffix: true,
  }).replace("about ", "");

function ReservationCard({ booking, onDelete }) {
  const {
    id,
    guestId,
    startDate,
    endDate,
    numNights,
    totalPrice,
    numGuests,
    status,
    created_at,
    rooms: { name, image },
  } = booking;

  return (
    <div className="field-card flex flex-col overflow-hidden md:flex-row">
      <div className="relative h-36 md:aspect-square">
        <Image
          fill
          src={image}
          alt={`Room ${name}`}
          className="object-cover"
        />
      </div>

      <div className="flex-grow px-6 py-3 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-primary-900">
            {name}，{numNights} 晚
          </h3>
          {isPast(new Date(startDate)) ? (
            <span className="flex h-7 items-center rounded-full bg-primary-100 px-3 text-xs font-bold uppercase text-primary-500">
              已完成
            </span>
          ) : (
            <span className="flex h-7 items-center rounded-full bg-accent-50 px-3 text-xs font-bold uppercase text-accent-700">
              即將入住
            </span>
          )}
        </div>

        <p className="text-base text-primary-600 md:text-lg">
          {format(new Date(startDate), "EEE, MMM dd yyyy")} (
          {isToday(new Date(startDate))
            ? "Today"
            : formatDistanceFromNow(startDate)}
          ) &mdash; {format(new Date(endDate), "EEE, MMM dd yyyy")}
        </p>

        <div className="flex flex-wrap gap-5 mt-auto items-baseline">
          <p className="font-serif text-xl font-semibold text-primary-900">NT${totalPrice}</p>
          <p className="text-primary-300">&bull;</p>
          <p className="text-lg text-primary-600">
            {numGuests} 位旅人
          </p>
          <p className="mx-auto text-sm text-primary-500 md:mx-auto md:mr-0">
            Booked {format(new Date(created_at), "EEE, MMM dd yyyy, p")}
          </p>
        </div>
      </div>

      <div className="flex flex-row justify-between border-t border-primary-200 bg-primary-100 md:w-[112px] md:flex-col md:border-l md:border-t-0">
        {!isPast(startDate) ? (
          <>
            <Link
              href={`/account/reservations/edit/${id}`}
              className="group flex flex-grow items-center justify-center gap-2 px-3 py-4 text-xs font-bold uppercase text-primary-600 transition-colors hover:bg-accent-600 hover:text-white md:justify-start md:py-0"
            >
              <PencilSquareIcon className="h-5 w-5 text-primary-600 group-hover:text-primary-800 transition-colors" />
              <span className="mt-1">Edit</span>
            </Link>
            <DeleteReservation bookingId={id} onDelete={onDelete} />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default ReservationCard;
