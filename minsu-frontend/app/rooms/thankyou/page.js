import { notFound } from "next/navigation";
import { isPast } from "date-fns";
import { auth } from "@/app/_lib/auth";
import { getBookings, getSettings } from "@/app/_lib/data-service";
import { supabaseAdmin } from "@/app/_lib/supabase-admin";
import BookingSuccessClient from "./BookingSuccessClient";

function observationValue(observations, label) {
  if (!observations) return "";
  const prefix = `${label}：`;
  const line = String(observations)
    .split("\n")
    .find((item) => item.startsWith(prefix));
  return line ? line.slice(prefix.length).trim() : "";
}

function orderCode(id) {
  return `BK${String(id || "").replace(/\D/g, "").padStart(12, "0")}`;
}

export default async function Page({ searchParams }) {
  const bookingId = searchParams?.bookingId || "";
  if (!bookingId) notFound();

  const isAdmin = searchParams?.admin === "1";
  const headerSession = await auth();

  let booking;
  if (isAdmin) {
    const { data } = await supabaseAdmin
      .from("bookings")
      .select("*, rooms(name)")
      .eq("id", bookingId)
      .single();
    booking = data;
  } else {
    if (!headerSession?.user?.guestId) notFound();
    const bookings = await getBookings(headerSession.user.guestId);
    booking = bookings.find(
      (item) => String(item.id) === String(bookingId)
    );
  }
  if (!booking) notFound();

  const roomPrice = Number(booking.roomPrice || booking.totalPrice || 0);
  const extrasPrice = Number(booking.extrasPrice || 0);
  const cleaningFee = extrasPrice >= 500 ? 500 : 0;
  const serviceFee = Math.max(0, extrasPrice - cleaningFee);
  const totalPrice = Number(booking.totalPrice || roomPrice + extrasPrice);

  const detail = {
    bookingId: booking.id,
    orderCode: orderCode(booking.id),
    roomName: booking.rooms?.name || "已預訂房型",
    startDate: booking.startDate,
    endDate: booking.endDate,
    numNights: booking.numNights,
    numGuests: booking.numGuests,
    roomPrice,
    cleaningFee,
    serviceFee,
    totalPrice,
    contactName: observationValue(booking.observations, "訂房聯絡人"),
    contactEmail: observationValue(booking.observations, "聯絡 Email"),
    contactPhone: observationValue(booking.observations, "聯絡電話"),
    isEditable: !isAdmin && !isPast(new Date(booking.startDate)),
  };

  const settings = await getSettings();

  return (
    <BookingSuccessClient
      detail={detail}
      settings={settings}
      user={headerSession?.user || null}
    />
  );
}
