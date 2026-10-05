"use client";

import Link from "next/link";
import { getStoredLanguage } from "@/lib/i18n/language";
import { getTranslations, type Language } from "@/lib/i18n/translations";
import { useEffect, useState } from "react";

const menuItems = [
  {
    key: "chat",
    icon: "🤖",
    path: "/dashboard/chat",
  },
  {
    key: "writer",
    icon: "✍️",
    path: "/dashboard/writer",
  },
  {
    key: "images",
    icon: "🖼️",
    path: "/dashboard/images",
  },
  {
    key: "pdf",
    icon: "📄",
    path: "/dashboard/pdf",
  },
  {
    key: "settings",
    icon: "⚙️",
    path: "/dashboard/settings",
  },
] as const;

export default function Sidebar() {
  const [language, setLanguage] = useState<Language>("fr");

  useEffect(() => {
    setLanguage(getStoredLanguage());

    const handleStorage = () => {
      setLanguage(getStoredLanguage());
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const t = getTranslations(language);

  return (
    <aside className="h-screen w-64 bg-black p-6 text-white">
      <h1 className="mb-10 text-3xl font-bold">
        Obatra
      </h1>

      <nav className="space-y-3">
        {menuItems.map((item) => (
          <Link
            key={item.key}
            href={item.path}
            className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-800"
          >
            <span>{item.icon}</span>
            {t[item.key]}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
