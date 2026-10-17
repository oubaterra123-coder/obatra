"use client";

import { useEffect, useState } from "react";
import { createConversation } from "@/lib/conversations";
import { supabase } from "@/lib/supabase";
import { getStoredLanguage } from "@/lib/i18n/language";
import { getTranslations, type Language } from "@/lib/i18n/translations";

const EMAIL_TYPES = [
  { value: "Professional Email", labels: { en: "Professional Email", fr: "E-mail professionnel", ar: "بريد إلكتروني احترافي", es: "Correo profesional", de: "Professionelle E-Mail", it: "E-mail professionale" } },
  { value: "Job Application", labels: { en: "Job Application", fr: "Candidature à un emploi", ar: "طلب توظيف", es: "Solicitud de empleo", de: "Bewerbung", it: "Candidatura di lavoro" } },
  { value: "Business Inquiry", labels: { en: "Business Inquiry", fr: "Demande commerciale", ar: "استفسار تجاري", es: "Consulta comercial", de: "Geschäftsanfrage", it: "Richiesta commerciale" } },
  { value: "Customer Support", labels: { en: "Customer Support", fr: "Service client", ar: "دعم العملاء", es: "Atención al cliente", de: "Kundendienst", it: "Assistenza clienti" } },
  { value: "Follow-up Email", labels: { en: "Follow-up Email", fr: "E-mail de relance", ar: "رسالة متابعة", es: "Correo de seguimiento", de: "Nachfass-E-Mail", it: "E-mail di follow-up" } },
  { value: "Thank You Email", labels: { en: "Thank You Email", fr: "E-mail de remerciement", ar: "رسالة شكر", es: "Correo de agradecimiento", de: "Dankes-E-Mail", it: "E-mail di ringraziamento" } },
  { value: "Meeting Request", labels: { en: "Meeting Request", fr: "Demande de réunion", ar: "طلب اجتماع", es: "Solicitud de reunión", de: "Besprechungsanfrage", it: "Richiesta di riunione" } },
];

export default function EmailAssistantPage() {
  const [language, setLanguage] = useState<Language>("fr");
  const t = getTranslations(language);
  const [type, setType] = useState(EMAIL_TYPES[0].value);
  const [details, setDetails] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  useEffect(() => {
    setLanguage(getStoredLanguage());
    const handleLanguageChange = (event: Event) => {
      setLanguage((event as CustomEvent<Language>).detail);
    };
    window.addEventListener("obatra-language-change", handleLanguageChange);
    return () => window.removeEventListener("obatra-language-change", handleLanguageChange);
  }, []);

  useEffect(() => {
    async function initConversation() {
      try {
        const conversation = await createConversation();

        if (conversation?.id) {
          setConversationId(conversation.id);
        }
      } catch (error) {
        console.error("EMAIL CONVERSATION ERROR:", error);
      }
    }

    initConversation();
  }, []);

  async function generateEmail() {
    if (!details.trim()) {
      alert("Please describe what you want to say.");
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
        throw new Error("Please log in again.");
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: `EMAIL::${type}::${details}`,
          conversationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Email generation failed.");
      }

      setResult(data.reply || "No email generated.");
    } catch (error) {
      console.error("EMAIL ERROR:", error);

      setResult(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir={language === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 p-6 text-white shadow-xl shadow-blue-900/10 sm:p-9">
          <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-3xl">
              ✉️
            </div>
            <div className="min-w-0">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
                OBATRA AI WORKSPACE
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
                {t.emailTitle}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                {t.emailDescription}
              </p>
            </div>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-2 text-xs font-medium sm:text-sm">
            <span className="rounded-full bg-white/15 px-3 py-2">✍️ Write</span>
            <span className="rounded-full bg-white/15 px-3 py-2">💼 Professional</span>
            <span className="rounded-full bg-white/15 px-3 py-2">⚡ AI powered</span>
          </div>
        </header>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

          <section className="overflow-hidden rounded-3xl bg-black p-5 text-white shadow-xl sm:p-6 lg:col-start-2 lg:row-start-1">
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                OBATRA AI
              </span>
              <h2 className="mt-2 text-xl font-bold">Type d’e-mail</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Choisissez le type d’e-mail que vous souhaitez créer.
              </p>
            </div>

            <div className="space-y-2">
              {EMAIL_TYPES.map((emailType) => {
                const selected = type === emailType.value;

                return (
                  <button
                    key={emailType.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setType(emailType.value)}
                    className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      selected
                        ? "border-white bg-white text-black shadow-lg"
                        : "border-white/10 bg-white/5 text-white hover:border-white/25 hover:bg-white/10"
                    }`}
                  >
                    <span className="min-w-0 break-words">
                      {emailType.labels[language]}
                    </span>

                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                        selected
                          ? "bg-black text-white"
                          : "border border-white/20 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-1">

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  📝
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-900">
                    Compose your email
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Décrivez simplement ce que vous souhaitez dire.
                  </p>
                </div>
              </div>

              <label
                htmlFor="email-details"
                className="block text-sm font-semibold text-slate-700"
              >
                {t.whatToSay}
              </label>

              <textarea
                id="email-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="mt-2 min-h-56 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />

              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
                <span>Describe the purpose and key details.</span>
                <span>{details.length} characters</span>
              </div>

              <button
                type="button"
                onClick={generateEmail}
                disabled={loading || !conversationId || !details.trim()}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-3 font-bold text-white shadow-lg shadow-blue-700/15 transition hover:from-blue-800 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    {t.writing}
                  </>
                ) : (
                  <>✨ {t.generateEmail}</>
                )}
              </button>

              {!conversationId && (
                <p className="mt-3 text-center text-sm text-slate-500">
                  {t.preparingEmail}
                </p>
              )}
            </section>

            <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xl">
                  📄
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-900">
                    {t.generatedEmail}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Your AI-generated email will appear here.
                  </p>
                </div>

                {result && !loading && (
                  <span className="ms-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Ready
                  </span>
                )}
              </div>

              <div className="p-5 sm:p-6">
                {loading ? (
                  <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl bg-blue-50/60 px-5 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                      ✨
                    </span>
                    <p className="mt-4 font-semibold text-slate-800">
                      {t.writingEmail}
                    </p>
                    <div className="mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-blue-100">
                      <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-600" />
                    </div>
                  </div>
                ) : result ? (
                  <div className="min-h-64 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                    <div className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-700">
                      {result}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(result).catch(() => {
                          alert("Unable to copy automatically. Please select and copy the email text.");
                        });
                      }}
                      className="mt-5 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                    >
                      📋 Copy email
                    </button>
                  </div>
                ) : (
                  <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-5 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                      ✉️
                    </span>
                    <p className="mt-4 font-semibold text-slate-700">
                      {t.emailWillAppear}
                    </p>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                      Choose an email type, enter your details, and generate your email.
                    </p>
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>

        <footer className="py-7 text-center text-xs tracking-wide text-slate-400">
          OBATRA AI WORKSPACE
        </footer>
      </div>
    </main>
  );
}









