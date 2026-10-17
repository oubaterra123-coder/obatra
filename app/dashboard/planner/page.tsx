"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { supabase } from "@/lib/supabase";
import { getStoredLanguage } from "@/lib/i18n/language";
import type { Language } from "@/lib/i18n/translations";

type PlannerSpeechRecognition = {
lang: string;
interimResults: boolean;
maxAlternatives: number;
onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
onerror: (() => void) | null;
onend: (() => void) | null;
start: () => void;
};
type PlannerSpeechRecognitionConstructor = new () => PlannerSpeechRecognition;
type Task = {
  id: string;
  title: string;
  description: string | null;
  task_date: string;
  start_time: string | null;
  end_time: string | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed" | "cancelled";
  location: string | null;
  reminder_at: string | null;
};

const plannerText: Record<Language, {
  title: string; description: string; signIn: string; askObatra: string;
  askDescription: string; aiPlaceholder: string; thinking: string; askAI: string;
  addTask: string; taskPlaceholder: string; saving: string; add: string;
  plan: string; loading: string; empty: string; reminder: string;
  save: string; edit: string; undo: string; done: string; delete: string;
  authError: string; aiError: string; noResponse: string; connectionError: string;
}> = {
  fr: {
    title: "Planificateur IA", description: "Organisez votre journée, vos tâches et vos priorités avec l’IA.",
    signIn: "Veuillez vous connecter pour utiliser le planificateur.",
    askObatra: "Demander à Obatra", askDescription: "Dites à Obatra ce que vous devez faire aujourd’hui.",
    aiPlaceholder: "Que dois-je faire maintenant ?", thinking: "Réflexion...", askAI: "Demander à l’IA",
    addTask: "Ajouter une tâche", taskPlaceholder: "Que devez-vous faire ?", saving: "Enregistrement...", add: "Ajouter",
    plan: "Mon planning", loading: "Chargement de votre planning...", empty: "Aucune tâche. Ajoutez votre première tâche pour organiser votre journée.",
    reminder: "Rappel défini", save: "Enregistrer", edit: "Modifier", undo: "Annuler", done: "Terminé", delete: "Supprimer",
    authError: "Veuillez vous connecter pour utiliser le planificateur IA.", aiError: "Le planificateur IA a échoué.", noResponse: "Aucune réponse.", connectionError: "Impossible de contacter le planificateur IA."
  },
  en: {
    title: "AI Planner", description: "Organize your day, tasks, and priorities with AI.",
    signIn: "Please sign in to use Planner.", askObatra: "Ask Obatra",
    askDescription: "Tell Obatra what you need to do with your day.", aiPlaceholder: "What should I do now?",
    thinking: "Thinking...", askAI: "Ask AI", addTask: "Add a task", taskPlaceholder: "What do you need to do?",
    saving: "Saving...", add: "Add Task", plan: "Plan", loading: "Loading your plan...",
    empty: "No tasks yet. Add your first task to organize the day.", reminder: "Reminder set",
    save: "Save", edit: "Edit", undo: "Undo", done: "Done", delete: "Delete",
    authError: "Please sign in to use Planner.", aiError: "Planner AI failed.", noResponse: "No response.", connectionError: "Could not connect to Planner AI."
  },
  ar: {
    title: "المخطط الذكي", description: "نظّم يومك ومهامك وأولوياتك بمساعدة الذكاء الاصطناعي.",
    signIn: "يرجى تسجيل الدخول لاستخدام المخطط.", askObatra: "اسأل Obatra",
    askDescription: "أخبر Obatra بما تحتاج إلى إنجازه اليوم.", aiPlaceholder: "ماذا عليّ أن أفعل الآن؟",
    thinking: "جارٍ التفكير...", askAI: "اسأل الذكاء الاصطناعي", addTask: "إضافة مهمة",
    taskPlaceholder: "ما الذي تحتاج إلى إنجازه؟", saving: "جارٍ الحفظ...", add: "إضافة المهمة",
    plan: "خطتي", loading: "جارٍ تحميل خطتك...", empty: "لا توجد مهام بعد. أضف أول مهمة لتنظيم يومك.",
    reminder: "تم ضبط التذكير", save: "حفظ", edit: "تعديل", undo: "تراجع", done: "تم", delete: "حذف",
    authError: "يرجى تسجيل الدخول لاستخدام المخطط الذكي.", aiError: "تعذّر تشغيل المخطط الذكي.", noResponse: "لا توجد إجابة.", connectionError: "تعذّر الاتصال بالمخطط الذكي."
  },
  es: {
    title: "Planificador IA", description: "Organiza tu día, tareas y prioridades con IA.",
    signIn: "Inicia sesión para usar el planificador.", askObatra: "Preguntar a Obatra",
    askDescription: "Dile a Obatra qué necesitas hacer hoy.", aiPlaceholder: "¿Qué debo hacer ahora?",
    thinking: "Pensando...", askAI: "Preguntar a la IA", addTask: "Añadir una tarea",
    taskPlaceholder: "¿Qué necesitas hacer?", saving: "Guardando...", add: "Añadir tarea",
    plan: "Plan", loading: "Cargando tu plan...", empty: "Todavía no hay tareas. Añade tu primera tarea para organizar el día.",
    reminder: "Recordatorio configurado", save: "Guardar", edit: "Editar", undo: "Deshacer", done: "Hecho", delete: "Eliminar",
    authError: "Inicia sesión para usar el planificador IA.", aiError: "El planificador IA ha fallado.", noResponse: "Sin respuesta.", connectionError: "No se pudo conectar con el planificador IA."
  },
  de: {
    title: "KI-Tagesplaner", description: "Organisiere deinen Tag, deine Aufgaben und Prioritäten mit KI.",
    signIn: "Bitte melde dich an, um den Planer zu nutzen.", askObatra: "Obatra fragen",
    askDescription: "Sag Obatra, was du heute erledigen musst.", aiPlaceholder: "Was soll ich jetzt erledigen?",
    thinking: "Denke nach...", askAI: "KI fragen", addTask: "Aufgabe hinzufügen",
    taskPlaceholder: "Was musst du erledigen?", saving: "Speichern...", add: "Aufgabe hinzufügen",
    plan: "Mein Plan", loading: "Dein Plan wird geladen...", empty: "Noch keine Aufgaben. Füge deine erste Aufgabe hinzu, um deinen Tag zu organisieren.",
    reminder: "Erinnerung eingestellt", save: "Speichern", edit: "Bearbeiten", undo: "Rückgängig", done: "Erledigt", delete: "Löschen",
    authError: "Bitte melde dich beim KI-Planer an.", aiError: "Der KI-Planer ist fehlgeschlagen.", noResponse: "Keine Antwort.", connectionError: "Verbindung zum KI-Planer fehlgeschlagen."
  },
  it: {
    title: "Planner IA", description: "Organizza la giornata, le attività e le priorità con l’IA.",
    signIn: "Accedi per usare il planner.", askObatra: "Chiedi a Obatra",
    askDescription: "Di’ a Obatra cosa devi fare oggi.", aiPlaceholder: "Cosa devo fare adesso?",
    thinking: "Sto pensando...", askAI: "Chiedi all’IA", addTask: "Aggiungi un’attività",
    taskPlaceholder: "Cosa devi fare?", saving: "Salvataggio...", add: "Aggiungi attività",
    plan: "Il mio piano", loading: "Caricamento del piano...", empty: "Nessuna attività. Aggiungi la prima attività per organizzare la giornata.",
    reminder: "Promemoria impostato", save: "Salva", edit: "Modifica", undo: "Annulla", done: "Fatto", delete: "Elimina",
    authError: "Accedi per usare il planner IA.", aiError: "Il planner IA non è riuscito a completare la richiesta.", noResponse: "Nessuna risposta.", connectionError: "Impossibile connettersi al planner IA."
  }
};
function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function PlannerPage() {
  const [language, setLanguage] = useState<Language>("fr");
  const labels = plannerText[language];

  useEffect(() => {
    setLanguage(getStoredLanguage());
    const handleLanguageChange = (event: Event) => {
      const next = (event as CustomEvent<Language>).detail;
      if (next in plannerText) setLanguage(next);
    };
    window.addEventListener("obatra-language-change", handleLanguageChange);
    return () => window.removeEventListener("obatra-language-change", handleLanguageChange);
  }, []);

  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [taskDate, setTaskDate] = useState(getToday());
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">("medium");
  const [aiMessage, setAiMessage] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const today = getToday();

function plannerNotificationId(taskId: string): number {
let hash = 0;
for (let i = 0; i < taskId.length; i++) {
hash = Math.imul(hash, 31) + taskId.charCodeAt(i);
}
return (hash & 0x7fffffff) || 1;
}

async function cancelPlannerNotification(taskId: string) {
if (!Capacitor.isNativePlatform()) return;

try {
await LocalNotifications.cancel({
notifications: [{ id: plannerNotificationId(taskId) }],
});
} catch (error) {
console.error("PLANNER NOTIFICATION CANCEL ERROR:", error);
}
}
async function syncPlannerNotifications(taskList: Task[]) {
if (!Capacitor.isNativePlatform()) return;


const reminders = taskList.filter(
  (task) =>
    task.status === "pending" &&
    task.reminder_at &&
    new Date(task.reminder_at).getTime() > Date.now()
);

if (reminders.length === 0) return;

try {
  let permission = await LocalNotifications.checkPermissions();

  if (permission.display !== "granted") {
    permission = await LocalNotifications.requestPermissions();
  }

  if (permission.display !== "granted") return;

  await LocalNotifications.schedule({
    notifications: reminders.map((task) => ({
      id: plannerNotificationId(task.id),
      title: "Obatra — " + task.title,
      body: "تذكير بالمهمة ديالك",
      schedule: { at: new Date(task.reminder_at!) },
    })),
  });
} catch (error) {
  console.error("PLANNER NOTIFICATION ERROR:", error);
}


}
  async function loadTasks() {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("PLANNER SESSION:", session?.user?.id);

    if (!session?.user) {
      setUserId(null);
      setTasks([]);
      setLoading(false);
      return;
    }

    setUserId(session.user.id);

    const { data, error } = await supabase
      .from("planner_tasks")
      .select(
        "id, title, description, task_date, start_time, end_time, priority, status, location, reminder_at"
      )
      .eq("user_id", session.user.id)
      .order("task_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("PLANNER LOAD ERROR:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      setTasks([]);
    } else {
setTasks((data || []) as Task[]);
void syncPlannerNotifications((data || []) as Task[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  // Browser reminders while Planner remains open.
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    const timers = tasks.flatMap((task) => {
      if (task.status !== "pending" || !task.reminder_at) return [];

      const delay = new Date(task.reminder_at).getTime() - Date.now();
      if (!Number.isFinite(delay) || delay <= 0) return [];

      const timer = window.setTimeout(() => {
        window.alert(`Obatra — ${task.title}\nحان وقت المهمة ديالك.`);
      }, delay);

      return [timer];
    });

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [tasks]);

  async function addTask() {
    if (!title.trim() || !userId || saving) return;

    setSaving(true);

    const { error } = await supabase.from("planner_tasks").insert({
      user_id: userId,
      title: title.trim(),
      task_date: taskDate || today,
      start_time: time || null,
      reminder_at: taskDate && time ? new Date(`${taskDate}T${time}:00`).toISOString() : null,
      priority,
      status: "pending",
    });

    if (error) {
      console.error("PLANNER ADD ERROR:", error);
      setSaving(false);
      return;
    }

    setTitle("");
    setTime("");
    setTaskDate(today);
    setPriority("medium");

    await loadTasks();
    setSaving(false);
  }

  async function askPlannerAI(messageOverride?: string) {
    const messageToSend = (messageOverride ?? aiMessage).trim();
    if (!messageToSend || aiLoading) return;

    setAiLoading(true);
    setAiReply("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setAiReply(labels.authError);
        return;
      }

      const response = await fetch("/api/planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: messageToSend,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAiReply(data?.error || labels.aiError);
        return;
      }

      setAiReply(data.reply || labels.noResponse);
      if (data.reply) speakPlannerReply(data.reply);
      await loadTasks();
    } catch (error) {
      console.error("PLANNER AI REQUEST ERROR:", error);
      setAiReply(labels.connectionError);
    } finally {
      setAiLoading(false);
    }
  }

function speakPlannerReply(text: string) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const hasArabic = /[\u0600-\u06FF]/.test(text);
  const isDarijaLatin = /\b(salam|labas|kif|kidayr|n3awnk|lyoum|bghit|wach|safi|mzyan|chno|ghadi|3afak|dyal|kayn|ndir|n9der)\b/i.test(text);
  const voices = window.speechSynthesis.getVoices();

  if (hasArabic || isDarijaLatin) {
    const arabicVoice = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith("ar")
    );



    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = arabicVoice?.lang || "ar-MA";
    if (arabicVoice) utterance.voice = arabicVoice;
    window.speechSynthesis.speak(utterance);
    return;
  }

  const lang = document.documentElement.lang.slice(0, 2) || "fr";
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang =
    ({ fr: "fr-FR", en: "en-US", es: "es-ES", de: "de-DE", it: "it-IT" } as Record<string, string>)[lang]
    || "fr-FR";

  window.speechSynthesis.speak(utterance);
}
function startPlannerVoice() {
if (aiLoading || isListening) return;
const w = window as Window & {
SpeechRecognition?: PlannerSpeechRecognitionConstructor;
webkitSpeechRecognition?: PlannerSpeechRecognitionConstructor;
};
const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
if (!Recognition) {
alert("La reconnaissance vocale n'est pas disponible. Essaie Chrome.");
return;
}
const recognition = new Recognition();
const lang = document.documentElement.lang.slice(0, 2) || "fr";
recognition.lang = ({ fr: "fr-FR", en: "en-US", ar: "ar-MA", es: "es-ES", de: "de-DE", it: "it-IT" } as Record<string, string>)[lang] || "fr-FR";
recognition.interimResults = false;
recognition.maxAlternatives = 1;
setIsListening(true);
recognition.onresult = (event) => {
const transcript = event.results[0]?.[0]?.transcript?.trim();
if (transcript) {
setAiMessage(transcript);
void askPlannerAI(transcript);
}
};
recognition.onerror = () => setIsListening(false);
recognition.onend = () => setIsListening(false);
try { recognition.start(); } catch { setIsListening(false); }
}
  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditTime(task.start_time ? task.start_time.slice(0, 5) : "");
    setEditDate(task.task_date);
    setEditPriority(task.priority);
  }

  async function saveEdit(task: Task) {
    if (!userId || !editTitle.trim()) return;

    const { error } = await supabase
      .from("planner_tasks")
      .update({
        title: editTitle.trim(),
        task_date: editDate || task.task_date,
        start_time: editTime || null,
        priority: editPriority,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id)
      .eq("user_id", userId);

    if (error) {
      console.error("PLANNER EDIT ERROR:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      return;
    }

    setEditingId(null);
    await loadTasks();
  }

  async function toggleComplete(task: Task) {
    const newStatus =
      task.status === "completed" ? "pending" : "completed";

    const { error } = await supabase
      .from("planner_tasks")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id)
      .eq("user_id", userId);

    if (error) {
      console.error("PLANNER UPDATE ERROR:", error);
      return;
    }

    if (newStatus === "completed") {
        await cancelPlannerNotification(task.id);
      }
      await loadTasks();
  }

  async function deleteTask(id: string) {
    const { error } = await supabase
      .from("planner_tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("PLANNER DELETE ERROR:", error);
      return;
    }

    await cancelPlannerNotification(id);
    await loadTasks();
  }

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/60 px-4 py-6 sm:px-6 sm:py-9"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-6xl">
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800 p-6 text-white shadow-xl sm:p-9">
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl ring-1 ring-white/20 sm:h-16 sm:w-16">
              📅
            </div>
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide ring-1 ring-white/10">
                OBATRA AI WORKSPACE
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
                {labels.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-50 sm:text-base">
                {labels.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium sm:text-sm">
                <span className="rounded-full bg-white/10 px-3 py-2">🤖 AI</span>
                <span className="rounded-full bg-white/10 px-3 py-2">🎙️ Voice</span>
                <span className="rounded-full bg-white/10 px-3 py-2">🔔 Reminders</span>
              </div>
            </div>
          </div>
        </header>

        {!userId && !loading && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 sm:p-5">
            <span className="text-xl">🔐</span>
            <p className="text-sm leading-6">{labels.signIn}</p>
          </div>
        )}

        <section className="mt-6 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-emerald-900/5">
          <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
              🤖
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                {labels.askObatra}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {labels.askDescription}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <input
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void askPlannerAI();
                  }
                }}
                placeholder={labels.aiPlaceholder}
                disabled={!userId || aiLoading}
                className="min-h-14 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startPlannerVoice}
                  disabled={!userId || aiLoading || isListening}
                  className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                  <span className="text-lg">{isListening ? "🎙️" : "🎤"}</span>
                  {isListening ? "Écoute..." : "Voix"}
                </button>

                <button
                  type="button"
                  onClick={() => void askPlannerAI()}
                  disabled={!aiMessage.trim() || aiLoading || !userId}
                  className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                  {aiLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      {labels.thinking}
                    </>
                  ) : (
                    <>{labels.askAI} <span>→</span></>
                  )}
                </button>
              </div>
            </div>

            {aiReply && (
              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 sm:p-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-900">
                  <span>✨</span> Obatra AI
                </div>
                <div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                  {aiReply}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
              ✍️
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                {labels.addTask}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {labels.taskPlaceholder}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_145px_165px_175px_auto]">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void addTask();
              }}
              placeholder={labels.taskPlaceholder}
              disabled={!userId || saving}
              className="min-h-12 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60"
            />

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              aria-label="Task time"
              disabled={!userId || saving}
              className="min-h-12 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />

            <input
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              aria-label="Task date"
              disabled={!userId || saving}
              className="min-h-12 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              aria-label="Task priority"
              disabled={!userId || saving}
              className="min-h-12 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>

            <button
              type="button"
              onClick={() => void addTask()}
              disabled={!title.trim() || !userId || saving}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-700/15 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  {labels.saving}
                </>
              ) : (
                <>＋ {labels.add}</>
              )}
            </button>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
          <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-2xl">
              📋
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                {labels.plan}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {loading ? labels.loading : `${tasks.length} ${language === "ar" ? "مهام" : "tasks"}`}
              </p>
            </div>
            <span className="ms-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              {tasks.filter((task) => task.status === "completed").length}/{tasks.length}
            </span>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex min-h-44 flex-col items-center justify-center gap-3 text-slate-500">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />
                <p className="text-sm">{labels.loading}</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl bg-slate-50 px-5 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                  🗓️
                </span>
                <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
                  {labels.empty}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <article
                    key={task.id}
                    className={`rounded-2xl border p-4 transition sm:p-5 ${
                      task.status === "completed"
                        ? "border-emerald-100 bg-emerald-50/40"
                        : "border-slate-200 bg-white hover:border-emerald-200 hover:shadow-sm"
                    }`}
                  >
                    {editingId === task.id ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          aria-label="Edit task title"
                          className="min-w-0 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
                        />
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          aria-label="Edit task date"
                          className="min-w-0 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
                        />
                        <input
                          type="time"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          aria-label="Edit task time"
                          className="min-w-0 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
                        />
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value as "low" | "medium" | "high")}
                          aria-label="Edit task priority"
                          className="min-w-0 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
                        >
                          <option value="low">Low priority</option>
                          <option value="medium">Medium priority</option>
                          <option value="high">High priority</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex min-w-0 items-start gap-3">
                        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${
                          task.status === "completed" ? "bg-emerald-100" : "bg-slate-100"
                        }`}>
                          {task.status === "completed" ? "✓" : "◷"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`break-words font-bold ${
                            task.status === "completed" ? "text-slate-400 line-through" : "text-slate-900"
                          }`}>
                            {task.title}
                            {task.reminder_at && (
                              <span title={labels.reminder} className="ms-2 inline-block text-sm">
                                🔔
                              </span>
                            )}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">
                              📅 {task.task_date}
                            </span>
                            {task.start_time && (
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">
                                🕒 {task.start_time.slice(0, 5)}
                              </span>
                            )}
                            <span className={`rounded-lg px-2.5 py-1.5 font-semibold ${
                              task.priority === "high"
                                ? "bg-red-50 text-red-700"
                                : task.priority === "low"
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-amber-50 text-amber-700"
                            }`}>
                              {task.priority === "high" ? "High" : task.priority === "low" ? "Low" : "Medium"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                      {editingId === task.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void saveEdit(task)}
                            className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            ✓ {labels.save}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                          >
                            {labels.undo}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEdit(task)}
                          className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          ✏️ {labels.edit}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => void toggleComplete(task)}
                        className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        {task.status === "completed" ? `↩ ${labels.undo}` : `✓ ${labels.done}`}
                      </button>

                      <button
                        type="button"
                        onClick={() => void deleteTask(task.id)}
                        className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        🗑️ {labels.delete}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="py-7 text-center text-xs tracking-wide text-slate-400">
          OBATRA AI WORKSPACE
        </footer>
      </div>
    </main>
  );
}



































