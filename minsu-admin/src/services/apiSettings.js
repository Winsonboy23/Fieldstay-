import supabase from "./supabase";

const BUCKET = "site-images";

export async function getSettings() {
  const { data, error } = await supabase.from("settings").select("*").single();

  if (error) {
    console.error(error);
    throw new Error("Settings could not be loaded");
  }
  return data;
}

export async function updateSetting(newSetting) {
  const { data, error } = await supabase
    .from("settings")
    .update(newSetting)
    .eq("id", 1)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Settings could not be updated");
  }
  return data;
}

function safeFileName(file) {
  return `${Date.now()}-${Math.random()}-${file.name}`
    .replaceAll("/", "")
    .replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function uploadSiteImage(file) {
  const name = safeFileName(file);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(name, file, { contentType: file.type || "image/jpeg" });
  if (error) throw new Error(`Image upload failed: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
}
