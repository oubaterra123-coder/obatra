"use client";

import { useEffect, useRef, useState } from "react";
import { createConversation } from "@/lib/conversations";
import Message from "@/app/components/dashboard/Message";
import { supabase } from "@/lib/supabase";
import { getStoredLanguage } from "@/lib/i18n/language";
import type { Language } from "@/lib/i18n/translations";

type ChatMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function speakReply(text: string, language: Language) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.error("OBATRA TTS: speechSynthesis unavailable");
    return;
  }

  const cleanText = text.trim();
  if (!cleanText) {
    console.warn("OBATRA TTS: empty text");
    return;
  }

  const locales: Record<Language, string> = {
    fr: "fr-FR",
    en: "en-US",
    ar: "ar-MA",
    es: "es-ES",
    de: "de-DE",
    it: "it-IT",
  };

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const hasArabicText = /[\u0600-\u06FF]/.test(cleanText);
  const speechLanguage: Language = hasArabicText ? "ar" : language;
  const targetLocale = locales[speechLanguage] || "fr-FR";
  const voices = synth.getVoices();

  utterance.voice =
    voices.find((voice) => voice.lang.toLowerCase() === targetLocale.toLowerCase()) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith(targetLocale.slice(0, 2))) ||
    null;

  utterance.lang = utterance.voice?.lang || targetLocale;
  utterance.rate = 1;

  utterance.onstart = () => console.log("OBATRA TTS: started", utterance.lang, utterance.voice?.name);
  utterance.onend = () => console.log("OBATRA TTS: finished");
  utterance.onerror = (event) => console.error("OBATRA TTS error:", event.error);

  window.setTimeout(() => {
    synth.speak(utterance);
    console.log("OBATRA TTS: speak requested; voices:", synth.getVoices().length);
  }, 100);
}export default function ChatPage() {
  const [lang, setLang] = useState<Language>("fr");

  useEffect(() => {
    const updateLanguage = (event?: Event) => {
      const selected = event
        ? (event as CustomEvent<Language>).detail
        : getStoredLanguage();
      setLang(selected);
    };

    updateLanguage();
    window.addEventListener("obatra-language-change", updateLanguage);
    return () => window.removeEventListener("obatra-language-change", updateLanguage);
  }, []);

  const labels = {
    fr: { title: "Chat IA", start: "Commencez à discuter avec Obatra AI...", thinking: "Réflexion...", placeholder: "Écrivez votre message...", sending: "Envoi...", send: "Envoyer", regenerate: "Régénérer" },
    en: { title: "AI Chat", start: "Start chatting with Obatra AI...", thinking: "Thinking...", placeholder: "Type your message...", sending: "Sending...", send: "Send", regenerate: "Regenerate" },
    ar: { title: "الدردشة الذكية", start: "ابدأ الدردشة مع Obatra AI...", thinking: "جارٍ التفكير...", placeholder: "اكتب رسالتك...", sending: "جارٍ الإرسال...", send: "إرسال", regenerate: "إعادة التوليد" },
    es: { title: "Chat IA", start: "Empieza a chatear con Obatra AI...", thinking: "Pensando...", placeholder: "Escribe tu mensaje...", sending: "Enviando...", send: "Enviar", regenerate: "Regenerar" },
    de: { title: "KI-Chat", start: "Beginne einen Chat mit Obatra AI...", thinking: "Denkt nach...", placeholder: "Nachricht eingeben...", sending: "Wird gesendet...", send: "Senden", regenerate: "Neu generieren" },
    it: { title: "Chat IA", start: "Inizia a chattare con Obatra AI...", thinking: "Sto pensando...", placeholder: "Scrivi il tuo messaggio...", sending: "Invio...", send: "Invia", regenerate: "Rigenera" }
  }[lang];

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);

  const voiceLabels = {
    fr: "Parler",
    en: "Speak",
    ar: "تحدث",
    es: "Hablar",
    de: "Sprechen",
    it: "Parla",
  }[lang];

  const listeningLabels = {
    fr: "Écoute...",
    en: "Listening...",
    ar: "كنسمع...",
    es: "Escuchando...",
    de: "Höre zu...",
    it: "In ascolto...",
  }[lang];

  const chatContainerRef = useRef<HTMLDivElement>(null);

  function startVoiceInput() {
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const Recognition =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      window.alert(
        "Speech recognition is not supported in this browser. Try Chrome."
      );
      return;
    }

    const recognition = new Recognition();
    recognition.lang = {
      fr: "fr-FR",
      en: "en-US",
      ar: "ar-MA",
      es: "es-ES",
      de: "de-DE",
      it: "it-IT",
    }[lang];

    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();

      if (transcript) {
        setMessage(transcript);
        void sendMessage(transcript);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    try {
      setIsListening(true);
      recognition.start();
    } catch {
      setIsListening(false);
      window.alert("Could not start the microphone. Please try again.");
    }
  }

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

  async function sendMessage(text?: string) {
    const current = (text ?? message).trim();
    if (!current || loading || !conversationId) return;

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
      speakReply(data.reply, lang);

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
      speakReply(data.reply, lang);

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
    <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <header className="relative shrink-0 overflow-hidden border-b border-indigo-100 bg-white px-4 py-4 sm:px-7 sm:py-5">
        <div className="pointer-events-none absolute -right-12 -top-20 h-48 w-48 rounded-full bg-indigo-100/70 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl text-white shadow-lg shadow-indigo-500/20">
            ✦
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              {labels.title}
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Obatra AI · Your intelligent assistant
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700">AI Assistant</span>
          </div>
        </div>
      </header>

      <div
        ref={chatContainerRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5 sm:px-6 sm:py-7 lg:px-10"
      >
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center py-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-4xl text-white shadow-xl shadow-indigo-500/20">
              ✦
            </div>
            <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {labels.title}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
              {labels.start}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">💬 AI Chat</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">🎙️ Voice input</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">🔊 Voice replies</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-4xl space-y-5 sm:space-y-7">
            {messages.map((msg, index) => (
              <div
                key={msg.id ?? index}
                className={`min-w-0 max-w-full ${msg.role === "user" ? "ml-auto max-w-[92%] sm:max-w-[80%]" : "mr-auto w-full"}`}
              >
                {msg.role === "assistant" && (
                  <div className="mb-2 flex items-center gap-2 pl-1">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-xs text-white">✦</span>
                    <span className="text-xs font-bold text-slate-700">Obatra AI</span>
                  </div>
                )}
                <div className={`min-w-0 break-words ${msg.role === "user" ? "rounded-2xl rounded-br-md bg-gradient-to-br from-blue-600 to-indigo-600 p-3 text-white shadow-md shadow-indigo-500/10 sm:p-4" : "rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5"}`}>
                  <Message role={msg.role} content={msg.content} />
                </div>
                {msg.role === "assistant" && (
                  <button
                    type="button"
                    data-obatra-audio="OBATRA_READ_REPLY_BUTTON"
                    onClick={() => speakReply(msg.content, lang)}
                    className="mt-2 inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    🔊 {lang === "ar" ? "اسمع الجواب" : lang === "fr" ? "Écouter la réponse" : lang === "es" ? "Escuchar respuesta" : lang === "de" ? "Antwort anhören" : lang === "it" ? "Ascolta la risposta" : "Listen to reply"}
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div className="mr-auto w-full max-w-4xl">
                <div className="mb-2 flex items-center gap-2 pl-1">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-xs text-white">✦</span>
                  <span className="text-xs font-bold text-slate-700">Obatra AI</span>
                </div>
                <div className="inline-flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white px-4 py-4 shadow-sm">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:300ms]" />
                  </span>
                  <span className="text-sm text-slate-500">{labels.thinking}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="shrink-0 border-t border-slate-200/80 bg-white/95 px-3 pb-3 pt-3 backdrop-blur sm:px-6 sm:pb-5 sm:pt-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex min-w-0 flex-wrap items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10 sm:flex-nowrap sm:gap-3 sm:p-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={labels.placeholder}
              disabled={loading}
              rows={1}
              className="max-h-36 min-h-11 min-w-0 flex-1 resize-y bg-transparent px-2 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60 sm:text-base"
            />

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={startVoiceInput}
                disabled={loading || isListening}
                title={voiceLabels}
                aria-label={voiceLabels}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-50 ${isListening ? "border-red-200 bg-red-50 text-red-600" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"}`}
              >
                {isListening ? "🔴" : "🎙️"}
              </button>
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={loading || !message.trim() || !conversationId}
                aria-label={labels.send}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
              >
                <span className="text-sm">{loading ? labels.sending : labels.send}</span>
                <span aria-hidden="true">➤</span>
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-[11px] leading-5 text-slate-400">
              {isListening ? listeningLabels : "Enter to send · Shift + Enter for a new line"}
            </p>
            <button
              type="button"
              onClick={regenerateResponse}
              disabled={loading || !lastPrompt}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ↻ {labels.regenerate}
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
















