"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getStoredLanguage } from "@/lib/i18n/language";
import { getTranslations, type Language } from "@/lib/i18n/translations";

export default function Header() {
  const router = useRouter();

  const [name, setName] = useState("User");
  const [email, setEmail] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [language, setLanguage] = useState<Language>("fr");

  useEffect(() => {
    setLanguage(getStoredLanguage());

    let mounted = true;

    async function getUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const user = session.user;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (!mounted) return;

      if (!error && profile) {
        setName(profile.name);
      } else {
        setName(user.user_metadata?.name || "User");
      }

      setEmail(user.email || "");
      setCheckingSession(false);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT") {
        router.replace("/login");
      } else if (session?.user) {
        setEmail(session.user.email || "");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    router.replace("/login");
  }

  const t = getTranslations(language);

  if (checkingSession) {
    return (
      <header className="flex items-center justify-center border-b bg-white px-8 py-4">
        <p className="text-sm text-gray-500">{t.loading}</p>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between border-b bg-white px-8 py-4">
      <div>
        <h1 className="text-2xl font-bold">{t.dashboard}</h1>

        <p className="text-sm text-gray-500">
          {language === "fr"
            ? `Bon retour, ${name} 👋`
            : language === "ar"
              ? `مرحباً بعودتك، ${name} 👋`
              : `Welcome back, ${name} 👋`}
        </p>

        <p className="text-xs text-gray-400">
          {email}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/settings/pro")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          {language === "fr"
            ? "Passer à Pro"
            : language === "ar"
              ? "الترقية إلى Pro"
              : "Upgrade"}
        </button>

        <button
          onClick={logout}
          className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
        >
          {t.logout}
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
          {name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
