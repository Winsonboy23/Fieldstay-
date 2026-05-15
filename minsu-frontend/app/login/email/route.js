import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/app/_lib/auth";

function getNextPath(request) {
  const next = new URL(request.url).searchParams.get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/account";
  return next;
}

export async function POST(request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const nextPath = getNextPath(request);

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: nextPath,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const code = error.code || "invalid_credentials";
      redirect(
        `/login?error=${encodeURIComponent(code)}&next=${encodeURIComponent(nextPath)}`
      );
    }
    throw error;
  }
}
