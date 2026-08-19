import Link from "next/link";

import AddToCartButton from "./AddToCartButton";
import {
  formatPrice,
  getTemperature,
  isSoldOut,
  unitPrice,
} from "../_lib/product-utils";

export default function ProductCard({ product }) {
  const temp = getTemperature(product.temperature);
  const price = unitPrice(product);
  const soldOut = isSoldOut(product);
  const hasDiscount = Number(product.discount) > 0;
  const lowStock =
    !soldOut && product.stock !== null && product.stock !== undefined && product.stock <= 5;

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
                {formatPrice(price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-primary-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-primary-500">{temp.delivery}</p>
          </div>
          {lowStock && (
            <span className="whitespace-nowrap text-xs font-medium text-clay-500">
              僅剩 {product.stock} 件
            </span>
          )}
        </div>

        <AddToCartButton
          productId={product.id}
          disabled={soldOut}
          stock={product.stock}
          className="w-full"
        >
          {soldOut ? "已售完" : "加入購物車"}
        </AddToCartButton>
      </div>
    </article>
  );
}
