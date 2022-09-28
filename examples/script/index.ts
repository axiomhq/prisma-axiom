import withAxiom from 'prisma-axiom';
import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

async function main(name: string) {
  console.log(name)

  await client.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
    },
  });

  const user = await client.user.findFirst();
  console.log('new user created', user);

  await client.user.deleteMany();
}

withAxiom(main)()