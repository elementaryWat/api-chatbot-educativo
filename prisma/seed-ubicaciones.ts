import prisma from '../lib/prisma';
import courses from './radicaciones.json'


if (!process.env.POSTGRES_URL) {
  throw new Error('process.env.POSTGRES_URL is not defined. Please set it.');
}

// Function to read the schools data from a JSON file

async function main() {

  // Check if schools have already been seeded
  const schoolCount = await prisma.school.count();
  // if (schoolCount > 0) {
  //   console.log('Schools already seeded!');
  //   return;
  // }

  // Seed schools
  for (const school of courses) {
    try {
      const { telefono, ...schoolData } = school;
      const createdSchool = await prisma.school.create({
        data: {
          ...schoolData,
          nro: typeof schoolData.nro === 'number' ? schoolData.nro : 0,
          latitud: typeof schoolData.latitud === 'string' ? parseFloat(schoolData.latitud) : schoolData.latitud,
          longitud: typeof schoolData.longitud === 'string' ? parseFloat(schoolData.longitud) : schoolData.longitud,
        },
      });
      console.log(`Added school: ${createdSchool.nombre}`);
    } catch (error) {
      console.error('Error adding school:', error);
      throw error;
    }
    await new Promise((r) => setTimeout(r, 500)); // To avoid rate limits, if any
  }

  console.log('Schools seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
