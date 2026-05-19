"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Language, Translations } from "@/types";
import { en } from "./en";
import { tr } from "./tr";

const translations: Record<Language, Translations> = { en, tr };

interface LanguageContextType {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  t: en,
  setLanguage: () => {},
  toggleLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("hubby-language") as Language;
    if (saved && (saved === "en" || saved === "tr")) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("hubby-language", lang);
    document.documentElement.lang = lang;
  }, []);

  const toggleLanguage = useCallback(() => {
    const next = language === "en" ? "tr" : "en";
    setLanguage(next);
  }, [language, setLanguage]);

  if (!mounted) {
    return React.createElement(
      LanguageContext.Provider,
      { value: { language: "en", t: en, setLanguage, toggleLanguage } },
      children
    );
  }

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, t: translations[language], setLanguage, toggleLanguage } },
    children
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  return context;
}

export function useLanguage() {
  const { language, setLanguage, toggleLanguage } = useContext(LanguageContext);
  return { language, setLanguage, toggleLanguage };
}
