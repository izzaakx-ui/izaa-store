"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/data/mockProducts";

export default function CartDrawer() {
  const { language, t } = useLanguage();
  const {
    items,
    removeFromCart,
    updateQuantity,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  useEffect(() => {
    if (!isCartOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setIsCartOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCartOpen, setIsCartOpen]);

  return (
    <div
      inert={isCartOpen ? undefined : true}
      aria-hidden={!isCartOpen}
      className={isCartOpen ? "fixed inset-0 z-50" : "pointer-events-none fixed inset-0 z-50"}
    >
      <button
        type="button"
        aria-label={t.cartDrawer.close}
        onClick={() => setIsCartOpen(false)}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t.cartDrawer.title}
        className={`absolute inset-y-0 end-0 flex w-full max-w-md flex-col border-s border-black/80 bg-[#F4F4F2] text-[#0D0D0D] transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-black/80 px-5 py-4">
          <h2 className="text-lg font-semibold">{t.cartDrawer.title}</h2>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label={t.cartDrawer.close}
            className="cursor-pointer"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <p className="technical text-sm text-black/60">{t.cartDrawer.empty}</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => {
                const key = `${item.product.id}-${item.selectedSize}-${item.selectedColor.fr}`;
                return (
                  <li key={key} className="flex gap-3 border-b border-black/15 pb-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name[language]}
                      className="h-24 w-20 rounded-xl border border-black/80 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold leading-tight">{item.product.name[language]}</p>
                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(item.product.id, item.selectedSize, item.selectedColor)
                          }
                          className="technical cursor-pointer text-[11px] text-black/50"
                        >
                          {t.cartDrawer.remove}
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="technical rounded-full border border-black/70 px-2 py-0.5 text-[10px]">
                          {item.selectedSize}
                        </span>
                        <span className="technical rounded-full border border-black/70 px-2 py-0.5 text-[10px]">
                          {item.selectedColor[language]}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-black/80">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.selectedSize,
                                item.selectedColor,
                                item.quantity - 1,
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="cursor-pointer px-2.5 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={t.cartDrawer.decrease}
                          >
                            -
                          </button>
                          <span className="technical min-w-5 text-center text-xs">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.selectedSize,
                                item.selectedColor,
                                item.quantity + 1,
                              )
                            }
                            disabled={item.quantity >= item.product.stock}
                            className="cursor-pointer px-2.5 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={t.cartDrawer.increase}
                          >
                            +
                          </button>
                        </div>
                        <p className="technical text-sm">
                          {formatPrice(item.product.price * item.quantity, language)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="border-t border-black/80 px-5 py-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="technical text-[11px] tracking-wide text-black/50">{t.cartDrawer.subtotal}</p>
            <p className="technical text-sm">{formatPrice(cartTotal, language)}</p>
          </div>
          <Link
            href="/checkout"
            aria-disabled={items.length === 0}
            onClick={(event) => {
              if (items.length === 0) {
                event.preventDefault();
                return;
              }
              setIsCartOpen(false);
            }}
            className={`block rounded-full border border-black/80 px-4 py-3 text-center text-sm ${
              items.length === 0
                ? "pointer-events-none opacity-40"
                : "bg-[#0D0D0D] text-[#F4F4F2]"
            }`}
          >
            {t.cartDrawer.checkout} ↗
          </Link>
        </footer>
      </aside>
    </div>
  );
}
