import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { prompt, style, userId } = await req.json();

    console.log("BODY:", { prompt, style, userId });

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    const finalPrompt = `${style} ${prompt}`;

    const image = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      finalPrompt
    )}`;

    if (userId) {
      const { data, error } = await supabase
        .from("images")
        .insert({
          user_id: userId,
          prompt: finalPrompt,
          image_url: image,
        })
        .select();

      console.log("INSERT DATA:", data);
      console.log("INSERT ERROR:", error);
    } else {
      console.log("NO USER ID");
    }

    return NextResponse.json({
      success: true,
      image,
    });
  } catch (error) {
    console.error("IMAGE ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}