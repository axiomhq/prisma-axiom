# Axiom Prisma

Axiom observability middleware for Prisma

## How to use

- Create an account at Axiom Cloud
- Create a dataset and an API token with ingest permission for that dataset
- Set env variables `AXIOM_DATASET` and `AXIOM_TOKEN`
- Insert the following in your code:

```js
import withAxiom from 'prisma-axiom';
const prisma = withAxiom(new PrismaClient());
```

## Tracing

Using prisma-axiom empowers your application with automated configuration for tracing.
More configuration could be passed to the tracing functionality as part of `withAxiom` configuration:

```typescript
const client = withAxiom(new PrismaClient(), { additionalInstrumentations: [new HttpInstrumentation()] });
```

If you want to disable the tracing completely, this could be done by setting `setupTracing` to `false`:

```js
const client = withAxiom(new PrismaClient(), { setupTracing: false });
```
