import UpdateProfileForm from "@/app/_components/UpdateProfileForm";
import { auth } from "@/app/_lib/auth";
import { getGuest } from "@/app/_lib/data-service";

export const metadata = {
  title: "個人資料",
};

export default async function Page() {
  const session = await auth();
  const guest =
    (await getGuest(session.user.email)) ?? {
      fullName: session.user.name,
      email: session.user.email,
      occupation: "",
    };

  return (
    <section>
      <h2 className="mb-8 font-serif text-2xl font-semibold text-primary-900">
        個人資料
      </h2>

      <UpdateProfileForm guest={guest} />
    </section>
  );
}
