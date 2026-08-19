"use server";

import { revalidatePath } from "next/cache";
import { auth, signOut } from "./auth";
import {
  cancelShopOrder,
  createActivitySignup,
  createBooking,
  deleteBooking,
  getActivity,
  getBookings,
  getSettings,
  getShopOrderById,
  registerGuest,
  requestPasswordReset,
  updateBooking,
  updateGuest,
} from "./data-service";
import { supabaseAdmin } from "./supabase-admin";
import { sendMail } from "./mailer";
import {
  activityCreatedEmail,
  bookingCancelledEmail,
  shopOrderCancelledEmail,
} from "./emailTemplates";
import { redirect } from "next/navigation";

export async function UpdateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be signed in");

  const occupation = String(formData.get("occupation") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const emergency_contact = String(formData.get("emergency_contact") || "").trim();

  const updateData = {
    email: session.user.email,
    occupation: occupation || null,
    phone: phone || null,
    emergency_contact: emergency_contact || null,
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
  const session = await auth();
  if (!session) throw new Error("You must be signed in");

  // 驗證是本人的訂單
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);
  if (!guestBookingIds.includes(bookingId)) {
    throw new Error("You don't have permission to cancel this reservation");
  }

  // 改成「取消」而非刪除：標記 status=cancelled，並寄取消通知信
  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .select("*, rooms(*), guests(fullName, email)")
    .maybeSingle();

  if (booking && !booking.cancelled_email_sent_at) {
    try {
      const obs = String(booking.observations || "");
      const m = obs.match(/聯絡\s*Email[：: ]\s*([^\s\n]+)/i);
      const contactEmail = m?.[1] || booking.guests?.email;
      const nameMatch = obs.match(/訂房聯絡人[：: ]\s*([^\n]+)/);
      const contactName =
        nameMatch?.[1]?.trim() || booking.guests?.fullName;
      if (contactEmail) {
        const settings = await getSettings().catch(() => ({}));
        const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const { subject, html } = bookingCancelledEmail({
          booking,
          room: booking.rooms,
          contactName,
          settings: settings || {},
          siteUrl,
        });
        await sendMail({ to: contactEmail, subject, html });
        await supabaseAdmin
          .from("bookings")
          .update({ cancelled_email_sent_at: new Date().toISOString() })
          .eq("id", bookingId);
      }
    } catch (err) {
      console.error("booking cancel mail failed", err);
    }
  }

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

  let customFieldAnswers = {};
  try {
    const raw = formData.get("customFieldAnswers");
    if (raw) customFieldAnswers = JSON.parse(String(raw)) || {};
  } catch {
    customFieldAnswers = {};
  }

  if (!contactName || !contactEmail || !contactPhone) {
    throw new Error("請填寫姓名、電子郵件與電話號碼");
  }

  let signup;
  try {
    signup = await createActivitySignup({
      activityId,
      guestId: session.user.guestId || null,
      contactName,
      contactEmail,
      contactPhone,
      quantity: Math.max(1, quantity),
      specialRequest: specialRequest || null,
      paymentMethod: "transfer",
      customFieldAnswers,
    });
  } catch (err) {
    const msg = String(err?.message || "");
    if (msg.includes("ACTIVITY_FULL")) {
      throw new Error("此活動已額滿，無法報名");
    }
    if (msg.includes("ACTIVITY_NOT_FOUND")) {
      throw new Error("找不到此活動");
    }
    throw err;
  }

  // 寄出「報名成功，請完成匯款」通知信（失敗不擋報名）
  if (signup?.id && contactEmail) {
    try {
      const [activity, settings] = await Promise.all([
        getActivity(activityId).catch(() => null),
        getSettings().catch(() => ({})),
      ]);
      const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const { subject, html } = activityCreatedEmail({
        signup: {
          id: signup.id,
          contactName,
          quantity: Math.max(1, quantity),
          customFieldAnswers,
        },
        activity,
        settings: settings || {},
        siteUrl,
      });
      await sendMail({ to: contactEmail, subject, html });
    } catch (mailErr) {
      console.error("activity signup mail failed", mailErr);
    }
  }

  revalidatePath(`/activities/${activityId}`);
  revalidatePath("/account/experiences");
  redirect(`/activities/thankyou?signupId=${signup.id}`);
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

  redirect(`/register/sent?email=${encodeURIComponent(email)}`);
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

export async function cancelShopOrderAction(orderId) {
  const session = await auth();
  if (!session?.user?.guestId) throw new Error("請先登入");

  const order = await getShopOrderById(orderId);
  if (!order) throw new Error("找不到此訂單");

  // 只能取消自己的訂單
  if (String(order.guest_id) !== String(session.user.guestId)) {
    throw new Error("您沒有權限取消此訂單");
  }

  let cancelled;
  try {
    cancelled = await cancelShopOrder(orderId);
  } catch (err) {
    const msg = String(err?.message || "");
    if (msg.includes("ALREADY_SHIPPED"))
      throw new Error("訂單已出貨，無法自行取消，請與我們聯繫");
    if (msg.includes("ORDER_NOT_FOUND")) throw new Error("找不到此訂單");
    throw err;
  }

  // 寄取消通知信（失敗不擋取消）
  if (cancelled && !order.cancelled_email_sent_at) {
    try {
      const [full, settings] = await Promise.all([
        getShopOrderById(orderId),
        getSettings().catch(() => ({})),
      ]);
      const { subject, html } = shopOrderCancelledEmail({
        order: full || cancelled,
        settings: settings || {},
        siteUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
      });
      await sendMail({ to: order.contact_email, subject, html });
      await supabaseAdmin
        .from("shop_orders")
        .update({ cancelled_email_sent_at: new Date().toISOString() })
        .eq("id", orderId);
    } catch (mailErr) {
      console.error("shop order cancel mail failed", mailErr);
    }
  }

  revalidatePath("/account/shop-orders");
  revalidatePath(`/account/shop-orders/${orderId}`);
}
