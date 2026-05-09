import { Suspense } from "react";
import RoomList from "../_components/RoomList";
import Spinner from "../_components/Spinner";
import Link from "next/link";
import { auth } from "../_lib/auth";

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
            <span className="grid h-12 w-12 place-items-center rounded-full bg-accent-700 text-white">
              <svg width="28" height="28" viewBox="0 0 38 38" fill="none" aria-hidden="true">
                <path d="M6 28 C9 28 13 16 19 19.5 C25 16 29 28 32 28 Z" fill="currentColor" opacity="0.95" />
                <path d="M23.5 13 L24.4 15.5 L27 16.4 L24.4 17.3 L23.5 19.8 L22.6 17.3 L20 16.4 L22.6 15.5 Z" fill="currentColor" />
              </svg>
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-serif text-[15px] font-semibold tracking-[0.08em] text-primary-900">
                山田寓所
              </span>
              <span className="mt-1 text-[9px] tracking-[0.22em] text-primary-500">
                FIELDSTAY
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-12 text-sm font-medium md:flex">
            <Link href="/rooms" className="text-primary-900">房型選擇</Link>
            <Link href="/#experience" className="text-primary-600 hover:text-primary-900">田間體驗</Link>
            <Link href="/about" className="text-primary-600 hover:text-primary-900">關於我們</Link>
            <Link href="#" className="text-primary-600 hover:text-primary-900">交通資訊</Link>
          </nav>

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

      <footer className="bg-black py-10 text-center text-xs text-white/50">
        © 2026 山田寓所 FIELDSTAY ・ 隱私政策 ・ 服務條款
      </footer>
    </>
  );
}
