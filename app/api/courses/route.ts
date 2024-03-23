import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { type Course } from '@prisma/client'
import { ratelimit } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') as string;
    const { success } = await ratelimit.limit('generations')
    if (!success) throw new Error('Rate limit exceeded')

    const embedding = await generateEmbedding(query)
    const vectorQuery = `[${embedding.join(',')}]`
    const course = await prisma.$queryRaw`
      SELECT
        id,
        "nombre",
        1 - (embedding <=> ${vectorQuery}::vector) as similarity
      FROM courses
      where 1 - (embedding <=> ${vectorQuery}::vector) > .5
      ORDER BY  similarity DESC
      LIMIT 5;
    `
    return NextResponse.json(course as Array<Course & { similarity: number }>, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

async function generateEmbedding(raw: string) {
  // OpenAI recommends replacing newlines with spaces for best results
  const input = raw.replace(/\n/g, ' ')
  const embeddingData = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input,
  })
  const [{ embedding }] = (embeddingData as any).data
  return embedding
}


