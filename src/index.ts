import { trace } from '@opentelemetry/api';
import { PrismaClient } from '@prisma/client';
import { InstrumentationOption } from '@opentelemetry/instrumentation';
import { otelTracerProvider } from './otel';

// Re-export for advanced configuration
export { otelTracerProvider, otelTraceExporter } from './otel';

const AxiomCloudUrl = 'https://cloud.axiom.co';

interface AxiomConfig {
  axiomToken?: string;
  axiomUrl?: string;
  additionalInstrumentations?: InstrumentationOption[];
}

const defaultConfig: AxiomConfig = {
  axiomToken: process.env.AXIOM_TOKEN,
  axiomUrl: process.env.AXIOM_URL,
  additionalInstrumentations: [],
};

export default function withAxiom(prisma: PrismaClient, config: AxiomConfig = defaultConfig) {
  // Merge provided config with default config to fall back to environment
  // variables if not provided.
  config = { ...defaultConfig, ...config };
  config.axiomUrl = config.axiomUrl || AxiomCloudUrl;

  if (!config.axiomToken) {
    console.error(
      'axiom: Failed to initialize prisma-axiom, you need to set an Axiom API token with ingest permission'
    );
    return prisma;
  }

  const provider = otelTracerProvider(config.axiomToken, config.axiomUrl, config.additionalInstrumentations || []);

  // Register provider
  trace.setGlobalTracerProvider(provider);
  provider.register();

  prisma.$on('beforeExit', async () => {
    await provider.shutdown();
  });

  return prisma;
}
