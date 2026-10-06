"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getStoredLanguage } from "@/lib/i18n/language";
import { getTranslations, type Language } from "@/lib/i18n/translations";

type Props = {
  role: "user" | "assistant";
  content: string;
};

export default function Message({ role, content }: Props) {
  const [copied, setCopied] = useState(false);
  const [language] = useState<Language>(() => getStoredLanguage());

  const t = getTranslations(language);

  async function copyMessage() {
    await navigator.clipboard.writeText(content);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  const copyLabel =
    language === "fr"
      ? "Copier"
      : language === "ar"
        ? "نسخ"
        : "Copy";

  const copiedLabel =
    language === "fr"
      ? "Copié"
      : language === "ar"
        ? "تم النسخ"
        : "Copied";

  return (
    <div
      className={`mb-4 rounded-xl p-4 ${
        role === "user"
          ? "ml-24 bg-blue-600 text-white"
          : "mr-24 border bg-white"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <strong>
          {role === "user" ? (language === "ar" ? "أنت" : language === "fr" ? "Vous" : "You") : "Obatra AI"}
        </strong>

        {role === "assistant" && (
          <button
            onClick={copyMessage}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-100"
          >
            {copied ? `✅ ${copiedLabel}` : `📋 ${copyLabel}`}
          </button>
        )}
      </div>

      <div className="prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
