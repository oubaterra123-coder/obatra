"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function PDFPage() {
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
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            PDF AI 📄
          </h1>

          <p className="mt-2 text-gray-500">
            Upload a PDF and ask questions about it.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow">

          <label className="font-semibold">
            PDF file
          </label>

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={selectFile}
            disabled={loading}
            className="mt-3 w-full rounded-xl border p-3"
          />

          {file && (
            <div className="mt-4 rounded-xl bg-gray-100 p-4">
              📄 {file.name}
            </div>
          )}

          <label className="mt-6 block font-semibold">
            Question
          </label>

          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            disabled={loading}
            placeholder="Ask something about the PDF..."
            className="mt-3 h-32 w-full rounded-xl border p-4"
          />

          <div className="mt-5 flex gap-3">

            {!documentId ? (
              <button
                onClick={analyzePDF}
                disabled={!file || loading}
                className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Analyze PDF"}
              </button>
            ) : (
              <button
                onClick={askQuestion}
                disabled={loading || !question.trim()}
                className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Thinking..." : "Ask Question"}
              </button>
            )}

            {documentId && (
              <button
                onClick={newPDF}
                disabled={loading}
                className="rounded-xl border px-6 py-3"
              >
                New PDF
              </button>
            )}

          </div>
        </div>

        {messages.length > 0 && (
          <div className="mt-8 rounded-2xl border bg-white p-6 shadow">

            <h2 className="text-2xl font-bold">
              PDF Chat 💬
            </h2>

            <div className="mt-6 space-y-4">

              {messages.map((message, index) => (
                <div
                  key={message.role + "-" + index}
                  className={
                    message.role === "user"
                      ? "ml-auto max-w-[80%] rounded-2xl bg-purple-600 p-4 text-white"
                      : "max-w-[80%] rounded-2xl bg-gray-100 p-4 text-gray-800"
                  }
                >
                  <p className="mb-1 text-xs font-semibold">
                    {message.role === "user"
                      ? "You"
                      : "Obatra AI"}
                  </p>

                  <p className="whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              ))}

            </div>
          </div>
        )}

      </div>
    </main>
  );
}
