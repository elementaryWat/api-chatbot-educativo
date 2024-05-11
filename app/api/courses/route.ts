import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { type Course } from '@prisma/client'
import { ratelimit } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') as string;
    const nivel = searchParams.get('nivel') as string;
    const { success } = await ratelimit.limit('generations')
    if (!success) throw new Error('Rate limit exceeded')

    const embedding = await generateEmbedding(query)
    const vectorQuery = `[${embedding.join(',')}]`
    const courses = await prisma.$queryRaw`
    WITH TopCourses AS (
        SELECT
            c.id,
            c.nombre,
            c.url,
            c.descripcion,
            1 - (c.embedding <=> ${vectorQuery}::vector) as similarity
        FROM courses c
        WHERE 1 - (c.embedding <=> ${vectorQuery}::vector) >= 0.8
          AND c.nivel <= ${Number(nivel)}
          AND c.nivel > 0
        ORDER BY similarity DESC
        LIMIT 5
    )
    SELECT
        tc.id,
        tc.nombre,
        tc.url,
        tc.descripcion,
        tc.similarity,
        array(
            SELECT json_build_object(
                'nombre', s.nombre,
                'departamento', s.departamento,
                'localidad', s.localidad,
                'calle', s.calle
            )
            FROM schools s
            JOIN courses c ON s.codigo = ANY(c.ubicaciones)
            WHERE c.id = tc.id
            ORDER BY ST_Distance(s.location, ST_SetSRID(ST_MakePoint(-34.790775, -55.921293), 4326)::geography) ASC
            LIMIT 5
        ) AS closest_locations
    FROM TopCourses tc;
    `
    return NextResponse.json({ courses: courses as Array<Course & { similarity: number }> }, { status: 200 });
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


