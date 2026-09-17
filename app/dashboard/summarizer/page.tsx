"use client";

import { useEffect, useState } from "react";
import { createConversation } from "@/lib/conversations";
import { supabase } from "@/lib/supabase";

export default function SummarizerPage() {
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
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            AI Summarizer
          </h1>

          <p className="mt-2 text-gray-500">
            Summarize any text quickly and clearly with AI.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="font-semibold text-slate-900">
            Text to summarize
          </label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here..."
            className="mt-3 h-64 w-full resize-none rounded-xl border border-slate-300 p-4 outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            onClick={summarizeText}
            disabled={loading || !conversationId || !text.trim()}
            className="mt-5 rounded-xl bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Summarizing..." : "Summarize"}
          </button>

          {!conversationId && (
            <p className="mt-3 text-sm text-gray-500">
              Preparing summarizer...
            </p>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            Summary
          </h2>

          {loading ? (
            <p className="text-gray-500">
              Creating your summary...
            </p>
          ) : summary ? (
            <div className="whitespace-pre-wrap leading-8 text-slate-700">
              {summary}
            </div>
          ) : (
            <p className="text-gray-400">
              Your summary will appear here.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
