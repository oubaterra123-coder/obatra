import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not found." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt,
    });

    const image =
      response.generatedImages?.[0]?.image?.imageBytes;

    if (!image) {
      return NextResponse.json(
        { error: "Image generation failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image: `data:image/png;base64,${image}`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Server Error",
      },
      { status: 500 }
    );
  }
}