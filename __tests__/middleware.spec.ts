process.env.AXIOM_URL = 'https://example.org';
process.env.DATABASE_URL = 'file:./test.db';

import { PrismaClient } from '@prisma/client';
import AxiomClient from '@axiomhq/axiom-node';

import { logWithAxiom } from '../src/axiom';

describe('Axiom middleware', () => {
  jest.useFakeTimers();

  const prisma = new PrismaClient();

  const client = new AxiomClient();
  prisma.$use(logWithAxiom(client, 'test').middleware);

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
