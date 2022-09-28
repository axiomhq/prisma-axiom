import withAxiom from 'prisma-axiom';
import { PrismaClient } from '@prisma/client';
const express = require('express')
const app = express()

const client = new PrismaClient();
const prisma = client;

app.get('/', withAxiom(async (_: any, res: any) => {
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
}));

app.listen(3000)