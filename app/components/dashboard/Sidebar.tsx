"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredLanguage } from "@/lib/i18n/language";
import { getTranslations, type Language } from "@/lib/i18n/translations";

const menuItems = [
  { key: "chat", icon: "🤖", path: "/dashboard/chat" },
  { key: "writer", icon: "✍", path: "/dashboard/writer" },
  { key: "pdf", icon: "📄", path: "/dashboard/pdf" },
  { key: "translator", icon: "🌐", path: "/dashboard/product-description" },
  { key: "summarizer", icon: "📝", path: "/dashboard/summarizer" },
  { key: "study", icon: "🎓", path: "/dashboard/study" },
  { key: "email", icon: "📧", path: "/dashboard/email" },
  { key: "productDescription", icon: "🛍️", path: "/dashboard/product-description" },
  { key: "planner", icon: "🗓️", path: "/dashboard/planner" },
  { key: "settings", icon: "⚙", path: "/dashboard/settings" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const [language, setLanguage] = useState<Language>("fr");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setLanguage(getStoredLanguage());

    const handleLanguageChange = (event: Event) => {
      setLanguage((event as CustomEvent<Language>).detail);
    };

    const handleStorage = () => setLanguage(getStoredLanguage());

    window.addEventListener("obatra-language-change", handleLanguageChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("obatra-language-change", handleLanguageChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const t = getTranslations(language);

  const navigation = (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const active = pathname === item.path ||
          (item.path !== "/dashboard/settings" && pathname.startsWith(item.path + "/"));

        return (
          <Link
            key={item.key}
            href={item.path}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
              active
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{t[item.key]}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-slate-950 px-4 py-3 text-white lg:hidden">
        <Link href="/dashboard" className="text-xl font-bold">Obatra</Link>
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          className="rounded-lg border border-slate-700 px-3 py-2"
        >
          {mobileOpen ? "✕ Close" : "☰ Menu"}
        </button>
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside className="hidden h-screen w-64 shrink-0 flex-col overflow-y-auto bg-slate-950 p-5 text-white lg:sticky lg:top-0 lg:flex">
        <Link href="/dashboard" className="mb-8 px-3 text-2xl font-bold tracking-tight">
          Obatra <span className="text-violet-400">AI</span>
        </Link>
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          {t.workspace}
        </p>
        {navigation}
        <div className="mt-auto border-t border-slate-800 pt-4 text-xs text-slate-500">
          Obatra AI Workspace
        </div>
      </aside>

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-slate-950 p-5 text-white transition-transform lg:hidden ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <Link href="/dashboard" className="mb-8 block px-3 text-2xl font-bold">
          Obatra <span className="text-violet-400">AI</span>
        </Link>
        {navigation}
      </aside>
    </>
  );
}

