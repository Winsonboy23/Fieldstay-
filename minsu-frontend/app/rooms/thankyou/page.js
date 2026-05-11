import BookingSuccessClient from "./BookingSuccessClient";

export default function Page({ searchParams }) {
  return <BookingSuccessClient bookingId={searchParams?.bookingId || ""} />;
}
