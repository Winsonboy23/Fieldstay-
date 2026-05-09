import { redirect } from "next/navigation";

export const metadata = {
  title: "會員中心",
};

export default function Page() {
  redirect("/account/reservations");
}
