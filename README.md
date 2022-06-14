# Axiom Prisma

Axiom observability middleware for Prisma

## How to use

```js
import logWithAxiom from './axiom';
const prisma = new PrismaClient({ log: [{ emit: 'event', level: 'query', }] });

prisma.$use(logWithAxiom);
```