import { db } from '../db';
import { apiKeys } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { OpenAI } from 'openai';
import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import { Mistral } from '@mistralai/mistralai';

export const generateContent = async (userId: string | undefined, prompt: string, instruction: string, requestedProvider?: string) => {
  // Build an array of conditions for the query
  const conditions = [eq(apiKeys.isActive, true)];

  if (userId) {
    conditions.push(eq(apiKeys.userId, userId));
  }

  if (requestedProvider) {
    conditions.push(eq(apiKeys.provider, requestedProvider));
  }

  // Combine conditions using AND
  const queryCondition = and(...conditions);

  const [activeKey] = await db
    .select()
    .from(apiKeys)
    .where(queryCondition)
    .limit(1);

  if (!activeKey) {
    if (requestedProvider) throw new Error('NO_API_KEY_FOR_PROVIDER');
    throw new Error('NO_API_KEY');
  }

  // Continue with provider-specific generation
  const { provider, key } = activeKey;
  try {
    switch (provider) {
      case 'openai':
        return await generateWithOpenAI(key, prompt, instruction);
      case 'gemini':
        return await generateWithGemini(key, prompt, instruction);
      case 'anthropic':
        return await generateWithAnthropic(key, prompt, instruction);
      case 'mistral':
        return await generateWithMistral(key, prompt, instruction);
      case 'grok':
        return await generateWithGrok(key, prompt, instruction);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (err: any) {
    console.error(`[aiService] Error generating content with ${provider}:`, err);
    throw new Error(`Failed to generate content with ${provider}. Please check if your API key is valid.`);
  }
};

export const generateEmailTemplate = async ({ prompt, userId, provider }: { prompt: string; userId?: string; provider?: string }) => {
  try {
    const { EMAIL_TEMPLATE_SYSTEM_PROMPT } = await import('../services/aiInstructions');
    const html = await generateContent(userId, prompt, EMAIL_TEMPLATE_SYSTEM_PROMPT, provider);
    return { success: true, html };
  } catch (error: any) {
    console.error('[emailtempController] Error generating email template:', error);
    if (error.message === 'NO_API_KEY') {
      throw new Error('No active AI provider configured. Please go to Settings > API & Integrations to add and activate an API key.');
    }
    if (error.message === 'NO_API_KEY_FOR_PROVIDER') {
      throw new Error('You do not have an active API key configured for the selected provider. Please go to Settings > API & Integrations to configure it.');
    }
    throw new Error(error.message || 'An unexpected error occurred during email generation.');
  }
};

const generateWithOpenAI = async (apiKey: string, prompt: string, instruction: string) => {
  const openai = new OpenAI({ apiKey });
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: instruction },
      { role: 'user', content: prompt }
    ],
  });
  return response.choices[0].message.content || '';
};

const generateWithGrok = async (apiKey: string, prompt: string, instruction: string) => {
  const openai = new OpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' });
  const response = await openai.chat.completions.create({
    model: 'grok-beta',
    messages: [
      { role: 'system', content: instruction },
      { role: 'user', content: prompt }
    ],
  });
  return response.choices[0].message.content || '';
};

const generateWithGemini = async (apiKey: string, prompt: string, instruction: string) => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: instruction,
    }
  });
  return response.text || '';
};

const generateWithAnthropic = async (apiKey: string, prompt: string, instruction: string) => {
  const anthropic = new Anthropic({ apiKey });
  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-latest',
    max_tokens: 4000,
    system: instruction,
    messages: [
      { role: 'user', content: prompt }
    ]
  });
  return (response.content[0] as any).text || '';
};

const generateWithMistral = async (apiKey: string, prompt: string, instruction: string) => {
  const mistral = new Mistral({ apiKey });
  const response = await mistral.chat.complete({
    model: 'mistral-large-latest',
    messages: [
      { role: 'system', content: instruction },
      { role: 'user', content: prompt }
    ]
  });
  if (!response.choices || response.choices.length === 0) return '';
  const content = response.choices[0].message?.content;
  return typeof content === 'string' ? content : '';
};
