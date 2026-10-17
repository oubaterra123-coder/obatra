"use client";

import { useEffect, useState } from "react";
import { createConversation } from "@/lib/conversations";
import { CONTENT_TYPES } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { getStoredLanguage } from "@/lib/i18n/language";
import { getTranslations, type Language } from "@/lib/i18n/translations";

const CONTENT_TYPE_LABELS: Record<Language, Record<string, string>> = {
  fr: {
    "SEO Article": "Article SEO",
    "Blog Post": "Article de blog",
    "Product Description": "Description de produit",
    "Facebook Ad": "Publicité Facebook",
    "Instagram Caption": "Légende Instagram",
    "YouTube Script": "Script YouTube",
    "Email": "E-mail",
  },
  en: {
    "SEO Article": "SEO Article",
    "Blog Post": "Blog Post",
    "Product Description": "Product Description",
    "Facebook Ad": "Facebook Ad",
    "Instagram Caption": "Instagram Caption",
    "YouTube Script": "YouTube Script",
    "Email": "Email",
  },
  ar: {
    "SEO Article": "مقال متوافق مع SEO",
    "Blog Post": "مقالة مدونة",
    "Product Description": "وصف المنتج",
    "Facebook Ad": "إعلان فيسبوك",
    "Instagram Caption": "وصف منشور إنستغرام",
    "YouTube Script": "نص فيديو يوتيوب",
    "Email": "بريد إلكتروني",
  },
  es: {
    "SEO Article": "Artículo SEO",
    "Blog Post": "Entrada de blog",
    "Product Description": "Descripción del producto",
    "Facebook Ad": "Anuncio de Facebook",
    "Instagram Caption": "Texto para Instagram",
    "YouTube Script": "Guion de YouTube",
    "Email": "Correo electrónico",
  },
  de: {
    "SEO Article": "SEO-Artikel",
    "Blog Post": "Blogbeitrag",
    "Product Description": "Produktbeschreibung",
    "Facebook Ad": "Facebook-Anzeige",
    "Instagram Caption": "Instagram-Bildunterschrift",
    "YouTube Script": "YouTube-Skript",
    "Email": "E-Mail",
  },
  it: {
    "SEO Article": "Articolo SEO",
    "Blog Post": "Articolo del blog",
    "Product Description": "Descrizione del prodotto",
    "Facebook Ad": "Annuncio Facebook",
    "Instagram Caption": "Didascalia Instagram",
    "YouTube Script": "Script YouTube",
    "Email": "E-mail",
  },
};
export default function WriterPage() {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState(CONTENT_TYPES[0]);
  const [article, setArticle] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState<Language>("fr");
  const t = getTranslations(language);

  useEffect(() => {
    setLanguage(getStoredLanguage());
    const handleLanguageChange = (event: Event) => {
      setLanguage((event as CustomEvent<Language>).detail);
    };
    window.addEventListener("obatra-language-change", handleLanguageChange);

    async function initConversation() {
      try {
        const conversation = await createConversation();

        if (conversation?.id) {
          console.log("WRITER CONVERSATION:", conversation.id);
          setConversationId(conversation.id);
        }
      } catch (error) {
        console.error("WRITER CONVERSATION ERROR:", error);
      }
    }

    initConversation();

    return () => {
      window.removeEventListener("obatra-language-change", handleLanguageChange);
      window.speechSynthesis.cancel();
    };
  }, []);

  async function generateArticle() {
    if (!topic.trim()) {
      alert("Please enter a topic.");
      return;
    }

    if (!conversationId) {
      alert("Conversation is not ready yet. Please wait a moment.");
      return;
    }

    setLoading(true);
    setArticle("");
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Please log in again.");
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: `WRITE::${type}::${topic}`,
          conversationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      setArticle(data.reply || data.answer || "No content generated.");
    } catch (error) {
      console.error("WRITER ERROR:", error);

      setArticle(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Something went wrong while generating content."
      );
    } finally {
      setLoading(false);
    }
  }

  function readAloud() {
    if (!article.trim()) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const speak = () => {
      const text = article.trim();
      const voices = window.speechSynthesis.getVoices();
      const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
      const hasFrench = /[àâçéèêëîïôûùüÿœ]/i.test(text);

      let language = "en";
      if (hasArabic) language = "ar";
      else if (hasFrench) language = "fr";

      const voice =
        voices.find((v) => v.lang.toLowerCase() === language) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(language + "-")) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(language));

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice?.lang || language;
      if (voice) utterance.voice = voice;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    };

    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();

    if (voices.length > 0) {
      speak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        speak();
      };
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-500 p-6 text-white shadow-xl sm:p-9">
          <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wider">
              ✦ OBATRA AI WORKSPACE
            </span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              {t.writerTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-50 sm:text-base">
              {t.writerDescription}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-2 text-xs">✍️ AI Writing</span>
              <span className="rounded-full bg-white/10 px-3 py-2 text-xs">🔊 Read aloud</span>
              <span className="rounded-full bg-white/10 px-3 py-2 text-xs">🌍 Multilingual</span>
            </div>
          </div>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
          <section className="min-w-0 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50 sm:p-7">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">✍️</div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{t.topic}</h2>
                  <p className="mt-1 text-sm text-slate-500">Describe the content you want to create.</p>
                </div>
              </div>

              <label htmlFor="writer-topic" className="mb-2 block text-sm font-semibold text-slate-700">
                {t.topic}
              </label>
              <textarea
                id="writer-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t.topicPlaceholder}
                className="min-h-48 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 sm:min-h-56 sm:p-5"
              />
              <div className="mt-2 text-right text-xs text-slate-400">
                {topic.length} characters
              </div>

              <button
                onClick={generateArticle}
                disabled={loading || !conversationId || !topic.trim()}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:from-emerald-700 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    {t.generating}
                  </>
                ) : (
                  <>✨ {t.generateContent}</>
                )}
              </button>

              {!conversationId && (
                <p className="mt-3 text-sm text-slate-500">{t.preparingWriter}</p>
              )}
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-white to-emerald-50 p-5 sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-xl">📄</div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{t.generatedContent}</h2>
                    <p className="mt-1 text-sm text-slate-500">Your result will appear here.</p>
                  </div>
                </div>
                {article && !loading && (
                  <button
                    type="button"
                    onClick={readAloud}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    {isSpeaking ? `⏹ ${t.stopReading}` : `🔊 ${t.readAloud}`}
                  </button>
                )}
              </div>

              <div className="min-h-72 p-5 sm:p-7">
                {loading ? (
                  <div className="flex min-h-56 flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
                    <p className="mt-4 font-semibold text-slate-700">{t.generatingContent}</p>
                  </div>
                ) : article ? (
                  <div className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-700 sm:text-base">
                    {article}
                  </div>
                ) : (
                  <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">✨</div>
                    <p className="mt-4 font-semibold text-slate-700">{t.contentWillAppear}</p>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">Choose a format, describe your idea, and generate your content.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-slate-800 bg-slate-950 p-5 text-white shadow-xl sm:p-6 lg:sticky lg:top-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">🎭</div>
              <div>
                <h2 className="text-lg font-bold">{t.contentType}</h2>
                <p className="mt-1 text-xs text-slate-400">Choose your format</p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {CONTENT_TYPES.map((contentType) => {
                const label = CONTENT_TYPE_LABELS[language][contentType] ?? contentType;
                const selected = type === contentType;

                return (
                  <button
                    key={contentType}
                    type="button"
                    onClick={() => setType(contentType)}
                    aria-pressed={selected}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${
                      selected
                        ? "border-emerald-400 bg-emerald-500/15 text-white ring-1 ring-emerald-400/30"
                        : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                    }`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${selected ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-300"}`}>
                      {selected ? "✓" : "✦"}
                    </span>
                    <span className="flex-1">{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Selected format</p>
              <p className="mt-2 font-bold text-white">{CONTENT_TYPE_LABELS[language][type] ?? type}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">The selected format guides your generated content.</p>
            </div>
          </aside>
        </div>

        <footer className="py-7 text-center text-xs tracking-wide text-slate-400">
          OBATRA AI WORKSPACE
        </footer>
      </div>
    </main>
  );
}







