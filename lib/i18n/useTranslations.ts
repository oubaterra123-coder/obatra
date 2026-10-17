"use client";

import { useEffect, useState } from "react";
import { getStoredLanguage } from "./language";
import { getTranslations, type Language } from "./translations";

export function useTranslations() {
const [language, setLanguage] = useState<Language>("fr");

useEffect(() => {
const handleLanguageChange = (event: Event) => {
const nextLanguage = (event as CustomEvent<Language>).detail;
setLanguage(nextLanguage);
};
setLanguage(getStoredLanguage());
window.addEventListener("obatra-language-change", handleLanguageChange);

return () => {
  window.removeEventListener("obatra-language-change", handleLanguageChange);
};
}, []);

return getTranslations(language);
}

