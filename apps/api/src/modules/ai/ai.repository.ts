import { prisma, AiDocument, AiDocumentType } from '@ai-lms/database';

export class AiRepository {
  async saveDocumentChunk(data: {
    courseId?: string;
    lessonId?: string;
    studentId?: string;
    title: string;
    content: string;
    type: AiDocumentType;
    chunkIndex?: number;
    embedding?: number[];
  }): Promise<AiDocument> {
    const embeddingSql = data.embedding && data.embedding.length > 0
      ? `ARRAY[${data.embedding.join(',')}]::vector`
      : 'NULL';

    const result: any[] = await prisma.$queryRawUnsafe(`
      INSERT INTO ai_documents (id, title, content, type, "chunkIndex", "courseId", "lessonId", "studentId", embedding, "createdAt")
      VALUES (
        gen_random_uuid(),
        ${data.title ? `'${data.title.replace(/'/g, "''")}'` : "''"},
        ${data.content ? `'${data.content.replace(/'/g, "''")}'` : "''"},
        '${data.type}'::"AiDocumentType",
        ${data.chunkIndex ?? 0},
        ${data.courseId ? `'${data.courseId}'::uuid` : 'NULL'},
        ${data.lessonId ? `'${data.lessonId}'::uuid` : 'NULL'},
        ${data.studentId ? `'${data.studentId}'::uuid` : 'NULL'},
        ${embeddingSql},
        NOW()
      )
      RETURNING id, title, content, type, "chunkIndex", "createdAt";
    `);

    return result[0];
  }

  async similaritySearch(queryEmbedding: number[], limit = 5, courseId?: string): Promise<any[]> {
    if (!queryEmbedding || queryEmbedding.length === 0) return [];

    const vectorStr = `ARRAY[${queryEmbedding.join(',')}]::vector`;
    const courseFilter = courseId ? `AND "courseId" = '${courseId}'::uuid` : '';

    return prisma.$queryRawUnsafe(`
      SELECT id, title, content, type, 1 - (embedding <=> ${vectorStr}) AS score
      FROM ai_documents
      WHERE embedding IS NOT NULL ${courseFilter}
      ORDER BY embedding <=> ${vectorStr}
      LIMIT ${limit};
    `);
  }
}

export const aiRepository = new AiRepository();
