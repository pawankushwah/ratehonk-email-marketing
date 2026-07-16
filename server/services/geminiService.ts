import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('[Gemini Service] Warning: GEMINI_API_KEY environment variable is not defined.');
}

const ai = new GoogleGenAI({
  apiKey: apiKey || 'dummy-key',
});

/**
 * Request Gemini completions to generate clean, inline-styled, responsive HTML emails.
 */
export const generateHTMLFromPrompt = async (prompt: string): Promise<string> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Create an email template based on the following instructions: ${prompt}`,
      config: {
        systemInstruction: `You are an expert HTML email designer. Your task is to generate production-ready HTML email templates.

Constraints:
1. Return ONLY valid, complete HTML code (starting with <!DOCTYPE html>).
2. Do NOT wrap the HTML code in markdown code blocks (i.e. no triple backticks like \`\`\`html or \`\`\`).
3. Provide NO explanations, NO introductory sentences, and NO text outside the HTML block.
4. Use inline CSS styling ONLY. Do not use external stylesheets or frameworks (like Tailwind or Bootstrap). Inline style tags are only allowed for basic media queries.
5. Create a table-based layout structure (<table>, <tr>, <td>) to ensure maximum compatibility with email clients (such as Outlook, Gmail, Apple Mail, etc.).
6. Design must be responsive, modern, professional, and visually appealing.
7. Do NOT include any JavaScript script tags.`,
        temperature: 0.7,
      }
    });

    let htmlContent = response.text || '';

    // Sanitization: Strip out any markdown code wrappers if the LLM output ignores strict constraints
    htmlContent = htmlContent.trim();
    if (htmlContent.startsWith('```html')) {
      htmlContent = htmlContent.substring(7);
    } else if (htmlContent.startsWith('```')) {
      htmlContent = htmlContent.substring(3);
    }
    if (htmlContent.endsWith('```')) {
      htmlContent = htmlContent.substring(0, htmlContent.length - 3);
    }

    return htmlContent.trim();
  } catch (error: any) {
    throw error;
  }
};
