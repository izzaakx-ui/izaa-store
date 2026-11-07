"use client";

import Link from "next/link";
import { formatPrice } from "@/data/mockProducts";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductCard({ product }) {
  const { language, t } = useLanguage();

  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-black/80 bg-[#F4F4F2] p-4">
      <div className="aspect-[4/5] overflow-hidden rounded-xl bg-black/[0.04]">
        <img
          src={product.image}
          alt={product.name[language]}
          className="h-full w-full object-cover"
        />
      </div>
      <h3 className="mt-4 text-lg leading-tight font-semibold break-words sm:text-xl">{product.name[language]}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-black/60">
        {product.description[language]}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {product.sizes.map((size) => (
          <span
            key={size}
            className="technical rounded-full border border-black/70 px-2 py-0.5 text-[10px] leading-4"
          >
            {size}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <p className="technical text-sm">{formatPrice(product.price, language)}</p>
        <Link
          href={`/product/${product.id}`}
          className="rounded-full border border-black/80 px-3 py-1.5 text-xs whitespace-nowrap transition-colors hover:bg-black hover:text-[#F4F4F2]"
        >
          {t.shop.viewPiece} ↗
        </Link>
      </div>
    </article>
  );
}
