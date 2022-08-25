import { withAxiom } from '../../src/axiom';
import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = withAxiom(new PrismaClient({ log: [{ emit: 'event', level: 'query', }] }));

  const user = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
    },
  });

  console.log('new user created', user);

  console.log(await prisma.user.findFirst());

  await prisma.user.deleteMany()
}

main()
