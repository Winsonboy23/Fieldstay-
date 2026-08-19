import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "../../_lib/auth";
import { getProduct, getSettings } from "../../_lib/data-service";
import {
  formatPrice,
  getFreeShippingGap,
  getShippingFee,
  getTemperature,
  isSoldOut,
  unitPrice,
} from "../../_lib/product-utils";
import SiteHeader from "../../_components/SiteHeader";
import SiteFooter from "../../_components/SiteFooter";
import ProductPurchase from "./ProductPurchase";
import ProductGallery from "./ProductGallery";

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const product = await getProduct(params.productId);
  return { title: product?.name || "商品" };
}

export default async function ProductPage({ params }) {
  const [session, product, settings] = await Promise.all([
    auth(),
    getProduct(params.productId),
    getSettings(),
  ]);

  if (!product) notFound();

  const temp = getTemperature(product.temperature);
  const price = unitPrice(product);
  const soldOut = isSoldOut(product);
  const hasDiscount = Number(product.discount) > 0;
  const shippingFee = getShippingFee(product.temperature, 0, settings);
  const freeGap = getFreeShippingGap(product.temperature, 0, settings);
  // 封面＋附圖組成圖庫，去除空值與重複
  const galleryImages = [
    ...new Set(
      [product.image, ...(Array.isArray(product.gallery_images) ? product.gallery_images : [])].filter(Boolean)
    ),
  ];
  const features = Array.isArray(product.features) ? product.features.filter(Boolean) : [];
  const notes = Array.isArray(product.notes) ? product.notes.filter(Boolean) : [];
  const deliveryNote =
    product.temperature === "chilled"
      ? "冷藏商品以黑貓低溫宅配寄送，結帳時請填寫收件地址。"
      : product.temperature === "frozen"
      ? "冷凍商品以超商冷凍店到店寄送，結帳時請指定取貨門市。"
      : "常溫商品以超商取貨寄送，結帳時可指定 7-11 或全家門市。";
  const specRows = [
    ["內容量", product.spec_content],
    ["產地", product.spec_origin],
    ["成分", product.spec_ingredients],
    ["保存期限", product.spec_shelf_life],
    ["保存方式", product.spec_storage],
  ].filter(([, value]) => value);

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
        <span className="text-primary-900">{product.name}</span>
      </div>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* 圖庫 */}
          <ProductGallery
            images={galleryImages}
            name={product.name}
            soldOut={soldOut}
          />

          {/* 資訊 */}
          <div>
            <span
              className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide text-white"
              style={{ background: temp.color }}
            >
              {temp.label}
            </span>

            <h1 className="mt-4 font-serif text-3xl font-semibold text-primary-900">
              {product.name}
            </h1>
            {product.subtitle && (
              <p className="mt-2 text-sm text-primary-500">{product.subtitle}</p>
            )}

            {features.length > 0 && (
              <ul className="mt-5 flex flex-col gap-2">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-primary-700"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="mt-1 flex-shrink-0 text-accent-500"
                    >
                      <path d="M4 12l5 5L20 6" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-primary-900">
                {formatPrice(price)}
              </span>
              {hasDiscount && (
                <span className="text-base text-primary-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-primary-700">
                {product.description}
              </p>
            )}

            <dl className="mt-8 divide-y divide-primary-200 border-y border-primary-200 text-sm">
              {specRows.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6 py-3">
                  <dt className="flex-shrink-0 text-primary-500">{label}</dt>
                  <dd className="text-right font-medium text-primary-900">
                    {value}
                  </dd>
                </div>
              ))}
              <div className="flex justify-between py-3">
                <dt className="text-primary-500">配送方式</dt>
                <dd className="font-medium text-primary-900">{temp.delivery}</dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-primary-500">運費</dt>
                <dd className="font-medium text-primary-900">
                  {formatPrice(shippingFee)}
                  {freeGap !== null && (
                    <span className="ml-2 text-xs font-normal text-accent-600">
                      滿 {formatPrice(freeGap)} 免運
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-primary-500">庫存</dt>
                <dd className="font-medium text-primary-900">
                  {product.stock === null || product.stock === undefined
                    ? "供應中"
                    : soldOut
                    ? "已售完"
                    : `尚有 ${product.stock} 件`}
                </dd>
              </div>
              {product.weight_g && (
                <div className="flex justify-between py-3">
                  <dt className="text-primary-500">商品重量</dt>
                  <dd className="font-medium text-primary-900">
                    約 {product.weight_g} 公克
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-8">
              <ProductPurchase product={product} soldOut={soldOut} />
            </div>

            <div className="mt-6 rounded-lg bg-primary-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-primary-900">購買須知</h2>
              <ul className="mt-2 flex flex-col gap-1.5">
                {[...notes, deliveryNote, "不同溫層的商品會分開成立訂單、分別計算運費。"].map(
                  (note) => (
                    <li
                      key={note}
                      className="flex gap-2 text-xs leading-relaxed text-primary-600"
                    >
                      <span className="text-primary-400">·</span>
                      {note}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
