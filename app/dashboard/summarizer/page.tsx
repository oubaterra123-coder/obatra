"use client";

import { useEffect, useState } from "react";
import { createConversation } from "@/lib/conversations";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "@/lib/i18n/useTranslations";

export default function SummarizerPage() {
  const t = useTranslations();
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    async function initConversation() {
      try {
        const conversation = await createConversation();

        if (conversation?.id) {
          setConversationId(conversation.id);
        }
      } catch (error) {
        console.error("SUMMARIZER CONVERSATION ERROR:", error);
      }
    }

    initConversation();
  }, []);

  async function summarizeText() {
    if (!text.trim()) {
      alert("Please enter some text.");
      return;
    }

    if (!conversationId) {
      alert("Conversation is not ready yet. Please wait a moment.");
      return;
    }

    setLoading(true);
    setSummary("");

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
          message: `SUMMARIZE::${text}`,
          conversationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Summarization failed.");
      }

      setSummary(data.reply || "No summary generated.");
    } catch (error) {
      console.error("SUMMARIZER ERROR:", error);

      setSummary(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Something went wrong while summarizing."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-green-900 p-6 text-white shadow-xl sm:p-9">
          <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-3xl">
              📄
            </div>
            <div className="min-w-0">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
                OBATRA AI WORKSPACE
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
                {t.summarizerTitle}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-100 sm:text-base">
                {t.summarizerDescription}
              </p>
            </div>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-2 text-xs font-medium sm:text-sm">
            <span className="rounded-full bg-white/15 px-3 py-2">✨ AI Summary</span>
            <span className="rounded-full bg-white/15 px-3 py-2">📝 Clear and concise</span>
            <span className="rounded-full bg-white/15 px-3 py-2">⚡ Fast results</span>
          </div>
        </header>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
          <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                📝
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t.textToSummarize}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Paste or type the text you want to summarize.
                </p>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.summarizePlaceholder}
              className="min-h-72 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />

            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
              <span>Enter the text you want to shorten.</span>
              <span>{text.length} characters</span>
            </div>

            <button
              type="button"
              onClick={summarizeText}
              disabled={loading || !conversationId || !text.trim()}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-3 font-bold text-white shadow-lg shadow-emerald-700/15 transition hover:from-emerald-800 hover:to-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  {t.summarizing}
                </>
              ) : (
                <>✨ {t.summarize}</>
              )}
            </button>

            {!conversationId && (
              <p className="mt-3 text-center text-sm text-slate-500">
                {t.preparingSummarizer}
              </p>
            )}
          </section>

          <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xl">
                📋
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900">
                  {t.summary}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your generated summary will appear here.
                </p>
              </div>
              {summary && !loading && (
                <span className="ms-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Ready
                </span>
              )}
            </div>

            <div className="p-5 sm:p-6">
              {loading ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl bg-emerald-50/70 px-5 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    ✨
                  </span>
                  <p className="mt-4 font-semibold text-slate-800">
                    {t.creatingSummary}
                  </p>
                  <div className="mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-emerald-100">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-600" />
                  </div>
                </div>
              ) : summary ? (
                <div className="min-h-72 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                  <div className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-700">
                    {summary}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(summary).catch(() => {
                        alert("Unable to copy automatically. Please select and copy the summary.");
                      });
                    }}
                    className="mt-5 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
                  >
                    📋 Copy summary
                  </button>
                </div>
              ) : (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-5 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                    📄
                  </span>
                  <p className="mt-4 font-semibold text-slate-700">
                    {t.summaryWillAppear}
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                    Enter your text and generate a concise summary.
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






