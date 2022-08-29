import { withAxiom } from '../../src/axiom';
import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = withAxiom(new PrismaClient());

  await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
    },
  });

  const user = await prisma.user.findFirst()
  console.log('new user created', user);

  await prisma.user.deleteMany()
}

main()
