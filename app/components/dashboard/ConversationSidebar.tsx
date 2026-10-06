"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getStoredLanguage } from "@/lib/i18n/language";
import { getTranslations, type Language } from "@/lib/i18n/translations";

type Conversation = {
  id: string;
  title: string;
};

export default function ConversationSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [language, setLanguage] = useState<Language>("fr");

  useEffect(() => {
    setLanguage(getStoredLanguage());
  }, []);

  const t = getTranslations(language);

  async function getAuthHeaders() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      console.error("No active Supabase session.");
      return null;
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
    };
  }

  async function loadConversations() {
    try {
      const headers = await getAuthHeaders();

      if (!headers) return;

      const res = await fetch("/api/conversations", {
        method: "GET",
        headers,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("LOAD CONVERSATIONS ERROR:", data);
        return;
      }

      setConversations(data);
    } catch (err) {
      console.error("LOAD CONVERSATIONS ERROR:", err);
    }
  }

  useEffect(() => {
    loadConversations();

    const handler = () => {
      loadConversations();
    };

    window.addEventListener("conversation-updated", handler);

    return () => {
      window.removeEventListener("conversation-updated", handler);
    };
  }, []);

  async function deleteConversation(id: string) {
    const message =
      language === "fr"
        ? "Supprimer cette conversation ?"
        : language === "ar"
          ? "هل تريد حذف هذه المحادثة؟"
          : "Delete this conversation?";

    if (!confirm(message)) return;

    try {
      const headers = await getAuthHeaders();

      if (!headers) {
        alert(
          language === "fr"
            ? "Veuillez vous reconnecter."
            : language === "ar"
              ? "يرجى تسجيل الدخول مرة أخرى."
              : "Please log in again."
        );
        return;
      }

      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("DELETE ERROR:", data);
        alert(
          language === "fr"
            ? "La suppression a échoué."
            : language === "ar"
              ? "فشل الحذف."
              : "Delete failed."
        );
        return;
      }

      setConversations((prev) =>
        prev.filter((chat) => chat.id !== id)
      );
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  }

  async function renameConversation(id: string) {
    if (!newTitle.trim()) return;

    try {
      const headers = await getAuthHeaders();

      if (!headers) {
        alert(
          language === "fr"
            ? "Veuillez vous reconnecter."
            : language === "ar"
              ? "يرجى تسجيل الدخول مرة أخرى."
              : "Please log in again."
        );
        return;
      }

      const res = await fetch(
        `/api/conversations/${id}/rename`,
        {
          method: "PATCH",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newTitle.trim(),
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("RENAME ERROR:", data);
        alert(
          language === "fr"
            ? "Le renommage a échoué."
            : language === "ar"
              ? "فشلت إعادة التسمية."
              : "Rename failed."
        );
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
      console.error("RENAME ERROR:", err);
    }
  }

  const filteredConversations = conversations.filter((chat) =>
    chat.title.toLowerCase().includes(search.toLowerCase())
  );

  const labels = {
    chats:
      language === "fr"
        ? "Conversations"
        : language === "ar"
          ? "المحادثات"
          : "Chats",
    search:
      language === "fr"
        ? "Rechercher des conversations..."
        : language === "ar"
          ? "البحث في المحادثات..."
          : "Search chats...",
    newChat:
      language === "fr"
        ? "+ Nouvelle conversation"
        : language === "ar"
          ? "+ محادثة جديدة"
          : "+ New Chat",
    rename:
      language === "fr"
        ? "Renommer"
        : language === "ar"
          ? "إعادة التسمية"
          : "Rename",
    delete:
      language === "fr"
        ? "Supprimer"
        : language === "ar"
          ? "حذف"
          : "Delete",
  };

  return (
    <aside className="w-72 overflow-y-auto border-r bg-white p-4">
      <h2 className="mb-5 text-xl font-bold">
        {labels.chats}
      </h2>

      <input
        type="text"
        placeholder={labels.search}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full rounded-lg border p-3 outline-none focus:border-blue-500"
      />

      <Link
        href="/dashboard/chat"
        className="mb-5 block rounded-lg bg-blue-600 p-3 text-center text-white hover:bg-blue-700"
      >
        {labels.newChat}
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
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mb-2 w-full rounded-lg border p-2"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => renameConversation(chat.id)}
                    className="flex-1 rounded-lg bg-green-600 py-2 text-white hover:bg-green-700"
                  >
                    {t.save}
                  </button>

                  <button
                    onClick={() => {
                      setEditingId(null);
                      setNewTitle("");
                    }}
                    className="flex-1 rounded-lg border py-2 hover:bg-gray-100"
                  >
                    {t.cancel}
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
                    {labels.rename}
                  </button>

                  <button
                    onClick={() => deleteConversation(chat.id)}
                    className="flex-1 rounded-lg bg-red-500 py-2 text-white hover:bg-red-600"
                  >
                    {labels.delete}
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
