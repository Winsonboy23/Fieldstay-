import supabase from "./supabase";

export async function getGuests() {
  const { data, error } = await supabase
    .from("guests")
    .select("id, fullName, email, occupation")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Guests could not be loaded");
  }

  return data;
}

export async function updateGuest({ id, updates }) {
  const { data, error } = await supabase
    .from("guests")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }

  return data;
}
