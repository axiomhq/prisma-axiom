import { BatchSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PrismaClient } from '@prisma/client';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { otelTraceExporter } from 'prisma-axiom';

// create axiom exporter
const exporter = otelTraceExporter(process.env.AXIOM_URL || '', process.env.AXIOM_TOKEN || '');
// setup otel provider
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.npm_package_name,
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version,
  }),
})
provider.addSpanProcessor(new BatchSpanProcessor(new ConsoleSpanExporter()));
// attach axiom's exporter to a new span processor
provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register()

registerInstrumentations({
  instrumentations: [new HttpInstrumentation(), new PrismaInstrumentation()],
});

// create prisma client
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
    },
  });

  const user = await prisma.user.findFirst();
  console.log('new user created', user);

  await prisma.user.deleteMany();
}

main().finally(async () => {
  console.log('disconnect prisma')
  // shutdown the provider to ensure delivery
  await provider.shutdown()
  await prisma.$disconnect()
})
