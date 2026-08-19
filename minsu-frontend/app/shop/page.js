import Link from "next/link";

import { auth } from "../_lib/auth";
import { getProducts } from "../_lib/data-service";
import { TEMPERATURE_ORDER, getTemperature } from "../_lib/product-utils";
import ProductCard from "../_components/ProductCard";
import SiteHeader from "../_components/SiteHeader";
import SiteFooter from "../_components/SiteFooter";

export const revalidate = 0;

export const metadata = {
  title: "選物商店",
};

export default async function ShopPage() {
  const session = await auth();
  const products = await getProducts();

  const groups = TEMPERATURE_ORDER.map((value) => ({
    temp: getTemperature(value),
    items: products.filter((p) => p.temperature === value),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <SiteHeader user={session?.user} />

      <section className="border-b border-primary-200 bg-primary-100">
        <div className="mx-auto w-full max-w-6xl px-6 py-14 md:px-10 md:py-20">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary-500">
            Fieldstay Select · 選物商店
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold leading-snug text-primary-900 md:text-4xl">
            把田裡的味道
            <br />
            帶回家
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-primary-600">
            在地小農契作與自家手作的食品雜貨。常溫與冷凍商品以超商取貨寄送，
            冷藏商品走低溫宅配；不同溫層會分開計算運費與寄送。
          </p>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-6 py-4 text-xs text-primary-500 md:px-10">
        <Link href="/" className="transition hover:text-primary-900">
          首頁
        </Link>
        <span>/</span>
        <span className="text-primary-900">選物商店</span>
      </div>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-primary-300 px-6 py-20 text-center">
            <p className="font-serif text-lg text-primary-700">商品準備中</p>
            <p className="mt-2 text-sm text-primary-500">
              目前尚未上架任何商品，請稍後再回來看看。
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.temp.value} className="mb-14">
              <div className="mb-5 flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: group.temp.color }}
                  aria-hidden="true"
                />
                <h2 className="font-serif text-xl font-semibold text-primary-900">
                  {group.temp.label}商品
                </h2>
                <span className="text-xs text-primary-500">
                  {group.temp.delivery}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <SiteFooter />
    </>
  );
}
