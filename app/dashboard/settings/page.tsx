"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogout() {
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      window.location.href = "/";
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
      setMessage("Could not log out. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Settings ⚙️
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your Obatra account and preferences.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Account
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Manage your account settings.
            </p>

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700">
                Obatra Account
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Your account is protected by Supabase Authentication.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              AI Preferences 🤖
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Your AI tools are powered by Obatra AI.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border p-4">
                <p className="font-semibold">AI Chat</p>
                <p className="mt-1 text-sm text-gray-500">
                  Chat with your AI assistant.
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="font-semibold">PDF AI</p>
                <p className="mt-1 text-sm text-gray-500">
                  Analyze PDFs and ask questions.
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="font-semibold">AI Writer</p>
                <p className="mt-1 text-sm text-gray-500">
                  Create content with AI.
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="font-semibold">AI Images</p>
                <p className="mt-1 text-sm text-gray-500">
                  Generate images with AI.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Account Actions
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Sign out from your Obatra account.
            </p>

            {message && (
              <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                {message}
              </div>
            )}

            <button
              onClick={handleLogout}
              disabled={loading}
              className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Logging out..." : "Log out"}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
