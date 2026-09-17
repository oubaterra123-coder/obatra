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

  summarizer: (text: string) => `
Summarize the following text clearly and accurately.

Return:
- A concise summary
- Main points
- Important details

Do not add information that is not present in the original text.

Text:
${text}
`,

  study: (mode: string, text: string) => `
You are an AI study assistant.

Study mode: ${mode}

Help the student with the following content:
${text}

Instructions:
- Give accurate and clear explanations.
- Use simple language when explaining difficult concepts.
- For questions, answer directly and explain the reasoning.
- For summaries, keep the essential information.
- For quizzes, create useful practice questions and include the answers.
- Do not invent information that is not supported by the provided content.
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

