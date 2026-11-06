"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { formatPrice, getProduct } from "@/data/mockProducts";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductView({ params }) {
  const { id } = use(params);
  const product = getProduct(id);
  const { language, t } = useLanguage();

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col text-[#0D0D0D]">
      <section className="mx-3 mt-3 rounded-[28px] border border-black/80 px-4 py-5 sm:px-6 md:mx-5 md:mt-5 md:px-9 md:py-7">
        <Navbar />
        <div className="mt-8 grid items-start gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="overflow-hidden rounded-2xl border border-black/80 bg-[#F4F4F2]">
            <img
              src={product.image}
              alt={product.name[language]}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="max-w-xl">
            <Link href="/#products" className="text-sm text-black/50">
              {t.product.back} ↗
            </Link>
            <h1 className="mt-4 text-4xl leading-none font-bold tracking-tight md:text-6xl">
              {product.name[language]}
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-black/70">
              {product.description[language]}
            </p>
            <p className="technical mt-6 text-lg">{formatPrice(product.price, language)}</p>
            <p className="technical mt-6 text-[11px] tracking-wide text-black/50">{t.product.sizes}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.sizes.map((size) => (
                <span
                  key={size}
                  className="technical rounded-full border border-black/80 px-2.5 py-1 text-[11px]"
                >
                  {size}
                </span>
              ))}
            </div>
            <p className="technical mt-5 text-[11px] tracking-wide text-black/50">
              {t.product.colors}
            </p>
            <p className="mt-2 text-sm">{product.colors.map((color) => color[language]).join(" · ")}</p>
            <p className="technical mt-5 text-sm">
              {product.stock} {t.product.stock}
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
