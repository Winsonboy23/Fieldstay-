import { Suspense } from "react";
import RoomList from "../_components/RoomList";
import Spinner from "../_components/Spinner";
import Link from "next/link";
import { auth } from "../_lib/auth";
import SiteFooter from "../_components/SiteFooter";
import BrandMark from "../_components/BrandMark";

export const revalidate = 0;

export const metadata = {
  title: "房型",
};

export default async function Page({ searchParams }) {
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email;
  const filter = searchParams?.capacity ?? "all";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-primary-200 bg-primary-50">
        <div className="mx-auto flex h-20 w-full items-center justify-between px-10">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark />
            <span className="flex flex-col leading-none">
              <span className="font-serif text-[15px] font-semibold tracking-[0.08em] text-primary-900">
                山田寓所
              </span>
              <span className="mt-1 text-[9px] tracking-[0.22em] text-primary-500">
                FIELDSTAY
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="rounded-md border border-primary-200 bg-primary-50 px-5 py-3 text-sm font-semibold text-primary-900 transition hover:border-primary-400"
            >
              會員中心
            </Link>
            {session?.user ? (
              <Link
                href="/account"
                className="rounded-md bg-accent-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-800"
              >
                {userName}
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-accent-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-800"
              >
                登入
              </Link>
            )}
          </div>
        </div>
      </header>
      <section className="border-b border-primary-200 bg-primary-50">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-10">
          <div className="mb-6 text-xs text-primary-500">
            <Link href="/" className="hover:text-accent-700">
              首頁
            </Link>
            <span className="mx-2">›</span>
            <span>所有房型</span>
          </div>

          <p className="mb-2 text-xs font-semibold tracking-[0.24em] text-accent-700">
            ROOMS & STAYS
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-tight text-primary-900">
            選擇您的住宿
          </h1>
        </div>
      </section>

      <section className="min-h-[70vh] border-t border-primary-200 bg-[#f3f1ee]">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-12 md:px-10">
          <Suspense fallback={<Spinner />} key={filter}>
            <RoomList filter={filter} />
          </Suspense>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
