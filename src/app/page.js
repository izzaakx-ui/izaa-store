"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import { useStoreData } from "@/context/StoreDataContext";

function Stamp() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-black/80 text-[11px] leading-none">
      ブラ
    </div>
  );
}

export default function Home() {
  const { language, t } = useLanguage();
  const { products, categories, ready, featuredProductId } = useStoreData();
  const [category, setCategory] = useState("all");
  const catalog = products.filter((product) => product.available !== false);
  const featured = products.find((product) => product.id === featuredProductId);
  const visible =
    category === "all" ? catalog : catalog.filter((product) => product.category === category);

  return (
    <div className="flex flex-1 flex-col text-[#0D0D0D]">
      <section className="relative mx-3 mt-3 max-w-full rounded-[28px] border border-black/80 px-4 pt-5 pb-8 sm:px-6 md:mx-5 md:mt-5 md:px-9 md:pt-7 md:pb-8">
        <Navbar />

        <div className="relative mt-6 min-w-0 md:mt-4 md:grid md:grid-cols-[minmax(0,1fr)_minmax(240px,340px)_minmax(0,1fr)] md:items-end md:gap-x-6">
          <div className="flex w-full min-w-0 items-start justify-between gap-2 md:contents">
            <span className="wordmark max-w-[48%] min-w-0 translate-y-2 text-[clamp(2.05rem,11vw,3.4rem)] leading-[0.8] font-extrabold tracking-[-0.05em] whitespace-nowrap md:col-start-1 md:row-start-1 md:max-w-none md:translate-y-7 md:self-center md:justify-self-start md:text-[clamp(4.25rem,8.4vw,8.75rem)] md:leading-[0.78] md:tracking-[-0.06em]">
              {t.brand.izaa}
            </span>
            <span className="wordmark max-w-[48%] min-w-0 translate-y-2 text-end text-[clamp(2.05rem,11vw,3.4rem)] leading-[0.8] font-extrabold tracking-[-0.05em] whitespace-nowrap md:col-start-3 md:row-start-1 md:max-w-none md:translate-y-7 md:self-center md:justify-self-end md:text-[clamp(4.25rem,8.4vw,8.75rem)] md:leading-[0.78] md:tracking-[-0.06em]">
              {t.brand.store}
            </span>
          </div>

          <img
            src="/hero-model.jpg"
            alt={t.hero.modelAlt}
            className="pointer-events-none relative z-10 mx-auto -mt-2 h-auto w-[min(78%,340px)] max-w-full mix-blend-darken md:col-start-2 md:row-span-2 md:row-start-1 md:-mb-24 md:h-[740px] md:w-[340px] md:justify-self-center md:object-cover md:object-[68%_center]"
          />

          <div className="relative z-20 mt-8 max-w-full md:col-start-1 md:row-start-2 md:mt-16 md:max-w-xs">
            <Stamp />
            <h1 className="mt-4 text-[clamp(1.45rem,6.2vw,1.7rem)] leading-[1.05] font-bold tracking-tight break-words sm:text-4xl">
              {t.hero.headline}
            </h1>
            <p className="technical mt-4 text-[13px] leading-5 text-[#0D0D0D]">
              {t.hero.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>

          <div className="relative z-20 mt-8 w-full max-w-[240px] md:col-start-3 md:row-start-2 md:mt-16 md:justify-self-end md:pb-5">
            <div className="rounded-2xl border border-black/80 bg-[#F4F4F2] p-3">
              <img
                src={featured?.image || "/puffer-2026.jpg"}
                alt={featured?.name?.[language] || t.hero.jacketAlt}
                className="aspect-square w-full object-contain"
              />
              <p className="technical mt-2 text-center text-xs tracking-[0.18em]">{t.hero.year}</p>
            </div>
            <a
              href={featured ? `/product/${featured.id}` : "#products"}
              className="mx-auto mt-3 block w-fit max-w-full rounded-full border border-black/80 bg-[#F4F4F2] px-3 py-1.5 text-center text-[11px] md:absolute md:-bottom-1 md:left-1/2 md:mx-0 md:mt-0 md:-translate-x-1/2 md:px-4 md:text-xs md:whitespace-nowrap"
            >
              {t.hero.newCollection} ↗
            </a>
          </div>
        </div>
      </section>

      <section id="products" className="scroll-mt-8 max-w-full px-4 pt-16 md:px-10 md:pt-32">
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((item) => {
            const active = category === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(item.id)}
                className={`cursor-pointer rounded-full border border-black px-4 py-1.5 text-sm transition-colors ${
                  active ? "bg-[#0D0D0D] text-[#F4F4F2]" : "bg-transparent text-[#0D0D0D]"
                }`}
              >
                {item.label[language]}
              </button>
            );
          })}
        </div>

        {!ready && visible.length === 0 ? null : visible.length === 0 ? (
          <p className="text-sm text-black/60">{t.shop.empty}</p>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
