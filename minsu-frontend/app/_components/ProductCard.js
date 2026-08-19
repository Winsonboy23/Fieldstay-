import Link from "next/link";

import AddToCartButton from "./AddToCartButton";
import {
  firstAvailableVariant,
  formatPrice,
  getTemperature,
  hasVariantChoice,
  isProductSoldOut,
  priceRange,
  unitPrice,
  variantsOf,
} from "../_lib/product-utils";

export default function ProductCard({ product }) {
  const temp = getTemperature(product.temperature);
  const variants = variantsOf(product);
  const soldOut = isProductSoldOut(product);
  const multi = hasVariantChoice(product);
  const range = priceRange(product);

  // 單一規格時才可以直接加入購物車
  const single = multi ? null : variants[0];
  const pick = firstAvailableVariant(product);
  const hasDiscount = !multi && Number(single?.discount) > 0;
  const lowStock =
    !soldOut &&
    !multi &&
    single?.stock !== null &&
    single?.stock !== undefined &&
    single.stock <= 5;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-primary-200 bg-primary-50 transition hover:border-primary-300 hover:shadow-md">
      <Link href={`/shop/${product.id}`} className="relative block">
        <div
          className="aspect-[4/3] w-full bg-primary-100 bg-cover bg-center"
          style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
        />
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white"
          style={{ background: temp.color }}
        >
          {temp.label}
        </span>
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-primary-900/45 text-sm font-semibold tracking-widest text-white">
            已售完
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex-1">
          <Link href={`/shop/${product.id}`}>
            <h3 className="font-serif text-lg font-semibold text-primary-900">
              {product.name}
            </h3>
          </Link>
          {product.subtitle && (
            <p className="mt-1 text-sm text-primary-500">{product.subtitle}</p>
          )}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-primary-900">
                {range.isRange
                  ? `${formatPrice(range.min)} 起`
                  : formatPrice(range.min)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-primary-400 line-through">
                  {formatPrice(single.price)}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-primary-500">
              {multi ? `${variants.length} 種規格・${temp.delivery}` : temp.delivery}
            </p>
          </div>
          {lowStock && (
            <span className="whitespace-nowrap text-xs font-medium text-clay-500">
              僅剩 {single.stock} 件
            </span>
          )}
        </div>

        {multi ? (
          // 有多種規格時無法直接加入購物車，導到商品頁選規格
          <Link
            href={`/shop/${product.id}`}
            className={`inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition ${
              soldOut
                ? "cursor-not-allowed bg-primary-200 text-primary-500"
                : "bg-accent-500 text-white hover:bg-accent-700"
            }`}
          >
            {soldOut ? "已售完" : "選擇規格"}
          </Link>
        ) : (
          <AddToCartButton
            variantId={pick?.id}
            disabled={soldOut}
            stock={single?.stock}
            className="w-full"
          >
            {soldOut ? "已售完" : "加入購物車"}
          </AddToCartButton>
        )}
      </div>
    </article>
  );
}
