import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { InstrumentationOption, registerInstrumentations } from '@opentelemetry/instrumentation';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { trace } from '@opentelemetry/api';
import { AxiomCloudUrl, printInitializationError } from './shared';

const Version = require('../package.json').version;

export function otelTracerProvider(
  axiomToken: string,
  axiomUrl: string,
  additionalInstrumentations: InstrumentationOption[]
): NodeTracerProvider {
  const exporter = otelTraceExporter(axiomUrl, axiomToken);

  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.npm_package_name,
    }),
  });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));

  if (trace.setGlobalTracerProvider(provider) == false) {
    provider.register();
  }

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [new PrismaInstrumentation(), ...additionalInstrumentations],
  });

  return provider;
}

export function otelTraceExporter(axiomUrl: string = '', axiomToken: string = '') {
  if (!axiomUrl || !axiomToken) {
    axiomToken = process.env.AXIOM_TOKEN || '';
    axiomUrl = process.env.AXIOM_URL || AxiomCloudUrl;
  }

  // if failed to retreive the token, exit
  if (!axiomToken) {
    printInitializationError();
    return new OTLPTraceExporter();
  }

  return new OTLPTraceExporter({
    url: axiomUrl + '/api/v1/traces',
    headers: {
      Authorization: `Bearer ${axiomToken}`,
      Accept: 'application/json',
      'User-Agent': 'prisma-axiom/' + Version,
    },
    concurrencyLimit: 10,
  });
}
