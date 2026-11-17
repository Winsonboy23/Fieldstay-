import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "../../_lib/auth";
import BackToListLink from "../../_components/BackToListLink";
import RecentlyViewed from "../../_components/RecentlyViewed";
import { getProduct, getSettings } from "../../_lib/data-service";
import {
  formatPrice,
  boxWeightG,
  formatWeight,
  getTemperature,
  isProductSoldOut,
  priceRange,
  variantsOf,
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
  const soldOut = isProductSoldOut(product);
  const variants = variantsOf(product);
  const minPrice = priceRange(product).min;
  // 運費說明：低溫只有宅配；常溫（含兩種都可以）可超商取貨或宅配
  const isCold = temp.value === "cold";
  const shipThreshold = Number(
    isCold
      ? settings?.free_ship_threshold_chilled
      : settings?.free_ship_threshold_normal
  );
  const shippingText = isCold
    ? `低溫宅配每箱 ${formatPrice(settings?.ship_fee_chilled_home)}`
    : `超商取貨 ${formatPrice(settings?.ship_fee_normal)}／宅配每箱 ${formatPrice(
        settings?.ship_fee_normal_home
      )}`;
  // 封面＋附圖組成圖庫，去除空值與重複
  const galleryImages = [
    ...new Set(
      [product.image, ...(Array.isArray(product.gallery_images) ? product.gallery_images : [])].filter(Boolean)
    ),
  ];
  // 商品頁最下方的滿版描述圖，依後台排好的順序顯示
  const detailImages = Array.isArray(product.detail_images)
    ? product.detail_images.filter(Boolean)
    : [];
  const features = Array.isArray(product.features) ? product.features.filter(Boolean) : [];
  const notes = Array.isArray(product.notes) ? product.notes.filter(Boolean) : [];
  const deliveryNote = isCold
    ? "低溫商品以黑貓低溫宅配寄送，結帳時請填寫收件地址。"
    : temp.value === "flex"
    ? "此商品可常溫或低溫寄送，結帳時可自行選擇；常溫可選超商取貨或宅配。"
    : "常溫商品可選超商取貨或宅配；總重超過超商限重時只能宅配。";
  const boxNote = `宅配依總重分箱計費，每箱上限 ${formatWeight(
    boxWeightG(settings)
  )}。購物車內只要有需低溫配送的商品，整筆訂單會合併以低溫宅配寄出。`;
  const specRows = [
    ["內容量", product.spec_content],
    ["產地", product.spec_origin],
    ["成分", product.spec_ingredients],
    ["保存期限", product.spec_shelf_life],
    ["保存方式", product.spec_storage],
  ].filter(([, value]) => value);

  return (
    <>
      <SiteHeader />

      <BackToListLink href="/shop" label="返回選物商店" maxWidth="72rem" />

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

            {/* 價格與庫存隨所選規格變動，統一由 ProductPurchase 呈現 */}
            <div className="mt-8">
              <ProductPurchase product={product} />
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
              <div className="flex justify-between gap-6 py-3">
                <dt className="flex-shrink-0 text-primary-500">運費</dt>
                <dd className="text-right font-medium text-primary-900">
                  {shippingText}
                  {shipThreshold > 0 && (
                    <span className="ml-2 text-xs font-normal text-accent-600">
                      每滿 {formatPrice(shipThreshold)} 免一箱運費
                    </span>
                  )}
                </dd>
              </div>
              {variants.length > 1 && (
                <div className="flex justify-between py-3">
                  <dt className="text-primary-500">可選規格</dt>
                  <dd className="text-right font-medium text-primary-900">
                    {variants.map((v) => v.name).filter(Boolean).join("、")}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-6 rounded-lg bg-primary-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-primary-900">購買須知</h2>
              <ul className="mt-2 flex flex-col gap-1.5">
                {[...notes, deliveryNote, boxNote].map(
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

      {detailImages.length > 0 && (
        <section className="w-full">
          {detailImages.map((src, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={`${product.name} 商品說明 ${idx + 1}`}
              className="block w-full"
            />
          ))}
        </section>
      )}

      <RecentlyViewed
        type="product"
        item={{
          id: params.productId,
          name: product.name,
          image: galleryImages[0] || null,
          price: minPrice ? formatPrice(minPrice) : "",
          href: `/shop/${params.productId}`,
        }}
      />


      <SiteFooter />
    </>
  );
}
