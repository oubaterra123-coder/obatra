"use client";

import { useEffect, useState } from "react";
import { createConversation } from "@/lib/conversations";
import { CONTENT_TYPES } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

export default function WriterPage() {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState(CONTENT_TYPES[0]);
  const [article, setArticle] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
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

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">

        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            AI Writer
          </h1>

          <p className="mt-2 text-gray-500">
            Generate professional content with AI.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <label className="font-semibold text-slate-900">
            Content Type
          </label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-3 w-full rounded-xl border border-slate-300 p-4 outline-none focus:ring-2 focus:ring-green-500"
          >
            {CONTENT_TYPES.map((contentType) => (
              <option key={contentType} value={contentType}>
                {contentType}
              </option>
            ))}
          </select>

          <label className="mt-5 block font-semibold text-slate-900">
            Topic
          </label>

          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Example: How to Start an E-commerce Business"
            className="mt-3 h-32 w-full resize-none rounded-xl border border-slate-300 p-4 outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            onClick={generateArticle}
            disabled={loading || !conversationId || !topic.trim()}
            className="mt-5 rounded-xl bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Content"}
          </button>

          {!conversationId && (
            <p className="mt-3 text-sm text-gray-500">
              Preparing writer...
            </p>
          )}

        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            Generated Content
          </h2>

          {loading ? (
            <p className="text-gray-500">
              Generating content...
            </p>
          ) : article ? (
            <div className="whitespace-pre-wrap leading-8 text-slate-700">
              {article}
            </div>
          ) : (
            <p className="text-gray-400">
              Your generated content will appear here.
            </p>
          )}

        </div>

      </div>
    </main>
  );
}
