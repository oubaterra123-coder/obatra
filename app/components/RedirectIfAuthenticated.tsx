"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RedirectIfAuthenticated() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (active && !error && data.session?.user) {
        router.replace("/dashboard");
      }
    });

    return () => {
      active = false;
    };
  }, [router]);

  return null;
}
