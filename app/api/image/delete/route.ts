import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization");
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: "Server configuration error." },
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
        { success: false, error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    const body: unknown = await req.json();

    if (
      !body ||
      typeof body !== "object" ||
      !("id" in body) ||
      typeof body.id !== "string" ||
      !body.id.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Valid image id is required." },
        { status: 400 }
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: image, error: lookupError } = await admin
      .from("images")
      .select("id")
      .eq("id", body.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (lookupError) {
      console.error("IMAGE DELETE LOOKUP ERROR:", lookupError.message);
      return NextResponse.json(
        { success: false, error: "Could not verify image ownership." },
        { status: 500 }
      );
    }

    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image not found." },
        { status: 404 }
      );
    }

    const { error: deleteError } = await admin
      .from("images")
      .delete()
      .eq("id", body.id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("IMAGE DELETE ERROR:", deleteError.message);
      return NextResponse.json(
        { success: false, error: "Could not delete image." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("IMAGE DELETE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request or server error." },
      { status: 400 }
    );
  }
}
