"use client";

import { useEffect, useState } from "react";
import { createConversation } from "@/lib/conversations";
import { supabase } from "@/lib/supabase";

const EMAIL_TYPES = [
  "Professional Email",
  "Job Application",
  "Business Inquiry",
  "Customer Support",
  "Follow-up Email",
  "Thank You Email",
  "Meeting Request",
];

export default function EmailAssistantPage() {
  const [type, setType] = useState(EMAIL_TYPES[0]);
  const [details, setDetails] = useState("");
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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            AI Email Assistant
          </h1>

          <p className="mt-2 text-gray-500">
            Write clear and professional emails in seconds.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="font-semibold text-slate-900">
            Email Type
          </label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-3 w-full rounded-xl border border-slate-300 p-4 outline-none focus:ring-2 focus:ring-green-500"
          >
            {EMAIL_TYPES.map((emailType) => (
              <option key={emailType} value={emailType}>
                {emailType}
              </option>
            ))}
          </select>

          <label className="mt-5 block font-semibold text-slate-900">
            What do you want to say?
          </label>

          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Example: I want to ask a company about a job opportunity..."
            className="mt-3 h-48 w-full resize-none rounded-xl border border-slate-300 p-4 outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            onClick={generateEmail}
            disabled={loading || !conversationId || !details.trim()}
            className="mt-5 rounded-xl bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Writing..." : "Generate Email"}
          </button>

          {!conversationId && (
            <p className="mt-3 text-sm text-gray-500">
              Preparing email assistant...
            </p>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            Generated Email
          </h2>

          {loading ? (
            <p className="text-gray-500">
              Writing your email...
            </p>
          ) : result ? (
            <div className="whitespace-pre-wrap leading-8 text-slate-700">
              {result}
            </div>
          ) : (
            <p className="text-gray-400">
              Your email will appear here.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
