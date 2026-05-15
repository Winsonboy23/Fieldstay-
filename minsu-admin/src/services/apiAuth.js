import supabase, { supabaseUrl } from "./supabase";

export async function signup({ fullName, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
        avatar: "",
      },
    },
  });

  if (error) throw new Error(error.message);

  return data;
}

function getAdminEmails() {
  return String(import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function login({ email, password }) {
  const allowed = getAdminEmails();
  const normalized = String(email || "").trim().toLowerCase();

  if (allowed.length > 0 && !allowed.includes(normalized)) {
    throw new Error("此帳號無管理員權限");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalized,
    password,
  });

  if (error) throw new Error(error.message);

  // Defence in depth: ensure the resolved user email is whitelisted.
  const userEmail = String(data?.user?.email || "").toLowerCase();
  if (allowed.length > 0 && !allowed.includes(userEmail)) {
    await supabase.auth.signOut();
    throw new Error("此帳號無管理員權限");
  }

  return data;
}

export async function getCurrentUser() {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;

  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);
  return data?.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function updateCurrentUser({ password, fullName, avatar }) {
  // Turned off updating feature for publicly. You should remove this error and uncomment the rest of the codes to try with your own supabase account.
  throw new Error("Profile updates are not allowed temporarily");

  //////////////////////////////
  // //1. Update password OR fullname
  // let updateData;
  // if (password) updateData = { password };
  // if (fullName) updateData = { data: { fullName } };
  // const { data, error } = await supabase.auth.updateUser(updateData);
  // if (error) throw new Error(error.message);
  // if (!avatar) return data;
  // //2. Upload the avatar image
  // const fileName = `avatar-${data.user.id}-${Math.random()}`;
  // const { error: storageError } = await supabase.storage
  //   .from("avatars")
  //   .upload(fileName, avatar);
  // if (storageError) throw new Error(storageError.message);
  // //3. Update the avatar in the user
  // const { data: updatedUser, error: error2 } = await supabase.auth.updateUser({
  //   data: {
  //     avatar: `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`,
  //   },
  // });
  // if (error2) throw new Error(error2.message);
  // return updatedUser;
}
