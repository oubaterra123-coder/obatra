"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const router = useRouter();

  const [name, setName] = useState("User");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (!error && profile) {
        setName(profile.name);
      } else {
        setName(user.user_metadata?.name || "User");
      }

      setEmail(user.email || "");
    }

    getUser();
  }, [router]);

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    router.replace("/login");
  }

  return (
    <header className="flex items-center justify-between border-b bg-white px-8 py-4">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <p className="text-sm text-gray-500">
          Welcome back, {name} 👋
        </p>

        <p className="text-xs text-gray-400">
          {email}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
          Upgrade
        </button>

        <button
          onClick={logout}
          className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
        >
          Logout
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
          {name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}