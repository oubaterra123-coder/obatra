"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ConversationPage() {
  const params = useParams();
  const id = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function loadMessages() {
      try {
        const res = await fetch(`/api/messages/${id}`);

        if (!res.ok) {
          throw new Error("Failed to load messages");
        }

        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, [id]);

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center">
        <p className="text-gray-500 text-lg">
          Loading conversation...
        </p>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-gray-100">
      <div className="border-b bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">
          Conversation
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">
            No messages yet.
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[80%] rounded-xl p-4 ${
                  msg.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "mr-auto bg-white shadow"
                }`}
              >
                <div className="mb-2 font-semibold">
                  {msg.role === "user" ? "You" : "Obatra AI"}
                </div>

                <p className="whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}