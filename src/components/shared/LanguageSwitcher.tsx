"use client";

import { useLanguage } from "@/i18n";
import { motion } from "framer-motion";

export function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent"
      aria-label="Toggle language"
    >
      <motion.span
        key={language}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        className="uppercase font-semibold text-xs tracking-wider"
      >
        {language === "en" ? "EN" : "TR"}
      </motion.span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
        <path d="m2 5 6 6 6-6" transform="translate(2, 6)" />
      </svg>
    </button>
  );
}
