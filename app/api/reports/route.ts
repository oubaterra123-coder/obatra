import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const allowedTypes = ["ai_image", "ai_text", "other"] as const;
const allowedReasons = [
  "sexual_content",
  "violence",
  "hate_or_harassment",
  "dangerous_content",
  "spam",
  "other",
] as const;

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("Report API: Supabase environment configuration missing.");
      return NextResponse.json(
        { error: "Report service is not configured." },
        { status: 500 }
      );
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { content_type, reason, details } = body as {
      content_type?: unknown;
      reason?: unknown;
      details?: unknown;
    };

    if (
      typeof content_type !== "string" ||
      !allowedTypes.includes(
        content_type as (typeof allowedTypes)[number]
      ) ||
      typeof reason !== "string" ||
      !allowedReasons.includes(reason as (typeof allowedReasons)[number])
    ) {
      return NextResponse.json(
        { error: "Invalid report type or reason." },
        { status: 400 }
      );
    }

    if (
      details !== undefined &&
      details !== null &&
      (typeof details !== "string" || details.length > 1000)
    ) {
      return NextResponse.json(
        { error: "Details must be 1000 characters or fewer." },
        { status: 400 }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { error: insertError } = await adminClient
      .from("content_reports")
      .insert({
        reporter_id: user.id,
        content_type,
        reason,
        details:
          typeof details === "string" && details.trim()
            ? details.trim()
            : null,
      });

    if (insertError) {
      console.error("Report insert failed:", insertError.message);
      return NextResponse.json(
        { error: "Could not submit the report." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Report submitted successfully." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request or unexpected server error." },
      { status: 400 }
    );
  }
}
