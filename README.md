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

> **Note**: This will configure Axiom from the `AXIOM_TOKEN` and other 
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

Import and use `withAxiom` function to automatically setup & configure opentelemtry
with `PrismaInstrumentation` to your axiom dashboard.

You can configure `prisma-axiom` by passing an options object as the second
parameter to `withAxiom`.

This snippet shows all available options:

```ts
const prisma = withAxiom(new PrismaClient(), {
  axiomToken:                 "xaat-xxxxx",
  axiomUrl:                   "https://my-axiom.example.org",
  additionalInstrumentations: [new HttpInstrumentation()] // add more instrumentations to the tracing setup
});
```

#### Custom Configuration

When you need setup your opentelemetry setup you can use axiom's exporter,
define axiom's exporter and attach it to the provider. You can checkout the [extends-otel example](./examples/extend-otel/index.ts)
for more details.


```ts
import { otelTraceExporter } from 'prisma-axiom';

const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.npm_package_name,
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version,
  }),
})

// create axiom's exporter object and add a new span processor:
const exporter = otelTraceExporter(process.env.AXIOM_URL, process.env.AXIOM_TOKEN);
provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register()

registerInstrumentations({
  instrumentations: [new PrismaInstrumentation(), new HttpInstrumentation()],
});

function main () {
  // ...
}

// shutdown the provider to ensure delivery
main().finally(async () => {
  await provider.shutdown()
})
```

## License

&copy; Axiom, Inc., 2022

Distributed under MIT License (`The MIT License`).

See [LICENSE](LICENSE) for more information.
