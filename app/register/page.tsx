"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function register() {
    if (!name || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        console.log("User ID:", data.user.id);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            name,
            email,
          })
          .select();

        console.log("Profile:", profileData);
        console.log("Profile Error:", profileError);
      }

      alert("Account created successfully! Please check your email.");
      router.push("/login");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold">
          Create Account
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Join Obatra AI
        </p>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-6 w-full rounded-xl border p-3"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-4 w-full rounded-xl border p-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-4 w-full rounded-xl border p-3"
        />

        <button
          onClick={register}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-purple-600 py-3 text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-purple-600"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}