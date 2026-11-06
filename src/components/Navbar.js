"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const links = [
  { key: "main", href: "/" },
  { key: "shop", href: "/#products" },
  { key: "custom", href: "/#custom" },
  { key: "about", href: "/#about" },
  { key: "contact", href: "/#contact" },
];

function StarCluster() {
  const stars = [
    { x: 5, y: 4 },
    { x: 15, y: 5 },
    { x: 4, y: 14 },
    { x: 14, y: 15 },
  ];

  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" className="shrink-0">
      {stars.map((star) => (
        <path
          key={`${star.x}-${star.y}`}
          fill="currentColor"
          d={`M${star.x} ${star.y} l1.1 2.6 2.6 1.1-2.6 1.1-1.1 2.6-1.1-2.6-2.6-1.1 2.6-1.1z`}
        />
      ))}
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { t, toggleLanguage } = useLanguage();
  const onProduct = pathname.startsWith("/product");

  return (
    <header className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-4">
      <Link href="/" className="flex items-center gap-2 text-[#0D0D0D]">
        <span className="wordmark flex flex-col text-[15px] leading-[0.95] font-bold tracking-tight">
          <span>{t.brand.aura}</span>
          <span>{t.brand.store}</span>
        </span>
        <StarCluster />
      </Link>

      <nav className="order-3 flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm md:order-none md:absolute md:top-1/2 md:left-1/2 md:w-auto md:-translate-x-1/2 md:-translate-y-1/2">
        {links.map((link) => {
          const active = link.key === "shop" ? onProduct : link.key === "main" && !onProduct;
          return (
            <Link
              key={link.key}
              href={link.href}
              className={
                active
                  ? "font-semibold text-[#0D0D0D]"
                  : "text-black/40 transition-colors hover:text-black/70"
              }
            >
              {t.nav[link.key]}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 sm:gap-4">
        <p className="technical hidden text-[11px] tracking-wide text-[#0D0D0D] sm:block">
          {t.accountId} - {t.accountCode}
        </p>
        <button
          type="button"
          onClick={toggleLanguage}
          className="technical cursor-pointer rounded-full border border-black/80 px-2.5 py-1 text-[11px] leading-none"
        >
          {t.languageSwitcher}
        </button>
        <button type="button" className="relative cursor-pointer text-[#0D0D0D]" aria-label={t.cart}>
          <ShoppingBag size={18} strokeWidth={1.6} />
          <span className="absolute -top-2 -end-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0D0D0D] px-1 text-[9px] leading-none text-[#F4F4F2]">
            0
          </span>
        </button>
      </div>
    </header>
  );
}
