"use client";

import { useEffect, useState } from "react";
import { createConversation } from "@/lib/conversations";
import { supabase } from "@/lib/supabase";
import { getStoredLanguage } from "@/lib/i18n/language";
import type { Language } from "@/lib/i18n/translations";

const MODES = [
  { value: "Explain", icon: "📚" },
  { value: "Questions", icon: "❓" },
  { value: "Summarize", icon: "📝" },
  { value: "Quiz", icon: "🧠" },
] as const;

type Mode = (typeof MODES)[number]["value"];

type StudyLabels = {
  title: string;
  description: string;
  lesson: string;
  questionPlaceholder: string;
  lessonPlaceholder: string;
  start: string;
  working: string;
  preparing: string;
  result: string;
  aiWorking: string;
  emptyResult: string;
  enterLesson: string;
  conversationNotReady: string;
  loginAgain: string;
  requestFailed: string;
  noResult: string;
  somethingWrong: string;
  errorPrefix: string;
  modes: Record<Mode, { label: string; description: string }>;
};

const STUDY_TRANSLATIONS: Record<Language, StudyLabels> = {
  fr: {
    title: "Assistant d’étude IA",
    description: "Apprenez, comprenez et entraînez-vous avec l’IA.",
    lesson: "Leçon ou question",
    questionPlaceholder: "Exemple : Qu’est-ce que la photosynthèse ?",
    lessonPlaceholder: "Collez votre leçon ou votre support de cours ici...",
    start: "Commencer",
    working: "Traitement en cours...",
    preparing: "Préparation de l’assistant d’étude...",
    result: "Résultat",
    aiWorking: "L’IA traite votre demande...",
    emptyResult: "Votre résultat apparaîtra ici.",
    enterLesson: "Veuillez saisir votre leçon ou votre question.",
    conversationNotReady: "La conversation n’est pas encore prête. Veuillez patienter.",
    loginAgain: "Veuillez vous reconnecter.",
    requestFailed: "La demande d’étude a échoué.",
    noResult: "Aucun résultat généré.",
    somethingWrong: "Une erreur s’est produite.",
    errorPrefix: "Erreur",
    modes: {
      Explain: { label: "Expliquer", description: "Comprendre clairement une leçon difficile." },
      Questions: { label: "Poser des questions", description: "Obtenir des réponses à vos questions." },
      Summarize: { label: "Résumer", description: "Transformer une leçon en points clés." },
      Quiz: { label: "Quiz", description: "Créer des questions d’entraînement avec réponses." },
    },
  },
  en: {
    title: "AI Study Assistant",
    description: "Learn, understand, practice, and study with AI.",
    lesson: "Lesson or Question",
    questionPlaceholder: "Example: What is photosynthesis?",
    lessonPlaceholder: "Paste your lesson or study material here...",
    start: "Start",
    working: "Working...",
    preparing: "Preparing study assistant...",
    result: "Result",
    aiWorking: "AI is working on your request...",
    emptyResult: "Your result will appear here.",
    enterLesson: "Please enter your lesson or question.",
    conversationNotReady: "Conversation is not ready yet. Please wait.",
    loginAgain: "Please log in again.",
    requestFailed: "Study request failed.",
    noResult: "No result generated.",
    somethingWrong: "Something went wrong.",
    errorPrefix: "Error",
    modes: {
      Explain: { label: "Explain", description: "Understand a difficult lesson clearly." },
      Questions: { label: "Ask Questions", description: "Get answers to your study questions." },
      Summarize: { label: "Summarize", description: "Turn a lesson into key points." },
      Quiz: { label: "Quiz", description: "Create practice questions with answers." },
    },
  },
  ar: {
    title: "مساعد الدراسة الذكي",
    description: "تعلّم وافهم وتدرّب بمساعدة الذكاء الاصطناعي.",
    lesson: "الدرس أو السؤال",
    questionPlaceholder: "مثال: ما هو التمثيل الضوئي؟",
    lessonPlaceholder: "ألصق الدرس أو المادة الدراسية هنا...",
    start: "ابدأ",
    working: "جارٍ العمل...",
    preparing: "جارٍ تجهيز مساعد الدراسة...",
    result: "النتيجة",
    aiWorking: "الذكاء الاصطناعي يعمل على طلبك...",
    emptyResult: "ستظهر النتيجة هنا.",
    enterLesson: "يرجى إدخال الدرس أو السؤال.",
    conversationNotReady: "المحادثة غير جاهزة بعد. يرجى الانتظار.",
    loginAgain: "يرجى تسجيل الدخول مجدداً.",
    requestFailed: "تعذّر تنفيذ طلب الدراسة.",
    noResult: "لم يتم إنشاء نتيجة.",
    somethingWrong: "حدث خطأ ما.",
    errorPrefix: "خطأ",
    modes: {
      Explain: { label: "شرح", description: "شرح الدروس الصعبة بوضوح." },
      Questions: { label: "طرح الأسئلة", description: "الحصول على إجابات لأسئلتك الدراسية." },
      Summarize: { label: "تلخيص", description: "تحويل الدرس إلى نقاط أساسية." },
      Quiz: { label: "اختبار", description: "إنشاء أسئلة تدريبية مع الإجابات." },
    },
  },
  es: {
    title: "Asistente de estudio con IA",
    description: "Aprende, comprende y practica con inteligencia artificial.",
    lesson: "Lección o pregunta",
    questionPlaceholder: "Ejemplo: ¿Qué es la fotosíntesis?",
    lessonPlaceholder: "Pega aquí tu lección o material de estudio...",
    start: "Comenzar",
    working: "Procesando...",
    preparing: "Preparando el asistente de estudio...",
    result: "Resultado",
    aiWorking: "La IA está trabajando en tu solicitud...",
    emptyResult: "Tu resultado aparecerá aquí.",
    enterLesson: "Introduce tu lección o pregunta.",
    conversationNotReady: "La conversación aún no está lista. Espera un momento.",
    loginAgain: "Inicia sesión de nuevo.",
    requestFailed: "La solicitud de estudio ha fallado.",
    noResult: "No se generó ningún resultado.",
    somethingWrong: "Se ha producido un error.",
    errorPrefix: "Error",
    modes: {
      Explain: { label: "Explicar", description: "Explica claramente una lección difícil." },
      Questions: { label: "Hacer preguntas", description: "Obtén respuestas a tus preguntas." },
      Summarize: { label: "Resumir", description: "Convierte una lección en puntos clave." },
      Quiz: { label: "Cuestionario", description: "Crea preguntas de práctica con respuestas." },
    },
  },
  de: {
    title: "KI-Lernassistent",
    description: "Lerne, verstehe und übe mit künstlicher Intelligenz.",
    lesson: "Lektion oder Frage",
    questionPlaceholder: "Beispiel: Was ist Photosynthese?",
    lessonPlaceholder: "Füge deine Lektion oder Lernmaterial hier ein...",
    start: "Starten",
    working: "Wird bearbeitet...",
    preparing: "Lernassistent wird vorbereitet...",
    result: "Ergebnis",
    aiWorking: "Die KI bearbeitet deine Anfrage...",
    emptyResult: "Dein Ergebnis erscheint hier.",
    enterLesson: "Bitte gib deine Lektion oder Frage ein.",
    conversationNotReady: "Die Unterhaltung ist noch nicht bereit. Bitte warte.",
    loginAgain: "Bitte melde dich erneut an.",
    requestFailed: "Die Lernanfrage ist fehlgeschlagen.",
    noResult: "Kein Ergebnis erstellt.",
    somethingWrong: "Ein Fehler ist aufgetreten.",
    errorPrefix: "Fehler",
    modes: {
      Explain: { label: "Erklären", description: "Schwierige Lektionen verständlich erklären." },
      Questions: { label: "Fragen stellen", description: "Antworten auf Lernfragen erhalten." },
      Summarize: { label: "Zusammenfassen", description: "Eine Lektion auf Kernpunkte reduzieren." },
      Quiz: { label: "Quiz", description: "Übungsfragen mit Antworten erstellen." },
    },
  },
  it: {
    title: "Assistente allo studio IA",
    description: "Impara, comprendi e fai pratica con l’intelligenza artificiale.",
    lesson: "Lezione o domanda",
    questionPlaceholder: "Esempio: Che cos’è la fotosintesi?",
    lessonPlaceholder: "Incolla qui la lezione o il materiale di studio...",
    start: "Inizia",
    working: "Elaborazione...",
    preparing: "Preparazione dell’assistente allo studio...",
    result: "Risultato",
    aiWorking: "L’IA sta elaborando la tua richiesta...",
    emptyResult: "Il risultato apparirà qui.",
    enterLesson: "Inserisci la lezione o la domanda.",
    conversationNotReady: "La conversazione non è ancora pronta. Attendi.",
    loginAgain: "Accedi nuovamente.",
    requestFailed: "La richiesta di studio non è riuscita.",
    noResult: "Nessun risultato generato.",
    somethingWrong: "Si è verificato un errore.",
    errorPrefix: "Errore",
    modes: {
      Explain: { label: "Spiega", description: "Spiega chiaramente una lezione difficile." },
      Questions: { label: "Fai domande", description: "Ottieni risposte alle domande di studio." },
      Summarize: { label: "Riassumi", description: "Trasforma una lezione in punti chiave." },
      Quiz: { label: "Quiz", description: "Crea domande di esercitazione con risposte." },
    },
  },
};

export default function StudyPage() {
  const [lang, setLang] = useState<Language>("fr");
  const labels = STUDY_TRANSLATIONS[lang];
  const [mode, setMode] = useState<Mode>("Explain");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

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

  useEffect(() => {
    async function initConversation() {
      try {
        const conversation = await createConversation();
        if (conversation?.id) setConversationId(conversation.id);
      } catch (error) {
        console.error("STUDY CONVERSATION ERROR:", error);
      }
    }
    initConversation();
  }, []);

  async function study() {
    if (!text.trim()) {
      alert(labels.enterLesson);
      return;
    }
    if (!conversationId) {
      alert(labels.conversationNotReady);
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
        throw new Error(labels.loginAgain);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: `STUDY::${mode}::${text}`,
          conversationId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || labels.requestFailed);
      setResult(data.reply || labels.noResult);
    } catch (error) {
      console.error("STUDY ERROR:", error);
      setResult(
        error instanceof Error
          ? `${labels.errorPrefix}: ${error.message}`
          : labels.somethingWrong
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/60 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 p-6 text-white shadow-xl sm:p-9">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 right-1/3 h-40 w-40 rounded-full bg-teal-300/20 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-3xl shadow-inner">
              🎓
            </div>
            <div className="min-w-0">
              <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-50">
                OBATRA AI
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
                {labels.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
                {labels.description}
              </p>
            </div>
          </div>
          <div className="relative mt-7 flex flex-wrap gap-2 text-xs font-medium sm:text-sm">
            <span className="rounded-full bg-white/15 px-3 py-2">📚 Learn</span>
            <span className="rounded-full bg-white/15 px-3 py-2">💡 Understand</span>
            <span className="rounded-full bg-white/15 px-3 py-2">🧠 Practice</span>
          </div>
        </header>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              {labels.lesson}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choisissez un mode pour commencer votre session.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {MODES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setMode(item.value)}
                aria-pressed={mode === item.value}
                className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5 ${
                  mode === item.value
                    ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100 ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition ${
                    mode === item.value
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 group-hover:bg-emerald-50"
                  }`}>
                    {item.icon}
                  </span>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                    mode === item.value
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 text-transparent"
                  }`}>
                    ✓
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-slate-900">
                  {labels.modes[item.value].label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {labels.modes[item.value].description}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-7 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/40 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-xl">
              ✍️
            </div>
            <div>
              <h2 className="font-bold text-slate-900">
                {labels.modes[mode].label}
              </h2>
              <p className="text-sm text-slate-500">
                {labels.lesson}
              </p>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={mode === "Questions" ? labels.questionPlaceholder : labels.lessonPlaceholder}
            className="mt-5 min-h-56 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 sm:min-h-64 sm:p-5 sm:text-base"
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              {text.length} caractères
              {!conversationId ? ` · ${labels.preparing}` : ""}
            </p>
            <button
              type="button"
              onClick={study}
              disabled={loading || !conversationId || !text.trim()}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  {labels.working}
                </>
              ) : (
                <>
                  <span>✨</span>
                  {labels.start}
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </section>

        <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/30">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-xl">
              💡
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900">{labels.result}</h2>
              <p className="text-sm text-slate-500">{labels.modes[mode].label}</p>
            </div>
            <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              AI
            </span>
          </div>

          <div className="min-h-40 p-5 sm:p-7">
            {loading ? (
              <div className="flex items-center gap-3 text-slate-600">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
                <p>{labels.aiWorking}</p>
              </div>
            ) : result ? (
              <div className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-700 sm:text-base">
                {result}
              </div>
            ) : (
              <div className="flex min-h-32 flex-col items-center justify-center text-center">
                <span className="text-3xl">📖</span>
                <p className="mt-3 font-medium text-slate-600">
                  {labels.emptyResult}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {labels.description}
                </p>
              </div>
            )}
          </div>
        </section>

        <p className="py-6 text-center text-xs text-slate-400">
          OBATRA AI WORKSPACE · Study smarter
        </p>
      </div>
    </main>
  );
}

