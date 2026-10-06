"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getStoredLanguage } from "@/lib/i18n/language";
import { useEffect, useState } from "react";
import type { Language } from "@/lib/i18n/translations";

export default function MobileBackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [language, setLanguage] = useState<Language>("fr");

  useEffect(() => {
    setLanguage(getStoredLanguage());
  }, []);

  if (pathname === "/dashboard") return null;

  const label =
    language === "fr"
      ? "Retour"
      : language === "ar"
        ? "رجوع"
        : "Go back";

  return (
    <button
      onClick={() => router.back()}
      className="lg:hidden fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md border border-gray-200"
      aria-label={label}
    >
      <ArrowLeft size={20} />
    </button>
  );
}
