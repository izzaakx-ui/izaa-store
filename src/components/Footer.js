"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mx-3 mt-16 mb-4 max-w-full rounded-[28px] border border-black/80 px-4 py-8 sm:px-6 md:mx-5 md:px-10">
      <p className="wordmark text-2xl font-bold tracking-tight break-words sm:text-3xl">
        {t.brand.izaa} {t.brand.store}
      </p>
      <p className="mt-5 max-w-xl text-xl leading-snug font-semibold break-words sm:text-2xl">{t.footer.cod}</p>
      <p className="technical mt-3 max-w-md text-sm leading-6 text-black/60">{t.footer.note}</p>
      <div className="mt-8 grid min-w-0 gap-4 text-sm text-black/55 sm:grid-cols-3">
        <p id="custom">{t.footer.custom}</p>
        <p id="about">{t.footer.about}</p>
        <p id="contact" className="break-all">{t.footer.contact}</p>
      </div>
    </footer>
  );
}
