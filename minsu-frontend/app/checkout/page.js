import Link from "next/link";
import { redirect } from "next/navigation";

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
  // middleware 已擋一層，這裡再確認一次（同 rooms/activities 的 confirm 頁做法）
  if (!session?.user) redirect("/login");

  const [products, settings, guest] = await Promise.all([
    getProducts(),
    getSettings(),
    getGuest(session.user.email).catch(() => null),
  ]);

  return (
    <>
      <SiteHeader user={session.user} />

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
        <CheckoutClient products={products} settings={settings} guest={guest} />
      </main>

      <SiteFooter />
    </>
  );
}
