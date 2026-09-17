"use client";

import { useEffect, useState } from "react";
import { createConversation } from "@/lib/conversations";
import { supabase } from "@/lib/supabase";

const MODES = [
  {
    value: "Explain",
    label: "📚 Explain",
    description: "Explain a difficult lesson clearly.",
  },
  {
    value: "Questions",
    label: "❓ Ask Questions",
    description: "Get answers to study questions.",
  },
  {
    value: "Summarize",
    label: "📝 Summarize",
    description: "Turn a lesson into key points.",
  },
  {
    value: "Quiz",
    label: "🧠 Quiz",
    description: "Create practice questions with answers.",
  },
];

export default function StudyPage() {
  const [mode, setMode] = useState("Explain");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
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
        console.error("STUDY CONVERSATION ERROR:", error);
      }
    }

    initConversation();
  }, []);

  async function study() {
    if (!text.trim()) {
      alert("Please enter your lesson or question.");
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
          message: `STUDY::${mode}::${text}`,
          conversationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Study request failed.");
      }

      setResult(data.reply || "No result generated.");
    } catch (error) {
      console.error("STUDY ERROR:", error);

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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            AI Study Assistant
          </h1>

          <p className="mt-2 text-gray-500">
            Learn, understand, practice, and study with AI.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODES.map((item) => (
            <button
              key={item.value}
              onClick={() => setMode(item.value)}
              className={`rounded-2xl border p-5 text-left transition ${
                mode === item.value
                  ? "border-green-500 bg-green-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="text-lg font-bold text-slate-900">
                {item.label}
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {item.description}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="font-semibold text-slate-900">
            Lesson or Question
          </label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              mode === "Questions"
                ? "Example: What is photosynthesis?"
                : "Paste your lesson or study material here..."
            }
            className="mt-3 h-64 w-full resize-none rounded-xl border border-slate-300 p-4 outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            onClick={study}
            disabled={loading || !conversationId || !text.trim()}
            className="mt-5 rounded-xl bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Working..." : "Start"}
          </button>

          {!conversationId && (
            <p className="mt-3 text-sm text-gray-500">
              Preparing study assistant...
            </p>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            Result
          </h2>

          {loading ? (
            <p className="text-gray-500">
              AI is working on your request...
            </p>
          ) : result ? (
            <div className="whitespace-pre-wrap leading-8 text-slate-700">
              {result}
            </div>
          ) : (
            <p className="text-gray-400">
              Your result will appear here.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
