import { PrismaClient } from '@prisma/client'
import faker from 'faker'

const prisma = new PrismaClient()

const NUMBER_OF_USERS = 4
const MAX_NUMBER_OF_LINKS = 5

const data = Array.from({ length: NUMBER_OF_USERS }).map(() => ({
  email: faker.internet.email(),
  name: faker.name.firstName(),
  links: Array.from({
    length: faker.datatype.number({
      min: 0,
      max: MAX_NUMBER_OF_LINKS,
    }),
  }).map(() => ({
    url: faker.internet.url(),
    shortUrl: faker.internet.domainWord(),
  })),
}))

async function main() {
  for (let entry of data) {
    await prisma.user.create({
      data: {
        name: entry.name,
        email: entry.email,
        links: {
          create: entry.links,
        },
      },
    })
  }
}

main().finally(async () => {
  await prisma.$disconnect()
})