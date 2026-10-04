import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateText } from "@/lib/gemini";
import { PROMPTS } from "@/lib/prompts";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  console.log("========== API CHAT ==========");

  try {
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const accessToken = authorization.substring(7);

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (userError || !user) {
      console.error("SUPABASE AUTH ERROR:", userError);

      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired authentication session.",
        },
        { status: 401 }
      );
    }

    console.log("CHAT USER:", user.id);

    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("PROFILE ERROR:", profileError);

      return NextResponse.json(
        {
          success: false,
          error: "User profile not found.",
        },
        { status: 404 }
      );
    }

    console.log("USER PLAN:", profile.plan);

    const { message, conversationId } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required.",
        },
        { status: 400 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversation ID is required.",
        },
        { status: 400 }
      );
    }

    console.log("Conversation:", conversationId);

    const {
      data: conversation,
      error: conversationError,
    } = await supabaseAdmin
      .from("conversations")
      .select("id, title, user_id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (conversationError || !conversation) {
      console.error("CONVERSATION ERROR:", conversationError);

      return NextResponse.json(
        {
          success: false,
          error: "Conversation not found or access denied.",
        },
        { status: 404 }
      );
    }

    let prompt = "";

    if (message.startsWith("SUMMARIZE::")) {
      const text = message.substring("SUMMARIZE::".length);
      prompt = PROMPTS.summarizer(text);
    } else if (message.startsWith("STUDY::")) {
      const [, mode, ...textParts] = message.split("::");
      const text = textParts.join("::");
      prompt = PROMPTS.study(mode, text);
    } else if (message.startsWith("EMAIL::")) {
      const [, type, ...detailsParts] = message.split("::");
      const details = detailsParts.join("::");
      prompt = PROMPTS.email(type, details);
    } else if (message.startsWith("WRITE::")) {
      const [, type, topic] = message.split("::");
      prompt = PROMPTS.writer(type, topic);
    } else if (message.startsWith("TRANSLATE::")) {
      const [, language, text] = message.split("::");
      prompt = PROMPTS.translator(text, language);
    } else {
      prompt = PROMPTS.chat(message);
    }

    console.log("Generating Gemini response...");

    const reply = await generateText(prompt);

    console.log("Gemini OK");

    if (conversation.title === "New Chat") {
      const title =
        message.length > 40
          ? message.substring(0, 40) + "..."
          : message;

      const { error: titleError } = await supabaseAdmin
        .from("conversations")
        .update({
          title,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId)
        .eq("user_id", user.id);

      if (titleError) {
        console.error("TITLE UPDATE ERROR:", titleError);
      }
    }

    const { data, error } = await supabaseAdmin
      .from("messages")
      .insert([
        {
          conversation_id: conversationId,
          role: "user",
          content: message,
        },
        {
          conversation_id: conversationId,
          role: "assistant",
          content: reply,
        },
      ])
      .select();

    if (error) {
      console.error("SUPABASE ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    console.log("MESSAGE SAVED:", data);

    return NextResponse.json({
      success: true,
      reply,
      plan: profile.plan,
    });
  } catch (error) {
    console.error("CHAT API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}






