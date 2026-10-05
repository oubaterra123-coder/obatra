"use client";

import { useEffect, useState } from "react";
import { getStoredLanguage, LANGUAGE_STORAGE_KEY } from "@/lib/i18n/language";
import type { Language } from "@/lib/i18n/translations";
import { getTranslations } from "@/lib/i18n/translations";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState<Language>("fr");

  useEffect(() => {
    setLanguage(getStoredLanguage());
  }, []);

  function changeLanguage(value: Language) {
    setLanguage(value);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, value);

    document.documentElement.lang = value;
    document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
  }

  const t = getTranslations(language);

  async function handleLogout() {
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      window.location.href = "/";
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
      setMessage(t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {t.settings} ⚙️
          </h1>

          <p className="mt-2 text-gray-500">
            {language === "fr"
              ? "Gérez votre compte Obatra et vos préférences."
              : language === "en"
                ? "Manage your Obatra account and preferences."
                : "قم بإدارة حساب Obatra والإعدادات الخاصة بك."}
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              {language === "fr" ? "Langue" : language === "en" ? "Language" : "اللغة"}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {language === "fr"
                ? "Choisissez la langue de votre interface Obatra."
                : language === "en"
                  ? "Choose the language of your Obatra interface."
                  : "اختر لغة واجهة Obatra."}
            </p>

            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value as Language)}
              className="mt-5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 sm:max-w-xs"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              {language === "fr" ? "Compte" : language === "en" ? "Account" : "الحساب"}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {language === "fr"
                ? "Gérez les paramètres de votre compte."
                : language === "en"
                  ? "Manage your account settings."
                  : "قم بإدارة إعدادات حسابك."}
            </p>

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700">
                Obatra Account
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {language === "fr"
                  ? "Votre compte est protégé par Supabase Authentication."
                  : language === "en"
                    ? "Your account is protected by Supabase Authentication."
                    : "حسابك محمي بواسطة نظام المصادقة Supabase."}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              {language === "fr"
                ? "Préférences IA 🤖"
                : language === "en"
                  ? "AI Preferences 🤖"
                  : "إعدادات الذكاء الاصطناعي 🤖"}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {language === "fr"
                ? "Vos outils IA sont alimentés par Obatra AI."
                : language === "en"
                  ? "Your AI tools are powered by Obatra AI."
                  : "أدوات الذكاء الاصطناعي الخاصة بك تعمل بواسطة Obatra AI."}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                [t.chat, language === "fr" ? "Discutez avec votre assistant IA." : language === "en" ? "Chat with your AI assistant." : "تحدث مع مساعدك الذكي."],
                [t.pdf, language === "fr" ? "Analysez des PDF et posez des questions." : language === "en" ? "Analyze PDFs and ask questions." : "حلل ملفات PDF واطرح الأسئلة."],
                [t.writer, language === "fr" ? "Créez du contenu avec l'IA." : language === "en" ? "Create content with AI." : "أنشئ المحتوى باستخدام الذكاء الاصطناعي."],
                [t.images, language === "fr" ? "Générez des images avec l'IA." : language === "en" ? "Generate images with AI." : "أنشئ الصور باستخدام الذكاء الاصطناعي."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-xl border p-4">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              {language === "fr"
                ? "Actions du compte"
                : language === "en"
                  ? "Account Actions"
                  : "إجراءات الحساب"}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {language === "fr"
                ? "Déconnectez-vous de votre compte Obatra."
                : language === "en"
                  ? "Sign out from your Obatra account."
                  : "تسجيل الخروج من حساب Obatra."}
            </p>

            {message && (
              <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                {message}
              </div>
            )}

            <button
              onClick={handleLogout}
              disabled={loading}
              className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading
                ? t.loading
                : t.logout}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
