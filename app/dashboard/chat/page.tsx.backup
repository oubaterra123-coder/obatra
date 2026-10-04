"use client";

import { useEffect, useRef, useState } from "react";
import { createConversation } from "@/lib/conversations";
import ConversationSidebar from "@/app/components/dashboard/ConversationSidebar";
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

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
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
    <div className="flex h-screen bg-gray-100">
      <ConversationSidebar />

      <main className="flex flex-1 flex-col p-8">
        <h1 className="mb-6 text-3xl font-bold">
          AI Chat
        </h1>

        <div className="mb-6 flex-1 overflow-y-auto rounded-xl border bg-white p-6 shadow">
          {messages.length === 0 ? (
            <p className="text-gray-500">
              Start chatting with Obatra AI...
            </p>
          ) : (
            messages.map((msg, index) => (
              <Message
                key={msg.id ?? index}
                role={msg.role}
                content={msg.content}
              />
            ))
          )}

          {loading && (
            <div className="mr-24 rounded-xl border bg-white p-4">
              <strong>Obatra AI</strong>
              <p className="mt-2 animate-pulse text-gray-500">
                Thinking...
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="flex gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 rounded-lg border p-3"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white"
          >
            {loading ? "Sending..." : "Send"}
          </button>

          <button
            onClick={regenerateResponse}
            disabled={loading || !lastPrompt}
            className="rounded-lg border px-6 py-3"
          >
            Regenerate
          </button>
        </div>
      </main>
    </div>
  );
}
