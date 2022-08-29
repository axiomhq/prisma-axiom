// set env vars before importing logger
process.env.AXIOM_URL = 'https://test.co';
process.env.AXIOM_DATASET = 'test';
process.env.DATABASE_URL = 'file:./test.db';

import { PrismaClient } from '@prisma/client';
import AxiomClient from '@axiomhq/axiom-node';

import logWithAxiom from '../src/axiom';

describe('Axiom middleware', () => {
  jest.useFakeTimers();

  const prisma = new PrismaClient();

  const client = new AxiomClient();
  prisma.$use(logWithAxiom(client).middleware);

  beforeAll(async () => {});

  it('Throttles requests to Axiom', async () => {
    await prisma.user.create({
      data: {
        name: 'Alice',
        email: 'alice@prisma.io',
      },
    });
    await prisma.user.findFirst();

    expect(client.datasets.ingestEvents).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(1000);
    expect(client.datasets.ingestEvents).toHaveBeenCalledTimes(1);
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { email: 'alice@prisma.io' } });
  });
});
