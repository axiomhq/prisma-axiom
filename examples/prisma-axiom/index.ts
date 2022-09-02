import withAxiom from '../../src/axiom';
import { PrismaClient } from '@prisma/client';
const express = require('express')
const app = express()

const client = new PrismaClient();
const prisma = withAxiom(client);

app.get('/', async (_: any, res: any) => {
  await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
    },
  });

  const user = await prisma.user.findFirst();
  console.log('new user created', user);

  await prisma.user.deleteMany();

  res.send('hello world')
});

const server = app.listen(3000)

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  // call prisma disconnect t ensure logs and traces are flushed
  prisma.$disconnect().finally(() => {
    server.close();
    process.exit(0)
  });
})
