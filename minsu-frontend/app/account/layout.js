import SideNavigation from "@/app/_components/SideNavigation";
import SignOutButton from "@/app/_components/SignOutButton";
import { auth } from "@/app/_lib/auth";
import { getBookings, getGuest } from "@/app/_lib/data-service";
import Link from "next/link";

function splitName(fullName = "") {
  const compactName = fullName.trim() || "會員";
  const parts = compactName.split(/\s+/);

  if (parts.length >= 2) {
    return {
      firstName: parts.slice(0, -1).join(" "),
      lastName: parts.at(-1),
      displayName: compactName,
    };
  }

  return {
    firstName: compactName.slice(0, 1) || "會",
    lastName: compactName.slice(1) || "員",
    displayName: compactName,
  };
}

export default async function Layout({ children }) {
  const session = await auth();
  const guest = await getGuest(session.user.email);
  const bookings = guest ? await getBookings(guest.id) : [];
  const { firstName, displayName } = splitName(
    guest?.fullName || session.user.name
  );
  const totalNights = bookings.reduce(
    (sum, booking) => sum + Number(booking.numNights || 0),
    0
  );

  return (
    <div className="min-h-screen bg-primary-100 text-primary-900">
      <header className="border-b border-primary-200 bg-primary-50">
        <div className="mx-auto flex h-16 max-w-[1840px] items-center justify-between px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-700 text-primary-50">
              <svg width="28" height="28" viewBox="0 0 38 38" fill="none" aria-hidden="true">
                <path d="M6 28 C9 28 13 16 19 19.5 C25 16 29 28 32 28 Z" fill="currentColor" opacity="0.95" />
                <path d="M23.5 13 L24.4 15.5 L27 16.4 L24.4 17.3 L23.5 19.8 L22.6 17.3 L20 16.4 L22.6 15.5 Z" fill="currentColor" />
              </svg>
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-serif text-[15px] font-semibold tracking-[0.08em]">
                山田寓所
              </span>
              <span className="mt-1 text-[9px] tracking-[0.22em] text-primary-500">
                FIELDSTAY
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-700">{displayName}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <section className="bg-accent-700 text-white">
        <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-8 px-6 py-12 md:grid-cols-[1fr_auto]">
          <div className="flex items-center gap-7">
            <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-white/35 bg-white/15 font-serif text-3xl font-semibold">
              {firstName.slice(0, 1)}
            </div>
            <div>
              <h1 className="mb-2 font-serif text-3xl font-semibold tracking-wide">
                {displayName}
              </h1>
              <p className="text-sm text-white/70">
                會員自 2025 年 8 月 ・ {session.user.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-10 text-center">
            <div>
              <p className="font-serif text-3xl font-semibold">{bookings.length}</p>
              <p className="mt-2 text-xs text-white/65">歷史訂單</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-semibold">{totalNights}</p>
              <p className="mt-2 text-xs text-white/65">入住夜數</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-semibold">0</p>
              <p className="mt-2 text-xs text-white/65">體驗課程</p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-[1040px] grid-cols-1 gap-10 px-6 py-10 md:grid-cols-[220px_1fr]">
        <SideNavigation />
        <div>{children}</div>
      </main>
    </div>
  );
}
