import { NextResponse } from "next/server";
import { auth } from "@/app/_lib/auth";
import { createGuestBooking } from "@/app/_lib/data-service";

const CLEANING_FEE = 500;
const SERVICE_RATE = 0.05;

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(request) {
  const session = await auth();

  if (!session?.user?.guestId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const roomId = Number(payload.roomId);
  const regularPrice = Number(payload.regularPrice);
  const discount = Number(payload.discount || 0);
  const numGuests = Number(payload.numGuests || 1);
  const startDate = parseDate(payload.startDate);
  const endDate = parseDate(payload.endDate);
  const contactName = String(payload.contactName || "").trim();
  const contactEmail = String(payload.contactEmail || "").trim();
  const contactPhone = String(payload.contactPhone || "").trim();
  const specialRequest = String(payload.specialRequest || "").trim();

  if (!roomId || !regularPrice || !startDate || !endDate || endDate <= startDate) {
    return NextResponse.json({ error: "invalid_booking" }, { status: 400 });
  }

  if (!contactName || !contactEmail || !contactPhone) {
    return NextResponse.json({ error: "missing_contact" }, { status: 400 });
  }

  const numNights = Math.round((endDate - startDate) / 86400000);
  const roomPrice = numNights * (regularPrice - discount);
  const serviceFee = Math.round(roomPrice * SERVICE_RATE);
  const totalPrice = roomPrice + CLEANING_FEE + serviceFee;
  const observations = [
    "付款方式：銀行轉帳",
    `訂房聯絡人：${contactName}`,
    `聯絡 Email：${contactEmail}`,
    `聯絡電話：${contactPhone}`,
    specialRequest ? `特殊需求：${specialRequest}` : "",
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 1000);

  try {
    const booking = await createGuestBooking({
      startDate: payload.startDate,
      endDate: payload.endDate,
      numNights,
      numGuests,
      roomPrice,
      extrasPrice: CLEANING_FEE + serviceFee,
      totalPrice,
      guestId: session.user.guestId,
      roomId,
      observations,
      isPaid: false,
      hasBreakfast: false,
      status: "unconfirmed",
    });

    return NextResponse.json({ ok: true, bookingId: booking?.id || null });
  } catch (err) {
    const msg = String(err?.message || "");
    if (msg.includes("booking_overlap") || err?.code === "23P01") {
      return NextResponse.json(
        { error: "該房間在所選日期已被預訂，請挑選其他日期" },
        { status: 409 }
      );
    }
    if (msg.includes("invalid_dates")) {
      return NextResponse.json({ error: "invalid_booking" }, { status: 400 });
    }
    console.error("reservation failed", err);
    return NextResponse.json({ error: "booking_failed" }, { status: 500 });
  }
}
