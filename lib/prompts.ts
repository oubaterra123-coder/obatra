export const PROMPTS = {
  writer: (type: string, topic: string) => `
You are a professional AI writer.

Write a high-quality ${type} about:

"${topic}"

Requirements:
- Clear title
- Well-structured headings
- Professional tone
- SEO optimized
- Easy to read
- Finish with a conclusion
`,

  pdfSummary: (text: string) => `
Summarize the following PDF.

Return:
- Summary
- Key Points
- Important Facts
- Action Items

PDF Content:
${text}
`,

  translator: (text: string, language: string) => `
Translate the following text into ${language}.

Text:
${text}
`,

  chat: (message: string) => `
${message}
`,

  image: (prompt: string, style: string) => `
Create an image with this description:

${prompt}

Style:
${style}
`,
};