import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { InstrumentationOption, registerInstrumentations } from '@opentelemetry/instrumentation';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { Resource } from '@opentelemetry/resources';

const Version = require('../package.json').version;

export function setupOtel(axiomToken: string, axiomUrl: string, additionalInstrumentations: InstrumentationOption[]) {
  const exporter = new OTLPTraceExporter({
    url: axiomUrl + '/api/v1/traces', // url is optional and can be omitted - default is http://localhost:4318/v1/traces
    headers: {
      Authorization: `Bearer ${axiomToken}`,
      Accept: 'application/json',
      'User-Agent': 'prisma-axiom/' + Version,
    },
    concurrencyLimit: 10,
  });

  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.npm_package_name,
    }),
  });

  // TODO: use BatchSpanProcessor
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [new PrismaInstrumentation(), ...additionalInstrumentations],
  });

  provider.register();
}
