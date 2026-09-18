import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing.");
}

const gemini = new GoogleGenAI({
  apiKey,
});

// Ø§Ù„Ø¬ÙˆØ§Ø¨ Ø§Ù„Ø¹Ø§Ø¯ÙŠ
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
export async function generateProductDescription(
  imageBase64: string,
  mimeType: string,
  productDetails: string = ""
): Promise<string> {
  const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          data: imageBase64,
          mimeType,
        },
      },
      {
        text: `You are an e-commerce product description expert.

Analyze the product shown in the image and create useful product content.

${productDetails ? `Additional product details provided by the user:\n${productDetails}` : ""}

Return the result with exactly these sections:

PRODUCT TITLE
A clear and attractive product title.

SHORT DESCRIPTION
A concise description suitable for a product card.

FULL DESCRIPTION
A professional, persuasive product description based only on what can reasonably be identified from the image and provided details.

KEY FEATURES
- List the visible or reasonably identifiable features.
- Do not invent specifications that cannot be determined.

SEO KEYWORDS
Provide relevant search keywords.

IMPORTANT:
- Do not invent brand names, prices, dimensions, materials, technical specifications, or certifications unless visible or provided.
- If something cannot be determined from the image, do not claim it as a fact.
- Write the result in the same language as the user-provided product details. If the product details are in Arabic, write the result in Arabic. If they are in French, write it in French. If they are in English, write it in English. If no product details are provided, use the language requested by the user or the language most clearly indicated by the input.
`
      },
    ],
  });

  return response.text ?? "";
}