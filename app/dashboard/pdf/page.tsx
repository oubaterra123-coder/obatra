"use client";

import { useState } from "react";
import { getStoredLanguage } from "@/lib/i18n/language";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "@/lib/i18n/useTranslations";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function PDFPage() {
  const t = useTranslations();
  const questionLabel = {
    fr: "Question",
    en: "Question",
    ar: "السؤال",
    es: "Pregunta",
    de: "Frage",
    it: "Domanda",
  }[getStoredLanguage()];
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw new Error(error.message);
    if (!session) throw new Error("Please login again.");

    return session;
  }

  async function analyzePDF() {
    if (!file) {
      alert("Please select a PDF.");
      return;
    }

    setLoading(true);

    try {
      const session = await getSession();

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "question",
        question.trim() || "Summarize this PDF."
      );

      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + session.access_token,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "PDF analysis failed.");
      }

      setDocumentId(data.documentId);

      setMessages([
        {
          role: "user",
          content: question.trim() || "Summarize this PDF.",
        },
        {
          role: "assistant",
          content: data.answer || "No answer returned.",
        },
      ]);

      setQuestion("");
    } catch (error) {
      console.error("PDF ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "PDF analysis failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function askQuestion() {
    if (!documentId) {
      alert("Please upload a PDF first.");
      return;
    }

    const currentQuestion = question.trim();

    if (!currentQuestion) {
      alert("Please enter a question.");
      return;
    }

    setLoading(true);

    try {
      const session = await getSession();

      const response = await fetch("/api/pdf/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session.access_token,
        },
        body: JSON.stringify({
          documentId,
          question: currentQuestion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "PDF chat failed.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "user",
          content: currentQuestion,
        },
        {
          role: "assistant",
          content: data.answer || "No answer returned.",
        },
      ]);

      setQuestion("");
    } catch (error) {
      console.error("PDF CHAT ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "PDF chat failed."
      );
    } finally {
      setLoading(false);
    }
  }

  function selectFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selected = event.target.files?.[0] || null;

    setFile(selected);
    setDocumentId(null);
    setMessages([]);
    setQuestion("");
  }

  function newPDF() {
    setFile(null);
    setDocumentId(null);
    setMessages([]);
    setQuestion("");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-900 p-6 text-white shadow-xl sm:p-9">
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
                {t.pdfTitle}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100 sm:text-base">
                {t.pdfDescription}
              </p>
            </div>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-2 text-xs font-medium sm:text-sm">
            <span className="rounded-full bg-white/15 px-3 py-2">📑 PDF analysis</span>
            <span className="rounded-full bg-white/15 px-3 py-2">✨ AI answers</span>
            <span className="rounded-full bg-white/15 px-3 py-2">💬 Ask questions</span>
          </div>
        </header>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr]">
          <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xl">
                📂
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t.pdfFile}</h2>
                <p className="mt-1 text-sm text-slate-500">Upload a PDF and ask Obatra AI about its content.</p>
              </div>
            </div>

            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/60 px-4 py-6 text-center transition hover:border-violet-400 hover:bg-violet-50">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                📄
              </span>
              <span className="mt-3 font-semibold text-slate-800">
                {file ? "Choose another PDF" : "Select a PDF file"}
              </span>
              <span className="mt-1 text-sm text-slate-500">PDF documents only</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={selectFile}
                disabled={loading}
                className="sr-only"
              />
            </label>

            {file && (
              <div className="mt-4 flex min-w-0 items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl">
                  📑
                </span>
                <div className="min-w-0 flex-1">
                  <p className="break-all text-sm font-semibold text-slate-800">{file.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Selected
                </span>
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-bold text-slate-800">
                {questionLabel}
              </label>
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                disabled={loading}
                placeholder={t.pdfPlaceholder}
                className="mt-3 min-h-32 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
              />
              <p className="mt-2 text-right text-xs text-slate-400">
                {question.length} characters
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {!documentId ? (
                <button
                  type="button"
                  onClick={analyzePDF}
                  disabled={!file || loading}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-700 px-5 py-3 font-bold text-white shadow-lg shadow-violet-700/15 transition hover:from-violet-800 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      {t.analyzing}
                    </>
                  ) : (
                    <>✨ {t.analyzePdf}</>
                  )}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={askQuestion}
                    disabled={loading || !question.trim()}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-700 px-5 py-3 font-bold text-white shadow-lg shadow-violet-700/15 transition hover:from-violet-800 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        {t.thinking}
                      </>
                    ) : (
                      <>💬 {t.askQuestion}</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={newPDF}
                    disabled={loading}
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    {t.newPdf}
                  </button>
                </>
              )}
            </div>
          </section>

          <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                🤖
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900">{t.pdfChat}</h2>
                <p className="mt-1 text-sm text-slate-500">Your PDF conversation with Obatra AI.</p>
              </div>
              {documentId && (
                <span className="ms-auto shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  PDF ready
                </span>
              )}
            </div>

            <div className="min-h-80 space-y-4 p-4 sm:p-6">
              {loading && (
                <div className="flex items-center gap-3 rounded-2xl bg-violet-50 p-4 text-sm text-violet-800">
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-violet-200 border-t-violet-700" />
                  {documentId ? t.thinking : t.analyzing}
                </div>
              )}

              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    key={message.role + "-" + index}
                    className={
                      message.role === "user"
                        ? "ms-auto max-w-[90%] rounded-2xl rounded-br-md bg-violet-700 p-4 text-white sm:max-w-[85%]"
                        : "me-auto max-w-[95%] rounded-2xl rounded-bl-md border border-slate-100 bg-slate-50 p-4 text-slate-800 sm:max-w-[90%]"
                    }
                  >
                    <p className={"mb-2 text-xs font-bold " + (message.role === "user" ? "text-violet-100" : "text-violet-700")}>
                      {message.role === "user" ? t.you : "Obatra AI"}
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm leading-7">
                      {message.content}
                    </p>
                    {message.role === "assistant" && (
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText(message.content).catch(() => {
                            alert("Unable to copy automatically. Please select and copy the answer.");
                          });
                        }}
                        className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-violet-50"
                      >
                        📋 Copy answer
                      </button>
                    )}
                  </div>
                ))
              ) : !loading ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-5 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                    📚
                  </span>
                  <p className="mt-4 font-semibold text-slate-700">Your PDF answers will appear here</p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                    Select a PDF, analyze it, and continue asking questions about the document.
                  </p>
                </div>
              ) : null}
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



