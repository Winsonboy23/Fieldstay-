import Link from "next/link";

import { auth } from "../_lib/auth";
import { getProducts } from "../_lib/data-service";
import { TEMPERATURE_ORDER, getTemperature } from "../_lib/product-utils";
import ProductCard from "../_components/ProductCard";
import SiteHeader from "../_components/SiteHeader";
import PageHero from "../_components/PageHero";
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
      <SiteHeader overlay />

      <PageHero
        eyebrow="Fieldstay Select · 選物商店"
        title={
          <>
            把田裡的味道
            <br />
            帶回家
          </>
        }
        sub="在地小農契作與自家手作的食品雜貨。"
        curveColor="#fdfbf8"
        image="/about-assets/shop-hero.jpg"
        overlay={0.42}
        tone="clay"
      />

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
