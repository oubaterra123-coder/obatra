"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/getUser";

const tools = [
  {
    title: "AI Chat",
    description: "Chat with AI and get fast, intelligent answers.",
    icon: "💬",
    href: "/dashboard/chat",
  },
  {
    title: "AI Writer",
    description: "Create articles, ads, emails, scripts, and more.",
    icon: "✍️",
    href: "/dashboard/writer",
  },
  {
    title: "AI Images",
    description: "Turn your ideas into creative AI-generated images.",
    icon: "🖼️",
    href: "/dashboard/image",
  },
  {
    title: "PDF AI",
    description: "Analyze documents and ask questions about your PDFs.",
    icon: "📄",
    href: "/dashboard/pdf",
  },
  {
    title: "Translator",
    description: "Translate text quickly between multiple languages.",
    icon: "🌐",
    href: "/dashboard/translator",
  },
  {
    title: "AI Summarizer",
    description: "Summarize long texts quickly and clearly with AI.",
    icon: "📝",
    href: "/dashboard/summarizer",
  },
  {
    title: "AI Study Assistant",
    description: "Learn, understand, practice, and study with AI.",
    icon: "🎓",
    href: "/dashboard/study",
  },
];

export default function DashboardHome() {
  const [plan, setPlan] = useState("Gratuit");

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getCurrentUser();

        if (profile?.plan) {
          setPlan(profile.plan);
        }
      } catch (error) {
        console.error("HOME PROFILE ERROR:", error);
      }
    }

    loadProfile();
  }, []);

  const isPro = plan.toLowerCase() === "pro";

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-10 text-white shadow-xl sm:px-10">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              ✨ Obatra AI Workspace
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Welcome to Obatra 👋
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Your all-in-one AI workspace for chatting, writing,
              creating images, analyzing documents, and translating.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/dashboard/chat"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Start Creating →
              </Link>

              <Link
                href="/dashboard/writer"
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Try AI Writer
              </Link>
            </div>
          </div>

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 right-32 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        </section>

        {/* Overview */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              AI Tools
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {tools.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Ready to use
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Workspace
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              Active
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Everything in one place
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Plan
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {isPro ? "Pro" : "Gratuit"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {isPro ? "Premium workspace" : "Upgrade anytime"}
            </p>
          </div>

        </section>

        {/* Tools */}
        <section className="mt-10">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              AI Tools
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Choose a tool and start creating.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl transition group-hover:bg-slate-900">
                    <span className="transition group-hover:scale-110">
                      {tool.icon}
                    </span>
                  </div>

                  <span className="text-sm font-medium text-slate-400 transition group-hover:text-slate-900">
                    Open →
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  {tool.title}
                </h3>

                <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                  {tool.description}
                </p>

                <div className="mt-6 text-sm font-semibold text-slate-900">
                  Get started
                  <span className="ml-2 inline-block transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Pro CTA */}
        {!isPro && (
          <section className="mt-10 overflow-hidden rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">
                <div className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Obatra Pro
                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                  Take your AI workspace further.
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Upgrade your workspace and get more from Obatra AI.
                </p>
              </div>

              <Link
                href="/dashboard/settings/pro"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Upgrade to Pro →
              </Link>

            </div>
          </section>
        )}

        {/* Footer */}
        <div className="py-8 text-center text-xs text-slate-400">
          Obatra AI · Your intelligent workspace
        </div>

      </div>
    </main>
  );
}


