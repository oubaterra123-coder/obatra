"use client";

import { useEffect } from "react";
import { getStoredLanguage } from "@/lib/i18n/language";

export default function LanguageInitializer() {
  useEffect(() => {
    const language = getStoredLanguage();

    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, []);

  return null;
}
