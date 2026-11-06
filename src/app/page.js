"use client";

import { useLanguage } from "@/context/LanguageContext";

const navKeys = ["home", "shop", "categories", "cart", "admin"];

export default function Home() {
  const { t, toggleLanguage } = useLanguage();

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <section className="w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-8 text-start shadow-sm transition-all duration-300 ease-out sm:p-10 dark:border-white/10 dark:bg-zinc-950">
        <header className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-zinc-500">{t.storeName}</p>
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium transition-colors duration-300 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            {t.languageSwitcher}
          </button>
        </header>

        <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-600 dark:text-zinc-300">
          {navKeys.map((key) => (
            <span key={key}>{t.nav[key]}</span>
          ))}
        </nav>

        <div className="mt-10 border-s-4 border-foreground ps-5 transition-all duration-300">
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            {t.hero.title}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {t.hero.subtitle}
          </p>
        </div>

        <button
          type="button"
          className="mt-8 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors duration-300"
        >
          {t.hero.shopNow}
        </button>
      </section>
    </main>
  );
}
