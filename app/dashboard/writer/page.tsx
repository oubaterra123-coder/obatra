"use client";

import { useEffect, useState } from "react";
import { createConversation } from "@/lib/conversations";

const CONTENT_TYPES = [
  "Blog Post",
  "Product Description",
  "Facebook Ad",
  "Email",
];

export default function WriterPage() {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("Blog Post");
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        `❌ ${
          error instanceof Error
            ? error.message
            : "Something went wrong."
        }`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-4xl font-bold">
          AI Writer ✍️
        </h1>

        <p className="mt-2 text-gray-500">
          Generate professional content with AI.
        </p>

        <div className="mt-8 rounded-2xl border bg-white p-6 shadow">

          <label className="font-semibold">
            Content Type
          </label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-3 w-full rounded-xl border p-4"
          >
            {CONTENT_TYPES.map((contentType) => (
              <option key={contentType} value={contentType}>
                {contentType}
              </option>
            ))}
          </select>

          <label className="mt-5 block font-semibold">
            Topic
          </label>

          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Example: How to Start an E-commerce Business"
            className="mt-3 h-32 w-full rounded-xl border p-4 outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            onClick={generateArticle}
            disabled={loading || !conversationId || !topic.trim()}
            className="mt-5 rounded-xl bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Content"}
          </button>

          {!conversationId && (
            <p className="mt-3 text-sm text-gray-500">
              Preparing writer...
            </p>
          )}

        </div>

        <div className="mt-8 rounded-2xl border bg-white p-6 shadow">

          <h2 className="mb-4 text-2xl font-bold">
            Generated Content
          </h2>

          {loading ? (
            <p className="text-gray-500">
              Generating content...
            </p>
          ) : article ? (
            <div className="whitespace-pre-wrap leading-8">
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