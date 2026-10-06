"use client";

import { useEffect } from "react";
import { getStoredLanguage } from "@/lib/i18n/language";

export default function LanguageInitializer() {
  useEffect(() => {
    const applyLanguage = () => {
      const language = getStoredLanguage();

      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

      window.dispatchEvent(
        new CustomEvent("obatra-language-change", {
          detail: language,
        })
      );
    };

    applyLanguage();

    window.addEventListener("storage", applyLanguage);

    return () => {
      window.removeEventListener("storage", applyLanguage);
    };
  }, []);

  return null;
}
