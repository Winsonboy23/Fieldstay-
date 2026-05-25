import Link from "next/link";
import { auth } from "../_lib/auth";
import FaqAccordion from "../about/FaqAccordion";
import SiteFooter from "../_components/SiteFooter";
import BrandMark from "../_components/BrandMark";

export const metadata = {
  title: "常見問題",
};

export default async function FaqPage() {
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-primary-200 bg-primary-50">
        <div className="mx-auto flex h-20 w-full items-center justify-between px-5 md:px-10">
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
              className="hidden rounded-md border border-primary-200 bg-primary-50 px-5 py-3 text-sm font-semibold text-primary-900 transition hover:border-primary-400 md:inline-flex"
            >
              會員中心
            </Link>
            {session?.user ? (
              <Link
                href="/account"
                className="hidden rounded-md bg-accent-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-800 md:inline-flex"
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

      <section className="bg-primary-100 px-5 py-16 text-center md:px-10 md:py-20">
        <div className="mx-auto max-w-[680px]">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-accent-700">
            常見問題 · FAQ
          </p>
          <h1 className="mb-5 font-serif text-3xl font-bold leading-tight tracking-wide text-primary-900 md:text-4xl lg:text-5xl">
            入住前你可能會問
          </h1>
          <p className="text-[15px] leading-[1.9] text-primary-500">
            從訂房、付款到入住，我們整理了常被問到的問題。
            若仍有疑問，歡迎來信{" "}
            <a
              href="mailto:fieldstay00@gmail.com"
              className="underline underline-offset-2 hover:text-accent-700"
            >
              fieldstay00@gmail.com
            </a>
            。
          </p>
        </div>
      </section>

      <section className="px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1100px]">
          <FaqAccordion />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
