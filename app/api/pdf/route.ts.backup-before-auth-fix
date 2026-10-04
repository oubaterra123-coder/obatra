import { NextResponse } from "next/server";
import PDFParser from "pdf2json";
import { generateText } from "@/lib/gemini";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function parsePDF(buffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();

    parser.on("pdfParser_dataError", (error: any) => {
      reject(error?.parserError || error);
    });

    parser.on("pdfParser_dataReady", (data: any) => {
      resolve(data);
    });

    parser.parseBuffer(buffer);
  });
}

function extractText(data: any): string {
  if (!data?.Pages) return "";

  const result: string[] = [];

  for (const page of data.Pages) {
    if (!page?.Texts) continue;

    for (const item of page.Texts) {
      if (!item?.R) continue;

      for (const run of item.R) {
        if (!run?.T) continue;

        try {
          result.push(decodeURIComponent(run.T));
        } catch {
          result.push(run.T);
        }
      }
    }
  }

  return result.join(" ").replace(/\s+/g, " ").trim();
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");

    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const token = auth.substring(7);

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const file = formData.get("file");
    const questionValue = formData.get("question");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select a PDF file." },
        { status: 400 }
      );
    }

    const question =
      typeof questionValue === "string" && questionValue.trim()
        ? questionValue.trim()
        : "Summarize this PDF.";

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "Only PDF files are allowed." },
        { status: 400 }
      );
    }

    console.log("========== PDF ==========");
    console.log("FILE:", file.name);
    console.log("USER:", user.id);

    const buffer = Buffer.from(await file.arrayBuffer());

    const pdfData = await parsePDF(buffer);

    const text = extractText(pdfData);
    const pages = pdfData?.Pages?.length || 0;

    console.log("PAGES:", pages);
    console.log("TEXT:", text.length);

    if (!text) {
      return NextResponse.json(
        {
          error:
            "No readable text found in this PDF."
        },
        { status: 400 }
      );
    }

    const fileName = safeFileName(file.name);
    const filePath = `${user.id}/${Date.now()}-${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("pdfs")
      .upload(filePath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("UPLOAD ERROR:", uploadError);

      return NextResponse.json(
        {
          error: uploadError.message,
        },
        { status: 500 }
      );
    }

    const { data: document, error: databaseError } =
      await supabaseAdmin
        .from("pdf_documents")
        .insert({
          user_id: user.id,
          title: file.name,
          content: text,
          pages: pages,
        })
        .select()
        .single();

    if (databaseError) {
      console.error("DATABASE ERROR:", databaseError);

      await supabaseAdmin.storage
        .from("pdfs")
        .remove([filePath]);

      return NextResponse.json(
        {
          error: databaseError.message,
        },
        { status: 500 }
      );
    }

    const pdfContent = text.substring(0, 30000);

    const prompt = `
You are an AI assistant specialized in PDF analysis.

PDF CONTENT:
${pdfContent}

USER QUESTION:
${question}

RULES:
- Answer only using information found in the PDF.
- Never invent information.
- If the answer is not in the PDF, say:
"I couldn't find that information in the document."
- Answer clearly and directly.
`;

    const answer = await generateText(prompt);

    console.log("GEMINI ANSWER RECEIVED");
    console.log("DOCUMENT:", document.id);

    return NextResponse.json({
      success: true,
      answer: answer,
      documentId: document.id,
      title: document.title,
      pages: pages,
    });
  } catch (error) {
    console.error("PDF ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "PDF processing failed.",
      },
      { status: 500 }
    );
  }
}