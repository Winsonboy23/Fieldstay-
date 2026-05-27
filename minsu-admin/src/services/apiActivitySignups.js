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
  // 取消時走 RPC 才會還回活動 capacity
  if (patch?.status === "cancelled") {
    const { data, error } = await supabase.rpc("cancel_activity_signup", {
      p_signup_id: id,
    });
    if (error) {
      console.error(error);
      throw new Error("Signup could not be cancelled");
    }
    return data;
  }

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
