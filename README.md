# Axiom Prisma

Axiom observability middleware for Prisma

## How to use

- Create an account at Axiom Cloud
- Create a dataset and an API token with ingest permission for that dataset
- Set env variables `AXIOM_DATASET` and `AXIOM_TOKEN`

1. Install prisma-axiom

```
npm install --save prisma-axiom
```

- Insert the following in your code:

```js
import withAxiom from 'prisma-axiom';
const prisma = withAxiom(new PrismaClient());
```

2. Enable prisma tracing flag

In the generator block of your schema.prisma file, enable the tracing feature flag:

```js
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["tracing"]
}
```

## Tracing

Using prisma-axiom empowers your application with automated configuration for tracing.
More configuration could be passed to the tracing functionality as part of `withAxiom` configuration:

```ts
const client = withAxiom(new PrismaClient(), { additionalInstrumentations: [new HttpInstrumentation()] });
```

If you want to disable the tracing completely, this could be done by setting `setupTracing` to `false`:

```js
const client = withAxiom(new PrismaClient(), { setupTracing: false });
```
