import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing.");
}

const gemini = new GoogleGenAI({
  apiKey,
});

// الجواب العادي
export async function generateText(prompt: string): Promise<string> {
  const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text ?? "";
}

// Streaming
export async function generateTextStream(prompt: string) {
  return await gemini.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
}