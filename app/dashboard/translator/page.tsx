"use client";

import { useEffect, useState } from "react";
import { createConversation } from "@/lib/conversations";
import { supabase } from "@/lib/supabase";

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
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">
          AI Translator
        </h1>

        <p className="mt-2 text-gray-600">
          Translate text into any language using AI.
        </p>

        <div className="mt-8 rounded-2xl border bg-white p-6 shadow">
          <label className="font-semibold">
            Text
          </label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your text..."
            className="mt-3 h-40 w-full rounded-xl border p-4 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="mt-5 block font-semibold">
            Translate to
          </label>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-3 w-full rounded-xl border p-4"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          <button
            onClick={translate}
            disabled={loading || !conversationId || !text.trim()}
            className="mt-5 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Translating..." : "Translate"}
          </button>

          {!conversationId && (
            <p className="mt-3 text-sm text-gray-500">
              Preparing translator...
            </p>
          )}
        </div>

        <div className="mt-8 rounded-2xl border bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">
            Translation
          </h2>

          {loading ? (
            <p className="text-gray-500">
              Translating...
            </p>
          ) : result ? (
            <pre className="whitespace-pre-wrap leading-7">
              {result}
            </pre>
          ) : (
            <p className="text-gray-400">
              Translation will appear here.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
