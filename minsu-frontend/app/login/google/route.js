import { signIn } from "@/app/_lib/auth";

function getNextPath(request) {
  const next = new URL(request.url).searchParams.get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/account";
  return next;
}

export async function GET(request) {
  await signIn("google", { redirectTo: getNextPath(request) });
}
