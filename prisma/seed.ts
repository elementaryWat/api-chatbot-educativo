import prisma from '../lib/prisma'
import fs from 'fs'
import { openai } from '../lib/openai'
import path from 'path'
import courses from './oferta-cursos.json'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('process.env.OPENAI_API_KEY is not defined. Please set it.')
}

if (!process.env.POSTGRES_URL) {
  throw new Error('process.env.POSTGRES_URL is not defined. Please set it.')
}

async function main() {
  try {
    const course = await prisma.course.findFirst({
      where: {
        nombre: 'ACTIVIDADES MUSICALES',
      },
    })
    if (course) {
      console.log('Cursos already seeded!')
      return
    }
  } catch (error) {
    console.error('Error checking if "Curso" exists in the database.')
    throw error
  }
  for (const record of courses) {
    const embedding = await generateEmbedding(`${record.nombre}: ${record.descripcionCorta}`);
    // const { embedding, ...p } = record

    let curso;
    if (record.descripcion) {
      const { descripcion, descripcionCorta, ...dataWithoutDescripcion } = record;
      curso = await prisma.course.create({
        data: {
          ...dataWithoutDescripcion,
          descripcion: descripcionCorta,
        },
      });
    } else {
      curso = await prisma.course.create({
        data: record,
      });
    }


    // Find the course with the id of the record
    // const curso = await prisma.course.findFirst({
    //   where: {
    //     nombre: record.nombre,
    //   },
    // })


    // Add the embedding
    await prisma.$executeRaw`
      UPDATE courses
      SET embedding = ${embedding}::vector
      WHERE id = ${curso?.id}
    `

    console.log(`Added ${curso?.nombre}`)

    // Update courses with url and descripcion fields defined
    // if (record.url && record.descripcion) {
    //   await prisma.course.update({
    //     where: {
    //       id: curso?.id,
    //     },
    //     data: {
    //       url: record.url,
    //       descripcion: record.descripcionCorta,
    //     },
    //   })
    // }
    await new Promise((r) => setTimeout(r, 500)); // Wait 500ms between requests;
  }

  // Uncomment the following lines if you want to generate the JSON file
  // fs.writeFileSync(
  //   path.join(__dirname, "./pokemon-with-embeddings.json"),
  //   JSON.stringify({ data }, null, 2),
  // );
  console.log('Cursos seeded successfully!')
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

async function generateEmbedding(_input: string) {
  const input = _input.replace(/\n/g, ' ')
  const embeddingData = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input,
  })
  console.log(embeddingData)
  const [{ embedding }] = (embeddingData as any).data
  return embedding
}
