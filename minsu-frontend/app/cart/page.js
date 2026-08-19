import Link from "next/link";

import { auth } from "../_lib/auth";
import { getProducts, getSettings } from "../_lib/data-service";
import SiteHeader from "../_components/SiteHeader";
import SiteFooter from "../_components/SiteFooter";
import CartClient from "./CartClient";

export const revalidate = 0;

export const metadata = {
  title: "購物車",
};

export default async function CartPage() {
  // 以伺服器端最新的商品與運費設定重新核對購物車內容
  const [session, products, settings] = await Promise.all([
    auth(),
    getProducts(),
    getSettings(),
  ]);

  return (
    <>
      <SiteHeader user={session?.user} />

      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-6 py-5 text-xs text-primary-500 md:px-10">
        <Link href="/" className="transition hover:text-primary-900">
          首頁
        </Link>
        <span>/</span>
        <Link href="/shop" className="transition hover:text-primary-900">
          選物商店
        </Link>
        <span>/</span>
        <span className="text-primary-900">購物車</span>
      </div>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
        <h1 className="mb-8 font-serif text-3xl font-semibold text-primary-900">
          購物車
        </h1>
        <CartClient products={products} settings={settings} />
      </main>

      <SiteFooter />
    </>
  );
}
