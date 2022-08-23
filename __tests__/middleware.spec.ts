// set env vars before importing logger
process.env.AXIOM_URL = "https://test.co";
process.env.DATABASE_URL = "file:./test.db";

import { PrismaClient } from "@prisma/client";
import mockAxios from "jest-mock-axios";

import logWithAxiom from "../src/axiom";

describe("Axiom middleware", () => {
  jest.useFakeTimers();

  const prisma = new PrismaClient();
  prisma.$use(logWithAxiom);

  beforeAll(async () => {});

  it("Throttles requests to Axiom", async () => {
    await prisma.user.create({
      data: {
        name: "Alice",
        email: "alice@prisma.io",
      },
    });
    await prisma.user.findFirst();

    expect(mockAxios.post).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(1000);
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { email: "alice@prisma.io" } });
  });
});
