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
  getProductTemp,
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

  const temp = getProductTemp(product);
  const soldOut = isProductSoldOut(product);
  const variants = variantsOf(product);
  const minPrice = priceRange(product).min;
  // 運費說明：這個商品能走的每個溫層各列一行
  const SHIPPING_TEXT = {
    normal: `超商取貨 ${formatPrice(settings?.ship_fee_normal)}／宅配每箱 ${formatPrice(
      settings?.ship_fee_normal_home
    )}`,
    chilled: `黑貓冷藏宅配每箱 ${formatPrice(settings?.ship_fee_chilled_home)}`,
    frozen: `全家冷凍取貨 ${formatPrice(
      settings?.ship_fee_frozen_fami
    )}／黑貓冷凍宅配每箱 ${formatPrice(settings?.ship_fee_frozen_home ?? 180)}`,
  };
  const THRESHOLD = {
    normal: settings?.free_ship_threshold_normal,
    chilled: settings?.free_ship_threshold_chilled,
    frozen: settings?.free_ship_threshold_frozen,
  };
  const shippingRows = temp.temps.map((value) => ({
    value,
    label: getTemperature(value).label,
    text: SHIPPING_TEXT[value],
    threshold: Number(THRESHOLD[value]) > 0 ? Number(THRESHOLD[value]) : null,
  }));
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
  const DELIVERY_NOTE = {
    normal: "常溫商品可選超商取貨或宅配；總重超過超商限重時只能宅配。",
    chilled: "冷藏商品以黑貓冷藏宅配寄送，結帳時請填寫收件地址。",
    frozen:
      "冷凍商品可選全家冷凍取貨或黑貓冷凍宅配；總重超過全家限重時只能宅配。",
  };
  const deliveryNote =
    temp.temps.length === 1
      ? DELIVERY_NOTE[temp.temps[0]]
      : `此商品可用${temp.label}寄送，結帳時可自行選擇配送方式。`;
  const boxNote = `宅配依總重分箱計費，每箱上限 ${formatWeight(
    boxWeightG(settings)
  )}。購物車內不能用同一種溫層寄送的商品，會自動分成不同訂單、各自計算運費。`;
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
                <dd className="flex flex-col gap-1.5 text-right font-medium text-primary-900">
                  {shippingRows.map((row) => (
                    <span key={row.value}>
                      {shippingRows.length > 1 && (
                        <span className="mr-1.5 text-primary-500">{row.label}</span>
                      )}
                      {row.text}
                      {row.threshold && (
                        <span className="ml-2 text-xs font-normal text-accent-600">
                          每滿 {formatPrice(row.threshold)} 免一箱運費
                        </span>
                      )}
                    </span>
                  ))}
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
