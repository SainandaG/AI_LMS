import OpenAI from 'openai';
import { env } from '@/config/env';
import { logger } from '@/shared/utils/logger';

export const openai = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: env.GROQ_API_KEY || 'dummy-key',
});

export const aiHelpers = {
  async generateCompletion(prompt: string, systemPrompt = 'You are an expert educational AI assistant.'): Promise<string> {
    if (!env.GROQ_API_KEY || env.GROQ_API_KEY.includes('placeholder') || env.GROQ_API_KEY.includes('dummy')) {
      logger.warn('Groq API Key not set — returning structured demo AI response');
      return `[AI Generated Plan]\nTopic: ${prompt}\n\n1. Overview & Learning Objectives\n2. Key Concepts & Vocabulary\n3. Interactive Class Discussion Points\n4. Recommended Homework Assignment`;
    }

    try {
      const response = await openai.chat.completions.create({
        model: env.GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content ?? 'No response generated.';
    } catch (err) {
      logger.error({ err }, 'OpenAI API call failed');
      return `[AI Generation Fallback]\nTopic: ${prompt}\n\n1. Core Objectives\n2. Key Takeaways\n3. Review Questions`;
    }
  },
};
