"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import ar from "@/dictionaries/ar.json";
import fr from "@/dictionaries/fr.json";

const dictionaries = { fr, ar };
const STORAGE_KEY = "language";

const LanguageContext = createContext(null);

function isLanguage(value) {
  return value === "fr" || value === "ar";
}

function applyLanguage(language) {
  const root = document.documentElement;
  root.lang = language;
  root.dir = language === "ar" ? "rtl" : "ltr";
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("fr");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const next = isLanguage(stored) ? stored : "fr";
    setLanguage(next);
    applyLanguage(next);
    if (!isLanguage(stored)) {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((current) => {
      const next = current === "fr" ? "ar" : "fr";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      language,
      t: dictionaries[language],
      toggleLanguage,
    }),
    [language, toggleLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
