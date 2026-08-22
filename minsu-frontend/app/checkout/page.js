import Link from "next/link";

import { auth } from "../_lib/auth";
import { getGuest, getProducts, getSettings } from "../_lib/data-service";
import SiteHeader from "../_components/SiteHeader";
import SiteFooter from "../_components/SiteFooter";
import CheckoutClient from "./CheckoutClient";

export const revalidate = 0;

export const metadata = {
  title: "結帳",
};

export default async function CheckoutPage() {
  const session = await auth();
  // 未登入也可以訪客身分結帳，訂單查詢連結會寄到填寫的 Email
  const [products, settings, guest] = await Promise.all([
    getProducts(),
    getSettings(),
    session?.user?.email
      ? getGuest(session.user.email).catch(() => null)
      : null,
  ]);

  return (
    <>
      <SiteHeader user={session?.user} />

      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-6 py-5 text-xs text-primary-500 md:px-10">
        <Link href="/shop" className="transition hover:text-primary-900">
          選物商店
        </Link>
        <span>/</span>
        <Link href="/cart" className="transition hover:text-primary-900">
          購物車
        </Link>
        <span>/</span>
        <span className="text-primary-900">結帳</span>
      </div>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
        <h1 className="mb-8 font-serif text-3xl font-semibold text-primary-900">
          結帳
        </h1>
        {!session?.user && (
          <div className="mb-6 rounded-lg border border-primary-200 bg-primary-100 px-4 py-3 text-sm text-primary-700">
            你目前以訪客身分結帳，訂單成立後查詢連結會寄到你填寫的 Email。
            已有帳號？{" "}
            <Link
              href="/login?next=%2Fcheckout"
              className="font-semibold text-accent-700 underline"
            >
              登入會員
            </Link>{" "}
            可在會員中心管理訂單。
          </div>
        )}
        <CheckoutClient products={products} settings={settings} guest={guest} />
      </main>

      <SiteFooter />
    </>
  );
}
