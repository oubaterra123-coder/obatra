"use client";

import { useEffect, useState } from "react";
import { CONTENT_TYPES } from "@/lib/constants";
import { createConversation } from "@/lib/conversations";
import { supabase } from "@/lib/supabase";

export default function WriterPage() {
  const [type, setType] = useState(CONTENT_TYPES[0]);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    async function initConversation() {
      try {
        console.log("Creating conversation...");

        const conversation = await createConversation();

        console.log("Conversation:", conversation);

        if (conversation?.id) {
          setConversationId(conversation.id);
        } else {
          console.error("Conversation was not created.");
        }
      } catch (err) {
        console.error("Create conversation error:", err);
      }
    }

    initConversation();
  }, []);

  async function generateContent() {
    if (!prompt.trim()) {
      alert("Please enter a topic.");
      return;
    }

    if (!conversationId) {
      alert("Conversation is not ready.");
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

      console.log("Conversation ID:", conversationId);
      console.log("Session OK");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: `WRITE::${type}::${prompt}`,
          conversationId,
        }),
      });

      const data = await res.json();

      console.log("API Response:", data);

      if (!res.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      setResult(data.reply);
    } catch (err) {
      console.error("WRITER ERROR:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-10">
      <h1 className="text-4xl font-bold">
        AI Writer
      </h1>

      <p className="mt-2 text-gray-600">
        Generate professional content with AI.
      </p>

      <div className="mt-6">
        <label className="mb-2 block font-semibold">
          Content Type
        </label>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-xl border p-3"
        >
          {CONTENT_TYPES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Write your topic..."
        className="mt-6 h-40 w-full rounded-xl border p-4"
      />

      <button
        onClick={generateContent}
        disabled={loading || !conversationId}
        className="mt-6 rounded-xl bg-green-600 px-8 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      <div className="mt-10 rounded-2xl border bg-white p-6">
        {result ? (
          <pre className="whitespace-pre-wrap">
            {result}
          </pre>
        ) : (
          <p className="text-gray-400">
            Generated content will appear here.
          </p>
        )}
      </div>
    </main>
  );
}
