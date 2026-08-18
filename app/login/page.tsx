"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function login() {
    if (!email || !password) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      alert("Welcome back!");

      router.replace("/dashboard");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Login failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold">
          Welcome Back
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Login to Obatra AI
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-6 w-full rounded-xl border p-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-4 w-full rounded-xl border p-3"
        />

        <button
          onClick={login}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="mt-6 text-center text-sm">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-600"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}