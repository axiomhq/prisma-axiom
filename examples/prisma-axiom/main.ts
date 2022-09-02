import withAxiom from '../../src/axiom';
import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();
const prisma = withAxiom(client);

async function main() {
  await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
    },
  });

  const user = await prisma.user.findFirst();
  console.log('new user created', user);

  await prisma.user.deleteMany();

}

main().finally(async () => {
  console.log('disconnct prisma')
  await prisma.$disconnect()
})