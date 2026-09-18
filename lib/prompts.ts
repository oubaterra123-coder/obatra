const LANGUAGE_RULE = `
LANGUAGE RULE:
- Detect the language used by the user.
- Respond in the same language as the user's request.
- Support all languages, not only English.
- If the user writes in Moroccan Darija, respond naturally in Moroccan Darija.
- If the user writes in Arabic, respond in Arabic.
- If the user writes in French, respond in French.
- If the user writes in English, respond in English.
- If the user mixes languages, use the language that is dominant in the user's request.
- Never switch to English unless the user asks for English.
`;

export const PROMPTS = {
  writer: (type: string, topic: string) => `
${LANGUAGE_RULE}

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
${LANGUAGE_RULE}

Summarize the following text clearly and accurately.

CRITICAL LANGUAGE REQUIREMENT:
- Write the entire summary in the same language as the source text.
- Do not translate the source text into English.
- If the source is Moroccan Darija, write the summary in natural Moroccan Darija.
- Preserve the original language and meaning.

Return:
- A concise summary
- Main points
- Important details

Do not add information that is not present in the original text.

Text:
${text}
`,

  study: (mode: string, text: string) => `
${LANGUAGE_RULE}

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
${LANGUAGE_RULE}

Summarize the following PDF.

Return:
- Summary
- Key Points
- Important Facts
- Action Items

PDF Content:
${text}
`,

  email: (type: string, details: string) => `
${LANGUAGE_RULE}

You are a professional email writing assistant.

Email type:
${type}

User details:
${details}

Write a clear, natural, professional email.

Requirements:
- Include a suitable subject line.
- Use an appropriate greeting.
- Make the message clear and well structured.
- Keep the tone professional and natural.
- End with an appropriate closing.
- Do not invent important facts that were not provided.
`,

  translator: (text: string, language: string) => `
Translate the following text into ${language}.

Text:
${text}

Important:
- Translate accurately and naturally.
- Keep the original meaning and tone.
- Do not add information.
- The requested target language is ${language}.
`,

  chat: (message: string) => `
${LANGUAGE_RULE}

You are a helpful AI assistant.

User message:
${message}

Respond naturally and directly to the user.
`,

  image: (prompt: string, style: string) => `
Create an image with this description:

${prompt}

Style:
${style}
`,
};

