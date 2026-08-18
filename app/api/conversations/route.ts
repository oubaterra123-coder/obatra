import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("SUPABASE ERROR MESSAGE:", error?.message); console.error("SUPABASE ERROR CODE:", error?.code); console.error("SUPABASE ERROR DETAILS:", error?.details); console.error("SUPABASE ERROR HINT:", error?.hint);
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("CONVERSATIONS SERVER ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server Error" },
      { status: 500 }
    );
  }
}

