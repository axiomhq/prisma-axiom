# Axiom Prisma

Axiom observability middleware for Prisma

## How to use

* Create an account at Axiom Cloud
* Create a dataset and an API token with ingest permission for that dataset
* Set env variables `AXIOM_DATASET` and `AXIOM_TOKEN`
* Insert the following in your code:
```js
import logWithAxiom from './axiom';
const prisma = new PrismaClient({ log: [{ emit: 'event', level: 'query', }] });

prisma.$use(logWithAxiom());
```