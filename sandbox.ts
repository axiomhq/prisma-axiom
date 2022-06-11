import { PrismaClient } from '@prisma/client'
import logWithAxiom from './axiom';

const prisma = new PrismaClient({ log: [{ emit: 'event', level: 'query', }] });
prisma.$use(logWithAxiom);

const main = async () => {
  const users = await prisma.user.findMany({
    select: {
      "id": true,
      "createdAt": true
    },
    orderBy: {
      "name": "asc"
    },
    take: 100
  })
  console.log('Top users (alphabetical): ', users)
}

main()
  .catch((e) => console.error('Error in Prisma Client query: ', e))
  .finally(async () => await prisma.$disconnect())