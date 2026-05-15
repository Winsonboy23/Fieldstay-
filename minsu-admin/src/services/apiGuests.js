import { PAGE_SIZE } from "../utils/constants";
import supabase from "./supabase";

export async function getGuests({ page, search } = {}) {
  let query = supabase
    .from("guests")
    .select(
      "id, created_at, fullName, email, phone, bookings(count)",
      { count: "exact" }
    )
    .order("id", { ascending: false });

  const term = String(search || "").trim();
  if (term) {
    const digits = term.replace(/\D/g, "");
    const idMatch = digits ? Number(digits) : null;
    if (idMatch && !Number.isNaN(idMatch)) {
      query = query.eq("id", idMatch);
    } else {
      query = query.or(
        `fullName.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`
      );
    }
  }

  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error(error);
    throw new Error("Guests could not be loaded");
  }

  const guests = (data || []).map((g) => ({
    ...g,
    bookingsCount: g.bookings?.[0]?.count ?? 0,
  }));

  return { data: guests, count: count ?? 0 };
}

export async function getGuestBookings(guestId) {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, startDate, endDate, status, isPaid, totalPrice, rooms(name)")
    .eq("guestId", guestId)
    .order("startDate", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Bookings could not be loaded");
  }
  return data || [];
}

function mapRpcError(error) {
  const msg = String(error?.message || "");
  if (msg.includes("email_exists")) return "此 Email 已被註冊";
  if (msg.includes("missing_fields")) return "請填寫所有必填欄位";
  if (msg.includes("password_too_short")) return "密碼至少需要 8 個字元";
  return null;
}

export async function createGuest({ fullName, email, phone }) {
  const { data, error } = await supabase.rpc("admin_create_guest", {
    p_full_name: fullName,
    p_email: email,
    p_phone: phone,
  });
  if (error) {
    console.error(error);
    throw new Error(mapRpcError(error) || "Guest could not be created");
  }
  return data?.[0] ?? null;
}

export async function updateGuest({ id, updates }) {
  // Password is no longer managed here — customers set/reset their own password
  // via the frontend forgot-password flow. Admin can only edit profile fields.
  // eslint-disable-next-line no-unused-vars
  const { password, ...rest } = updates;

  const { error } = await supabase
    .from("guests")
    .update(rest)
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }

  return { id };
}

export async function sendPasswordResetForGuest(email) {
  const siteUrl =
    import.meta.env.VITE_FRONTEND_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });
  if (error) {
    console.error(error);
    throw new Error("無法寄送重設密碼信");
  }
}

export async function deleteGuest(id) {
  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("guestId", id);

  if (count && count > 0) {
    throw new Error(
      `此顧客還有 ${count} 筆訂單，請先取消所有訂單後再刪除`
    );
  }

  const { error } = await supabase.from("guests").delete().eq("id", id);
  if (error) {
    console.error(error);
    throw new Error("Guest could not be deleted");
  }
}
