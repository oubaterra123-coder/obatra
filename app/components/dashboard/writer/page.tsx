"use client";

import { useState } from "react";

export default function WriterPage() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateArticle() {
    if (!topic.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Write a professional SEO article about "${topic}". Include a title, introduction, headings, and conclusion.`,
        }),
      });

      const data = await res.json();
      setResult(data.reply);
    } catch {
      setResult("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold">AI Writer ✍️</h1>

      <p className="mt-2 text-gray-600">
        Generate professional articles with AI.
      </p>

      <textarea
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Example: Benefits of Artificial Intelligence"
        className="mt-6 h-32 w-full rounded-lg border p-4"
      />

      <button
        onClick={generateArticle}
        disabled={loading}
        className="mt-4 rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Article"}
      </button>

      {result && (
        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">Generated Article</h2>
          <div className="whitespace-pre-wrap">{result}</div>
        </div>
      )}
    </main>
  );
}