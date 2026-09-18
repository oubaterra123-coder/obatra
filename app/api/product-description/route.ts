import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateProductDescription } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { imageBase64, mimeType, productDetails } = body;

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    const result = await generateProductDescription(
      imageBase64,
      mimeType,
      productDetails || ""
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("PRODUCT DESCRIPTION ERROR:", error);

    return NextResponse.json(
      { error: "Failed to generate product description" },
      { status: 500 }
    );
  }
}
