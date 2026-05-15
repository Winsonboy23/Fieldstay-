import { eachDayOfInterval } from "date-fns";

import { supabase } from "./supabase";
import { supabaseAdmin } from "./supabase-admin";
import { notFound } from "next/navigation";

const fallbackCountries = [
  { name: "Taiwan", flag: "https://flagcdn.com/tw.svg" },
  { name: "Japan", flag: "https://flagcdn.com/jp.svg" },
  { name: "Hong Kong", flag: "https://flagcdn.com/hk.svg" },
  { name: "Singapore", flag: "https://flagcdn.com/sg.svg" },
  { name: "Malaysia", flag: "https://flagcdn.com/my.svg" },
  { name: "United States of America", flag: "https://flagcdn.com/us.svg" },
];

const oldResourceName = ["ca", "bin"].join("");
const newResourceName = "room";
const roomImageVersion = "rooms-v2";

function normalizeRoomImage(image) {
  if (!image) return image;

  const normalizedImage = image
    .replace(`${oldResourceName}-images`, `${newResourceName}-images`)
    .replace(`${oldResourceName}-`, `${newResourceName}-`);

  if (!normalizedImage.includes(`${newResourceName}-images`)) {
    return normalizedImage;
  }

  const separator = normalizedImage.includes("?") ? "&" : "?";
  return `${normalizedImage}${separator}v=${roomImageVersion}`;
}

function normalizeRoom(room) {
  if (!room) return room;

  return {
    ...room,
    image: normalizeRoomImage(room.image),
  };
}

function normalizeBooking(booking) {
  if (!booking?.rooms) return booking;

  return {
    ...booking,
    rooms: normalizeRoom(booking.rooms),
  };
}

/////////////
// GET

export async function getRoom(id) {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", id)
    .single();

  // For testing
  // await new Promise((res) => setTimeout(res, 2000));

  if (error) {
    console.error(error);
    notFound();
  }

  return normalizeRoom(data);
}

export async function getRoomPrice(id) {
  const { data, error } = await supabase
    .from("rooms")
    .select("regularPrice, discount")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
  }

  return data;
}

export const getRooms = async function () {
  const { data, error } = await supabase
    .from("rooms")
    .select(
      "id, name, subtitle, maxCapacity, regularPrice, discount, image, description, area_sqm, bed_text, bathroom_text, category, amenities, gallery_images"
    )
    .order("name");

  // For testing
  // await new Promise((res) => setTimeout(res, 1000));

  if (error) {
    console.error(error);
    throw new Error("Rooms could not be loaded");
  }

  return data.map(normalizeRoom);
};

// Guests are uniquely identified by their email address
export async function getGuest(email) {
  const { data, error } = await supabaseAdmin.rpc("get_guest_by_email", {
    p_email: email,
  });

  // No error here! We handle the possibility of no guest in the sign in callback
  if (error) {
    console.error(error);
    return null;
  }

  return data?.[0] ?? null;
}

export async function getBooking(id) {
  const { data, error, count } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not get loaded");
  }

  return data;
}

export async function getBookings(guestId) {
  const { data, error } = await supabaseAdmin.rpc("get_guest_bookings", {
    p_guest_id: guestId,
  });

  if (!error) {
    return data.map(normalizeBooking);
  }

  console.error(error);

  const fallback = await supabaseAdmin
    .from("bookings")
    .select(
      "id, created_at, startDate, endDate, numNights, numGuests, roomPrice, extrasPrice, totalPrice, guestId, roomId, observations, status, isPaid, rooms(name, image)"
    )
    .eq("guestId", guestId)
    .order("startDate", { ascending: false });

  if (fallback.error) {
    console.error(fallback.error);
    throw new Error("Bookings could not get loaded");
  }

  return fallback.data.map(normalizeBooking);
}

export async function getBookedDatesByRoomId(roomId) {
  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  today = today.toISOString();

  // Getting all bookings
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("roomId", roomId)
    .or(`startDate.gte.${today},status.eq.checked-in`);

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  // Converting to actual dates to be displayed in the date picker
  const bookedDates = data
    .map((booking) => {
      return eachDayOfInterval({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      });
    })
    .flat();

  return bookedDates;
}

export async function getSettings() {
  const { data, error } = await supabase.from("settings").select("*").single();

  // For testing
  // await new Promise((res) => setTimeout(res, 5000));

  if (error) {
    console.error(error);
    throw new Error("Settings could not be loaded");
  }

  return data;
}

// Activities
export async function getActivities() {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("is_published", true)
    .order("activity_date", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("Activities could not be loaded");
  }
  return data;
}

export async function getActivity(id) {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error("Activity could not be loaded");
  }
  return data;
}

export async function getActivitySignupsByGuestId(guestId) {
  const { data, error } = await supabaseAdmin
    .from("activity_signups")
    .select("*, activities(*)")
    .eq("guest_id", guestId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Activity signups could not be loaded");
  }
  return data;
}

export async function getActivitySignupByActivityAndGuest(activityId, guestId) {
  const { data, error } = await supabaseAdmin
    .from("activity_signups")
    .select("*, activities(*)")
    .eq("activity_id", activityId)
    .eq("guest_id", guestId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error("Activity signup could not be loaded");
  }
  return data;
}

export async function getActivitySignupById(signupId) {
  const { data, error } = await supabaseAdmin
    .from("activity_signups")
    .select("*, activities(*)")
    .eq("id", signupId)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error("Activity signup could not be loaded");
  }
  return data;
}

export async function createActivitySignup({
  activityId,
  guestId,
  contactName,
  contactEmail,
  contactPhone,
  quantity = 1,
  specialRequest = null,
  paymentMethod = "transfer",
}) {
  const { data, error } = await supabaseAdmin.rpc("create_activity_signup", {
    p_activity_id: activityId,
    p_guest_id: guestId,
    p_contact_name: contactName,
    p_contact_email: contactEmail,
    p_contact_phone: contactPhone,
    p_quantity: quantity,
    p_special_request: specialRequest,
    p_payment_method: paymentMethod,
  });

  if (error) {
    console.error(error);
    throw new Error(`Activity signup failed: ${error.message}`);
  }
  return data;
}

export async function getCountries() {
  try {
    const res = await fetch(
      "https://restcountries.com/v2/all?fields=name,flag",
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) return fallbackCountries;

    const countries = await res.json();
    return countries;
  } catch {
    return fallbackCountries;
  }
}

/////////////
// CREATE

export async function createGuest(newGuest) {
  const { data, error } = await supabaseAdmin.rpc("ensure_guest", {
    p_full_name: newGuest.fullName,
    p_email: newGuest.email,
  });

  if (error) {
    console.error(error);
    throw new Error("Guest could not be created");
  }

  return data?.[0] ?? null;
}

export async function registerGuest({ fullName, email, password }) {
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { fullName },
      emailRedirectTo: `${siteUrl}/verify`,
    },
  });

  if (error) {
    console.error(error);
    const msg = error.message?.toLowerCase() || "";
    if (msg.includes("already registered") || msg.includes("user already")) {
      throw new Error("email_exists");
    }
    if (
      error.code === "over_email_send_rate_limit" ||
      msg.includes("rate limit")
    ) {
      throw new Error("rate_limit");
    }
    throw new Error(error.message);
  }

  return data?.user ?? null;
}

export async function requestPasswordReset(email) {
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

export async function createBooking(newBooking) {
  const { error } = await supabaseAdmin.from("bookings").insert([newBooking]);

  if (error) {
    console.error("createBooking failed", error);
    throw new Error("Booking could not be created");
  }

  return null;
}

export async function createGuestBooking(newBooking) {
  const { data, error } = await supabaseAdmin.rpc("create_guest_booking", {
    p_guest_id: newBooking.guestId,
    p_room_id: newBooking.roomId,
    p_start_date: newBooking.startDate,
    p_end_date: newBooking.endDate,
    p_num_nights: newBooking.numNights,
    p_num_guests: newBooking.numGuests,
    p_room_price: newBooking.roomPrice,
    p_extras_price: newBooking.extrasPrice,
    p_total_price: newBooking.totalPrice,
    p_observations: newBooking.observations || null,
  });

  if (error) {
    console.error("createGuestBooking failed", error);
    throw new Error("Booking could not be created");
  }

  return data?.[0] ?? null;
}

/////////////
// UPDATE

// The updatedFields is an object which should ONLY contain the updated data
export async function updateGuest(id, updatedFields) {
  const { data, error } = await supabaseAdmin.rpc("update_guest_profile", {
    p_email: updatedFields.email,
    p_occupation: updatedFields.occupation || "",
  });

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }
  return data?.[0] ?? null;
}

export async function updateBooking(id, updatedFields) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .update(updatedFields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  return data;
}

/////////////
// DELETE

export async function deleteBooking(id) {
  const { data, error } = await supabaseAdmin.from("bookings").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }
  return data;
}
