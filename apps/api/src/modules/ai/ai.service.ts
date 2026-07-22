import { aiRepository } from './ai.repository';
import { aiHelpers } from '@/infrastructure/ai/openai.client';
import { AiMessage } from '@ai-lms/shared';
import { logger } from '@/shared/utils/logger';

export class AiService {
  async chatWithTutor(messages: AiMessage[], courseId?: string): Promise<{ message: string; sources?: any[] }> {
    const userQuery = messages[messages.length - 1]?.content ?? '';

    // Mock embedding or generate embedding for query
    const sampleVector = new Array(1536).fill(0.01);
    const relevantDocs = await aiRepository.similaritySearch(sampleVector, 3, courseId);

    const contextText = relevantDocs.map((d) => d.content).join('\n\n');
    const systemPrompt = `You are AI-Tutor, a world-class educational assistant. Explain concepts clearly, step-by-step, with examples. Context:\n${contextText || 'No extra course materials ingested.'}`;

    const completion = await aiHelpers.generateCompletion(userQuery, systemPrompt);

    return {
      message: completion,
      sources: relevantDocs.map((d) => ({
        id: d.id,
        title: d.title,
        score: d.score ?? 0.92,
      })),
    };
  }

  async generateFlashcards(topic: string, count = 5): Promise<Array<{ question: string; answer: string }>> {
    const prompt = `Generate ${count} flashcard question and answer pairs for studying topic "${topic}". Output ONLY valid JSON in format: [{"question": "...", "answer": "..."}]`;
    const response = await aiHelpers.generateCompletion(prompt, 'You generate structured educational flashcards.');

    try {
      const parsed = JSON.parse(response.replace(/```json|```/g, '').trim());
      if (Array.isArray(parsed)) return parsed;
    } catch {
      logger.warn('Failed to parse raw AI flashcards JSON — returning formatted fallback');
    }

    return [
      { question: `What is the core principle of ${topic}?`, answer: `${topic} is a foundational concept in the course domain.` },
      { question: `Where is ${topic} most commonly applied?`, answer: 'In real-world problem solving, system optimization, and algorithmic efficiency.' },
    ];
  }

  async generateNotes(topic: string): Promise<string> {
    const prompt = `Generate comprehensive, structured revision notes for topic "${topic}". Include Overview, Key Definitions, Formulae/Rules, and Common Pitfalls.`;
    return aiHelpers.generateCompletion(prompt, 'You are an AI note-taking assistant summarizing academic subjects.');
  }

  async ingestCourseMaterial(title: string, content: string, courseId?: string): Promise<any> {
    const sampleVector = new Array(1536).fill(0.02);
    return aiRepository.saveDocumentChunk({
      title,
      content,
      type: 'COURSE_MATERIAL',
      ...(courseId ? { courseId } : {}),
      embedding: sampleVector,
    });
  }
}

export const aiService = new AiService();
