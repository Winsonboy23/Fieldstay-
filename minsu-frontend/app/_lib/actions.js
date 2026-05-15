"use server";

import { revalidatePath } from "next/cache";
import { auth, signOut } from "./auth";
import {
  createActivitySignup,
  createBooking,
  deleteBooking,
  getBookings,
  registerGuest,
  requestPasswordReset,
  updateBooking,
  updateGuest,
} from "./data-service";
import { redirect } from "next/navigation";

export async function UpdateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be signed in");

  const occupation = String(formData.get("occupation") || "").trim();

  const updateData = {
    email: session.user.email,
    occupation: occupation || null,
  };

  await updateGuest(session.user.guestId, updateData);

  // Revalidate the profile page to show the updated data
  revalidatePath("/account/profile");
}

//////////////////////
export async function createReservation(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error("You must be signed in");

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: bookingData.roomPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  // By the way, you should do some server side checking like if the dates are already booked or not etc. because we just checked in the client side in the date selector which is not enough.
  await createBooking(newBooking);
  revalidatePath(`/rooms/${bookingData.roomId}`);

  redirect("/rooms/thankyou");
}
////////////////////////

export async function deleteReservation(bookingId) {
  // await new Promise((resolve) => setTimeout(resolve, 2000));

  const session = await auth();
  if (!session) throw new Error("You must be signed in");

  /// This checking is to ensure that the user can only delete their own reservations. This is a security measure to prevent unauthorized deletion of reservations by malicious users.
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error("You don't have permission to delete this reservation");
  ///

  await deleteBooking(bookingId);
  revalidatePath("/account/reservations");
}

///////////////////////
// Update Reservation //
///////////////////////
export async function updateReservation(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be signed in");

  /// This checking is to ensure that the user can only update their own reservations. This is a security measure to prevent unauthorized deletion of reservations by malicious users.
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);
  const bookingId = Number(formData.get("bookingId"));

  if (!guestBookingIds.includes(bookingId))
    throw new Error("You don't have permission to update this reservation");
  ///

  const updateData = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
  };

  await updateBooking(bookingId, updateData);

  revalidatePath("/account/reservations");
  revalidatePath(`/account/reservations/edit/${bookingId}`);

  redirect("/account/reservations");
}

export async function createActivitySignupAction(activityId, formData) {
  const session = await auth();
  if (!session?.user) throw new Error("請先登入");

  const contactName = String(formData.get("contactName") || "").trim();
  const contactEmail = String(formData.get("contactEmail") || "").trim();
  const contactPhone = String(formData.get("contactPhone") || "").trim();
  const specialRequest = String(formData.get("specialRequest") || "").trim();
  const quantity = Number(formData.get("quantity") || 1);

  if (!contactName || !contactEmail || !contactPhone) {
    throw new Error("請填寫姓名、電子郵件與電話號碼");
  }

  const signup = await createActivitySignup({
    activityId,
    guestId: session.user.guestId || null,
    contactName,
    contactEmail,
    contactPhone,
    quantity: Math.max(1, quantity),
    specialRequest: specialRequest || null,
    paymentMethod: "transfer",
  });

  revalidatePath(`/activities/${activityId}`);
  revalidatePath("/account/experiences");
  redirect(`/account/experiences/${activityId}`);
}

///////////////////////
// Sign In / Sign Out //
///////////////////////

export async function registerAction(formData) {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const passwordConfirm = String(formData.get("passwordConfirm") || "");

  if (!fullName || !email || !password) {
    redirect("/register?error=missing_fields");
  }

  if (password.length < 8) {
    redirect("/register?error=password_too_short");
  }

  if (password !== passwordConfirm) {
    redirect("/register?error=password_mismatch");
  }

  try {
    await registerGuest({ fullName, email, password });
  } catch (error) {
    if (error.message === "email_exists") {
      redirect("/register?error=email_exists");
    }
    if (error.message === "rate_limit") {
      redirect("/register?error=rate_limit");
    }
    redirect("/register?error=register_failed");
  }

  redirect("/login?registered=1");
}

export async function forgotPasswordAction(formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!email) {
    redirect("/forgot-password?error=missing_email");
  }

  try {
    await requestPasswordReset(email);
  } catch (error) {
    console.error(error);
    redirect("/forgot-password?error=failed");
  }

  redirect("/forgot-password?sent=1");
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
