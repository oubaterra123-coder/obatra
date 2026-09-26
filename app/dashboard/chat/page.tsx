"use client";

import { useEffect, useRef, useState } from "react";
import { createConversation } from "@/lib/conversations";
import Message from "@/app/components/dashboard/Message";
import { supabase } from "@/lib/supabase";

type ChatMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = chatContainerRef.current;

    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    async function init() {
      const conversation = await createConversation();

      if (conversation) {
        setConversationId(conversation.id);
      }
    }

    init();
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    async function loadMessages() {
      const res = await fetch(`/api/messages/${conversationId}`);

      if (!res.ok) return;

      const data = await res.json();

      setMessages(
        data.map((msg: ChatMessage) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
        }))
      );
    }

    loadMessages();
  }, [conversationId]);

  async function sendMessage() {
    if (!message.trim() || loading || !conversationId) return;

    const current = message;

    setLastPrompt(current);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: current,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Authentication required.");
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: current,
          conversationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Chat request failed.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);

      window.dispatchEvent(new Event("conversation-updated"));
    } catch (error) {
      console.error("CHAT ERROR:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function regenerateResponse() {
    if (!lastPrompt || loading || !conversationId) return;

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Authentication required.");
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: lastPrompt,
          conversationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Regeneration failed.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);

      window.dispatchEvent(new Event("conversation-updated"));
    } catch (error) {
      console.error("REGENERATE ERROR:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full min-w-0 bg-gray-100">
      <main className="flex min-w-0 flex-1 flex-col p-3 sm:p-8">
        <h1 className="mb-3 text-2xl font-bold sm:mb-6 sm:text-3xl">
          AI Chat
        </h1>

        <div
          ref={chatContainerRef}
          className="mb-4 min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-xl border bg-white p-3 shadow sm:mb-6 sm:p-6"
        >
          {messages.length === 0 ? (
            <p className="text-gray-700">
              Start chatting with Obatra AI...
            </p>
          ) : (
            <div className="min-w-0 space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={msg.id ?? index}
                  className="min-w-0 max-w-full break-words"
                >
                  <Message
                    role={msg.role}
                    content={msg.content}
                  />
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="mt-3 max-w-full rounded-xl border bg-white p-3 sm:mr-24 sm:p-4">
              <strong>Obatra AI</strong>
              <p className="mt-2 animate-pulse text-gray-700">
                Thinking...
              </p>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Type your message..."
            disabled={loading}
            className="min-w-0 flex-1 rounded-lg border bg-white p-3 text-gray-900 outline-none placeholder:text-gray-500 focus:border-blue-500"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white sm:w-auto"
          >
            {loading ? "Sending..." : "Send"}
          </button>

          <button
            onClick={regenerateResponse}
            disabled={loading || !lastPrompt}
            className="w-full rounded-lg border bg-white px-6 py-3 text-gray-900 sm:w-auto"
          >
            Regenerate
          </button>
        </div>
      </main>
    </div>
  );
}
