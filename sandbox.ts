import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const main = async () => {
  const users = await prisma.user.findMany({
    where: {
      name: {
        startsWith: 'A',
      },
    },
  })

  console.log('Top users (alphabetical): ', users)
}

main()
  .catch((e) => console.error('Error in Prisma Client query: ', e))
  .finally(async () => await prisma.$disconnect())