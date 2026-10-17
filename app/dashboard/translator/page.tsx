"use client";

import { useEffect, useState } from "react";
import { createConversation } from "@/lib/conversations";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "@/lib/i18n/useTranslations";

const LANGUAGES = [
  "English",
  "French",
  "Arabic",
  "Spanish",
  "German",
  "Italian",
  "Portuguese",
];

export default function TranslatorPage() {
  const t = useTranslations();
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("French");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    async function initConversation() {
      try {
        const conversation = await createConversation();

        if (conversation?.id) {
          console.log("TRANSLATOR CONVERSATION:", conversation.id);
          setConversationId(conversation.id);
        }
      } catch (error) {
        console.error("CONVERSATION ERROR:", error);
      }
    }

    initConversation();
  }, []);

  async function translate() {
    if (!text.trim()) {
      alert("Please enter some text.");
      return;
    }

    if (!conversationId) {
      alert("Conversation is not ready yet. Please wait a moment.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: `TRANSLATE::${language}::${text}`,
          conversationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Translation failed.");
      }

      setResult(
        data.reply ||
          data.answer ||
          "No translation returned."
      );
    } catch (error) {
      console.error("TRANSLATOR ERROR:", error);

      setResult(
        error instanceof Error
          ? error.message
          : "Translation failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-900 p-6 text-white shadow-xl sm:p-9">
          <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-3xl">
              🌍
            </div>
            <div className="min-w-0">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
                OBATRA AI WORKSPACE
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
                {t.translatorTitle}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                {t.translatorDescription}
              </p>
            </div>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-2 text-xs font-medium sm:text-sm">
            <span className="rounded-full bg-white/15 px-3 py-2">🌐 Multiple languages</span>
            <span className="rounded-full bg-white/15 px-3 py-2">✨ AI translation</span>
            <span className="rounded-full bg-white/15 px-3 py-2">📋 Easy to copy</span>
          </div>
        </header>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
          <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                📝
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t.text}</h2>
                <p className="mt-1 text-sm text-slate-500">Enter the text you want to translate.</p>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.textPlaceholder}
              className="min-h-64 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />

            <div className="mt-2 flex justify-end text-xs text-slate-400">
              {text.length} characters
            </div>

            <div className="mt-6">
              <label className="mb-3 block text-sm font-bold text-slate-800">
                {t.translateTo}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={translate}
              disabled={loading || !conversationId || !text.trim()}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-3 font-bold text-white shadow-lg shadow-blue-700/15 transition hover:from-blue-800 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  {t.translating}
                </>
              ) : (
                <>🌐 {t.translate}</>
              )}
            </button>

            {!conversationId && (
              <p className="mt-3 text-center text-sm text-slate-500">
                {t.preparingTranslator}
              </p>
            )}
          </section>

          <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xl">
                📋
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900">{t.translation}</h2>
                <p className="mt-1 text-sm text-slate-500">Your translated text will appear here.</p>
              </div>
              {result && !loading && (
                <span className="ms-auto shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Ready
                </span>
              )}
            </div>

            <div className="p-5 sm:p-6">
              {loading ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl bg-blue-50/70 px-5 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    🌐
                  </span>
                  <p className="mt-4 font-semibold text-slate-800">{t.translating}</p>
                  <div className="mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-blue-100">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-600" />
                  </div>
                </div>
              ) : result ? (
                <div className="min-h-72 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                  <div className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-700">
                    {result}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(result).catch(() => {
                        alert("Unable to copy automatically. Please select and copy the translation.");
                      });
                    }}
                    className="mt-5 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
                  >
                    📋 Copy translation
                  </button>
                </div>
              ) : (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-5 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                    🌍
                  </span>
                  <p className="mt-4 font-semibold text-slate-700">{t.translationWillAppear}</p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                    Enter your text, choose a language, and translate.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="py-7 text-center text-xs tracking-wide text-slate-400">
          OBATRA AI WORKSPACE
        </footer>
      </div>
    </main>
  );
}





