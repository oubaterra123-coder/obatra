"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getStoredLanguage } from "@/lib/i18n/language";
import type { Language } from "@/lib/i18n/translations";

const ui = {
  fr: {
    title: "Description de produit IA",
    subtitle: "Ajoutez une image et laissez l’IA créer un contenu produit prêt à l’emploi.",
    image: "Image du produit",
    upload: "Cliquez pour téléverser une image",
    formats: "JPG, PNG ou WEBP",
    details: "Détails facultatifs : marque, public cible, etc.",
    generate: "Générer la description",
    generating: "Génération en cours...",
    result: "Résultat IA",
    empty: "La description de votre produit apparaîtra ici.",
    uploadError: "Veuillez téléverser une image du produit.",
    login: "Veuillez vous connecter d’abord.",
    failed: "Échec de la génération de la description.",
    readError: "Impossible de lire l’image.",
    unexpected: "Une erreur est survenue.",
  },
  en: {
    title: "AI Product Description",
    subtitle: "Upload a product image and let AI create ready-to-use product content.",
    image: "Product Image",
    upload: "Click to upload an image",
    formats: "JPG, PNG or WEBP",
    details: "Optional product details, brand, target audience, etc.",
    generate: "Generate Product Description",
    generating: "Generating...",
    result: "AI Result",
    empty: "Your product description will appear here.",
    uploadError: "Please upload a product image.",
    login: "Please log in first.",
    failed: "Failed to generate product description.",
    readError: "Failed to read image.",
    unexpected: "Something went wrong.",
  },
  ar: {
    title: "وصف المنتج بالذكاء الاصطناعي",
    subtitle: "ارفع صورة المنتج ودع الذكاء الاصطناعي ينشئ محتوى جاهزًا للاستخدام.",
    image: "صورة المنتج",
    upload: "اضغط لرفع صورة",
    formats: "JPG أو PNG أو WEBP",
    details: "تفاصيل اختيارية عن المنتج والعلامة التجارية والجمهور المستهدف...",
    generate: "إنشاء وصف المنتج",
    generating: "جارٍ الإنشاء...",
    result: "نتيجة الذكاء الاصطناعي",
    empty: "سيظهر وصف المنتج هنا.",
    uploadError: "يرجى رفع صورة المنتج.",
    login: "يرجى تسجيل الدخول أولًا.",
    failed: "تعذر إنشاء وصف المنتج.",
    readError: "تعذرت قراءة الصورة.",
    unexpected: "حدث خطأ غير متوقع.",
  },
  es: {
    title: "Descripción de producto con IA",
    subtitle: "Sube una imagen y deja que la IA cree contenido listo para usar.",
    image: "Imagen del producto",
    upload: "Haz clic para subir una imagen",
    formats: "JPG, PNG o WEBP",
    details: "Detalles opcionales: marca, público objetivo, etc.",
    generate: "Generar descripción",
    generating: "Generando...",
    result: "Resultado de IA",
    empty: "La descripción del producto aparecerá aquí.",
    uploadError: "Sube una imagen del producto.",
    login: "Inicia sesión primero.",
    failed: "No se pudo generar la descripción.",
    readError: "No se pudo leer la imagen.",
    unexpected: "Ha ocurrido un error.",
  },
  de: {
    title: "KI-Produktbeschreibung",
    subtitle: "Lade ein Produktbild hoch und erstelle mit KI fertige Produktinhalte.",
    image: "Produktbild",
    upload: "Klicken, um ein Bild hochzuladen",
    formats: "JPG, PNG oder WEBP",
    details: "Optionale Angaben: Marke, Zielgruppe usw.",
    generate: "Produktbeschreibung erstellen",
    generating: "Wird erstellt...",
    result: "KI-Ergebnis",
    empty: "Deine Produktbeschreibung erscheint hier.",
    uploadError: "Bitte lade ein Produktbild hoch.",
    login: "Bitte melde dich zuerst an.",
    failed: "Produktbeschreibung konnte nicht erstellt werden.",
    readError: "Bild konnte nicht gelesen werden.",
    unexpected: "Ein Fehler ist aufgetreten.",
  },
  it: {
    title: "Descrizione prodotto con IA",
    subtitle: "Carica un'immagine e lascia che l'IA crei contenuti pronti all'uso.",
    image: "Immagine del prodotto",
    upload: "Clicca per caricare un'immagine",
    formats: "JPG, PNG o WEBP",
    details: "Dettagli facoltativi: marca, pubblico di riferimento, ecc.",
    generate: "Genera descrizione prodotto",
    generating: "Generazione in corso...",
    result: "Risultato IA",
    empty: "La descrizione del prodotto apparirà qui.",
    uploadError: "Carica un'immagine del prodotto.",
    login: "Accedi prima di continuare.",
    failed: "Impossibile generare la descrizione del prodotto.",
    readError: "Impossibile leggere l'immagine.",
    unexpected: "Si è verificato un errore.",
  },
} as const;

export default function ProductDescriptionPage() {
  const [lang, setLang] = useState<Language>("fr");
  React.useEffect(() => {
    const updateLanguage = (event?: Event) => {
      const selected = event ? (event as CustomEvent<Language>).detail : getStoredLanguage();
      setLang(selected);
    };
    updateLanguage();
    window.addEventListener("obatra-language-change", updateLanguage);
    return () => window.removeEventListener("obatra-language-change", updateLanguage);
  }, []);
  const t = ui[lang];

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  React.useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);
  const [details, setDetails] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateDescription() {
    if (!image) {
      alert(t.uploadError);
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert(t.login);
        return;
      }

      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const base64 = String(reader.result).split(",")[1];

          const response = await fetch("/api/product-description", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              imageBase64: base64,
              mimeType: image.type,
              productDetails: details,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Generation failed");
          }

          setResult(data.result);
        } catch (error) {
          console.error(error);
          alert(t.failed);
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setLoading(false);
        alert(t.readError);
      };

      reader.readAsDataURL(image);
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert(t.unexpected);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/50 px-4 py-7 sm:px-6 lg:px-8" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-6xl">
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 p-6 text-white shadow-xl sm:p-9">
          <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl ring-1 ring-white/20">
              🛍️
            </div>
            <div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">OBATRA AI</span>
              <h1 className="mt-3 text-2xl font-extrabold sm:text-4xl">{t.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-purple-100 sm:text-base">{t.subtitle}</p>
            </div>
          </div>
        </header>

        <div className="mt-7 grid items-start gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/40 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-xl">📸</div>
              <div>
                <h2 className="font-bold text-slate-900">{t.image}</h2>
                <p className="text-sm text-slate-500">{t.formats}</p>
              </div>
            </div>

            <label className="block cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-violet-400 hover:bg-violet-50/40">
              {imagePreview ? (
                <div className="p-3">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="max-h-80 w-full rounded-xl object-contain"
                  />
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{image?.name}</p>
                      <p className="mt-1 text-xs text-emerald-600">✓ Image sélectionnée</p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-700">Changer</span>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-56 flex-col items-center justify-center p-6 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-3xl">🖼️</span>
                  <p className="mt-4 font-semibold text-slate-800">{t.upload}</p>
                  <p className="mt-2 text-sm text-slate-500">{t.formats}</p>
                </div>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0] || null;
                  setImage(selected);
                  setImagePreview(selected ? URL.createObjectURL(selected) : "");
                }}
              />
            </label>

            <label className="mt-5 block text-sm font-semibold text-slate-800">{t.details}</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t.details}
              className="mt-2 min-h-32 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
            />

            <button
              type="button"
              onClick={generateDescription}
              disabled={loading || !image}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-bold text-white shadow-md shadow-violet-700/20 transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  {t.generating}
                </>
              ) : (
                <>✨ {t.generate} <span>→</span></>
              )}
            </button>
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-xl">✨</div>
              <div>
                <h2 className="font-bold text-slate-900">{t.result}</h2>
                <p className="text-sm text-slate-500">OBATRA AI</p>
              </div>
              <span className="ms-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">AI</span>
            </div>

            <div className="min-h-72 p-5 sm:p-6">
              {result ? (
                <div className="whitespace-pre-wrap break-words rounded-2xl bg-slate-50 p-5 text-sm leading-8 text-slate-700">
                  {result}
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl bg-slate-50 px-5 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">📝</span>
                  <p className="mt-4 font-semibold text-slate-700">{t.empty}</p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">{t.subtitle}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <p className="py-6 text-center text-xs text-slate-400">OBATRA AI WORKSPACE</p>
      </div>
    </main>
  );
}




