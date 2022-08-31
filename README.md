# prisma-axiom [![CI](https://github.com/axiomhq/prisma-axiom/actions/workflows/ci.yml/badge.svg)](https://github.com/axiomhq/prisma-axiom/actions/workflows/ci.yml)

Axiom observability middleware for Prisma.

## Quickstart

1. Install prisma-axiom

```shell
npm install --save prisma-axiom
```

2. Add the following where you initialize your Prisma client:

```ts
import withAxiom from 'prisma-axiom';
const prisma = withAxiom(new PrismaClient());
```

> **Note**: This will configure Axiom from the `AXIOM_TOKEN` and `AXIOM_DATASET`
> environment variables. Check out the 
> [Kitchen Sink Full Configuration](#kitchen-sink-full-configuration) for more
> advanced configuration.

3. Enable the prisma tracing preview feature in `schema.prisma` like this:

```js
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["tracing"]
}
```

## Kitchen Sink Full Configuration

You can configure `prisma-axiom` by passing an options object as the second
parameter.
This snippet shows all available options:

```ts
const prisma = withAxiom(new PrismaClient(), {
  axiomToken:                 "xaat-xxxxx",
  axiomDataset:               "prisma-logs",
  axiomUrl:                   "https://my-axiom.example.org",
  setupTracing:               true, // set to false to disable tracing
  additionalInstrumentations: [new HttpInstrumentation()] // add more instrumentations to the tracing setup
});
```

## License

&copy; Axiom, Inc., 2022

Distributed under MIT License (`The MIT License`).

See [LICENSE](LICENSE) for more information.