import type { Language } from "./translations";

export const LANGUAGE_STORAGE_KEY = "obatra-language";

export function isLanguage(value: string | null): value is Language {
  return value === "fr" || value === "en" || value === "ar" || value === "es" || value === "de" || value === "it";
}

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "fr";

  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);

  return isLanguage(saved) ? saved : "fr";
}

