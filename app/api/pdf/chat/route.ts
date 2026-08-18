import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateText } from "@/lib/gemini";

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return NextResponse.json(
        { error: "Missing authentication token." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);

    if (authError || !user?.id) {
      console.error("PDF CHAT AUTH ERROR:", authError);

      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const documentId =
      typeof body.documentId === "string"
        ? body.documentId.trim()
        : "";

    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : "";

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required." },
        { status: 400 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 }
      );
    }

    console.log("========== PDF CHAT ==========");
    console.log("USER:", user.id);
    console.log("DOCUMENT:", documentId);
    console.log("QUESTION:", question);

    const {
      data: document,
      error: documentError,
    } = await supabaseAdmin
      .from("pdf_documents")
      .select("id, user_id, title, content, pages")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (documentError || !document) {
      console.error("PDF DOCUMENT ERROR:", documentError);

      return NextResponse.json(
        { error: "PDF document not found." },
        { status: 404 }
      );
    }

    if (!document.content) {
      return NextResponse.json(
        {
          error: "This PDF does not contain readable text.",
        },
        { status: 400 }
      );
    }

    const pdfContent = document.content;

    console.log("PDF TITLE:", document.title);
    console.log("PDF PAGES:", document.pages);
    console.log("PDF CONTENT LENGTH:", pdfContent.length);

    const prompt =
      "You are Obatra AI, an assistant that answers questions about PDF documents.\\n\\n" +
      "DOCUMENT TITLE:\\n" +
      document.title +
      "\\n\\n" +
      "DOCUMENT CONTENT:\\n" +
      pdfContent +
      "\\n\\n" +
      "USER QUESTION:\\n" +
      question +
      "\\n\\n" +
      "IMPORTANT RULES:\\n" +
      "1. Answer the exact question asked by the user.\\n" +
      "2. Use only information contained in the document.\\n" +
      "3. Search the entire document before deciding that information is missing.\\n" +
      "4. Do not invent, guess, or assume information.\\n" +
      "5. If the information is present anywhere in the document, use it in the answer.\\n" +
      "6. If the information truly does not exist in the document, answer exactly:\\n" +
      "I couldn't find that information in the document.\\n" +
      "7. Answer in the same language as the user's question.\\n" +
      "8. Keep the answer clear and direct.";

    console.log("========== GEMINI PDF CHAT ==========");

    const answer = await generateText(prompt);

    console.log("GEMINI PDF CHAT ANSWER RECEIVED");
    console.log("====================================");

    return NextResponse.json({
      success: true,
      answer,
      documentId: document.id,
      title: document.title,
      pages: document.pages,
    });
  } catch (error) {
    console.error("========== PDF CHAT ERROR ==========");
    console.error(error);
    console.error("====================================");

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "PDF chat failed.",
      },
      { status: 500 }
    );
  }
}
