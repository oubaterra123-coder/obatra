"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Conversation = {
  id: string;
  title: string;
};

export default function ConversationSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  async function loadConversations() {
    try {
      const res = await fetch("/api/conversations");

      if (!res.ok) {
        throw new Error("Failed to load conversations");
      }

      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  async function deleteConversation(id: string) {
    if (!confirm("Delete this conversation?")) return;

    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Delete failed");
        return;
      }

      setConversations((prev) =>
        prev.filter((chat) => chat.id !== id)
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function renameConversation(id: string) {
    if (!newTitle.trim()) return;

    try {
      const res = await fetch(
        `/api/conversations/${id}/rename`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newTitle.trim(),
          }),
        }
      );

      if (!res.ok) {
        alert("Rename failed");
        return;
      }

      setConversations((prev) =>
        prev.map((chat) =>
          chat.id === id
            ? { ...chat, title: newTitle.trim() }
            : chat
        )
      );

      setEditingId(null);
      setNewTitle("");
    } catch (err) {
      console.error(err);
    }
  }

  const filteredConversations = conversations.filter((chat) =>
    chat.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-72 overflow-y-auto border-r bg-white p-4">

      <h2 className="mb-5 text-xl font-bold">
        Chats
      </h2>

      <input
        type="text"
        placeholder="🔍 Search chats..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full rounded-lg border p-3 outline-none focus:border-blue-500"
      />

      <Link
        href="/dashboard/chat"
        className="mb-5 block rounded-lg bg-blue-600 p-3 text-center text-white hover:bg-blue-700"
      >
        + New Chat
      </Link>

      <div className="space-y-3">

        {filteredConversations.map((chat) => (

          <div
            key={chat.id}
            className="rounded-lg border p-3 shadow-sm"
          >

            {editingId === chat.id ? (

              <>
                <input
                  value={newTitle}
                  onChange={(e) =>
                    setNewTitle(e.target.value)
                  }
                  className="mb-2 w-full rounded-lg border p-2"
                />

                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      renameConversation(chat.id)
                    }
                    className="flex-1 rounded-lg bg-green-600 py-2 text-white hover:bg-green-700"
                  >
                    Save
                  </button>

                  <button
                    onClick={() => {
                      setEditingId(null);
                      setNewTitle("");
                    }}
                    className="flex-1 rounded-lg border py-2 hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                </div>
              </>

            ) : (

              <>
                <Link
                  href={`/dashboard/chat/${chat.id}`}
                  className="block truncate font-medium hover:text-blue-600"
                >
                  {chat.title}
                </Link>

                <div className="mt-3 flex gap-2">

                  <button
                    onClick={() => {
                      setEditingId(chat.id);
                      setNewTitle(chat.title);
                    }}
                    className="flex-1 rounded-lg bg-yellow-500 py-2 text-white hover:bg-yellow-600"
                  >
                    ✏️ Rename
                  </button>

                  <button
                    onClick={() =>
                      deleteConversation(chat.id)
                    }
                    className="flex-1 rounded-lg bg-red-500 py-2 text-white hover:bg-red-600"
                  >
                    🗑 Delete
                  </button>

                </div>
              </>

            )}

          </div>

        ))}

      </div>

    </aside>
  );
}