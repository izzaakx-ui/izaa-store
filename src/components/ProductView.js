"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/data/mockProducts";
import { useStoreData } from "@/context/StoreDataContext";

const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

const SWATCHES = {
  Noir: "#0D0D0D",
  Charbon: "#3a3a3a",
  "Noir lavé": "#6b6b6b",
  Encre: "#1c2433",
  "Noir / rose": "linear-gradient(135deg, #0D0D0D 52%, #d46a86 52%)",
};

function swatchStyle(color) {
  if (color.hex) return { backgroundColor: color.hex };
  const value = SWATCHES[color.fr] || "#0D0D0D";
  return value.startsWith("linear") ? { backgroundImage: value } : { backgroundColor: value };
}

export default function ProductView({ params }) {
  const { id } = use(params);
  const { getProduct, ready } = useStoreData();
  const product = getProduct(id);
  const { language, t } = useLanguage();
  const { addToCart, setIsCartOpen } = useCart();
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] ?? "M");
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!product) return;
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.colors[0]);
    setQuantity(1);
    setActiveImage(0);
  }, [product]);

  if (!ready || (product && !selectedColor)) {
    return <div className="min-h-screen bg-[#F4F4F2]" />;
  }

  if (!product || product.available === false) {
    notFound();
  }

  const images = product.images?.length ? product.images : [product.image];
  const discounted = product.compareAt && product.compareAt > product.price;
  const stockLabel = product.stock
    ? t.product.inStock.replace("{count}", String(product.stock))
    : t.product.soldOut;

  function handleAdd() {
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsCartOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col text-[#0D0D0D]">
      <section className="mx-3 mt-3 rounded-[28px] border border-black/80 px-4 py-5 sm:px-6 md:mx-5 md:mt-5 md:px-9 md:py-7">
        <Navbar />
        <Link href="/#products" className="mt-8 inline-flex items-center gap-2 text-sm text-black/55">
          <span aria-hidden className="rtl:rotate-180">
            ←
          </span>
          {t.product.back}
        </Link>

        <div className="mt-6 grid items-start gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <div className="overflow-hidden rounded-2xl border border-black/80 bg-[#F4F4F2]">
              <img
                src={images[activeImage]}
                alt={product.name[language]}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="mt-3 flex gap-2">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-pressed={activeImage === index}
                  className={`h-16 w-14 overflow-hidden rounded-xl border bg-[#F4F4F2] ${
                    activeImage === index ? "border-black" : "border-black/30"
                  }`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-xl">
            <p className="technical text-[11px] tracking-[0.16em] text-black/50">
              {t.product.code} {product.code}
            </p>
            <h1 className="mt-3 text-4xl leading-none font-bold tracking-tight md:text-6xl">
              {product.name[language]}
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-black/70">
              {product.description[language]}
            </p>
            <div className="mt-6 flex items-baseline gap-3">
              <p className="technical text-lg">{formatPrice(product.price, language)}</p>
              {discounted ? (
                <p className="technical text-sm text-black/40 line-through">
                  {formatPrice(product.compareAt, language)}
                </p>
              ) : null}
            </div>
            <p className="technical mt-3 text-xs text-black/70">{stockLabel}</p>

            <p className="technical mt-8 text-[11px] tracking-wide text-black/50">{t.product.colors}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.colors.map((color) => {
                const active = color.fr === selectedColor.fr;
                return (
                  <button
                    key={color.fr}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedColor(color)}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-2 py-1 text-xs ${
                      active ? "border-black" : "border-black/30"
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-black/30"
                      style={swatchStyle(color)}
                    />
                    {color[language]}
                  </button>
                );
              })}
            </div>

            <p className="technical mt-6 text-[11px] tracking-wide text-black/50">{t.product.sizes}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ALL_SIZES.map((size) => {
                const available = product.sizes.includes(size);
                const active = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!available}
                    aria-pressed={active}
                    onClick={() => setSelectedSize(size)}
                    className={`technical cursor-pointer rounded-full border px-3 py-1 text-[11px] disabled:cursor-not-allowed disabled:opacity-30 ${
                      active ? "border-black bg-[#0D0D0D] text-[#F4F4F2]" : "border-black/80"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <p className="technical mt-6 text-[11px] tracking-wide text-black/50">{t.product.quantity}</p>
            <div className="mt-2 inline-flex items-center rounded-full border border-black/80">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                disabled={quantity <= 1}
                className="cursor-pointer px-3 py-1.5 disabled:opacity-30"
                aria-label={t.cartDrawer.decrease}
              >
                -
              </button>
              <span className="technical min-w-6 text-center text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}
                disabled={quantity >= product.stock}
                className="cursor-pointer px-3 py-1.5 disabled:opacity-30"
                aria-label={t.cartDrawer.increase}
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={!product.stock}
              className="mt-8 cursor-pointer rounded-full bg-[#0D0D0D] px-5 py-3 text-sm text-[#F4F4F2] disabled:opacity-40"
            >
              {t.product.addToBag} ↗
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
