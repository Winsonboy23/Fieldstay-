import supabase from "./supabase";

export async function getAllSignups() {
  const { data, error } = await supabase
    .from("activity_signups")
    .select("*, activities(id, title, activity_date)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Activity signups could not be loaded");
  }
  return data;
}

export async function getSignupsByActivity(activityId) {
  const { data, error } = await supabase
    .from("activity_signups")
    .select("*")
    .eq("activity_id", activityId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Signups could not be loaded");
  }
  return data;
}

export async function updateSignup(id, patch) {
  const { data, error } = await supabase
    .from("activity_signups")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Signup could not be updated");
  }
  return data;
}

export async function deleteSignup(id) {
  const { error } = await supabase
    .from("activity_signups")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Signup could not be deleted");
  }
}
