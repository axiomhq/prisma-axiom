import { trace } from '@opentelemetry/api';
import { InstrumentationOption } from '@opentelemetry/instrumentation';
import { axiomTracerProvider } from './otel';
import { PrismaClient } from '@prisma/client';
import { AxiomCloudUrl, printInitializationError } from './shared';

// Re-export for advanced configuration
export { axiomTracerProvider, axiomTraceExporter } from './otel';

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

export default function withAxiom(prisma: PrismaClient, config: AxiomConfig = defaultConfig): PrismaClient {
  // Merge provided config with default config to fall back to environment
  // variables if not provided.
  config = { ...defaultConfig, ...config };
  config.axiomUrl = config.axiomUrl || AxiomCloudUrl;

  if (!config.axiomToken) {
    printInitializationError();
    return prisma;
  }

  const provider = axiomTracerProvider(config.axiomToken, config.axiomUrl, config.additionalInstrumentations || []);

  // Register provider
  if (trace.setGlobalTracerProvider(provider) == false) {
    provider.register();
  } else {
    console.warn('prisma-axiom: Failed to set global tracer provider.');
    console.warn(
      'prisma-axiom: Detected existing OTEL provider, see https://github.com/axiomhq/prisma-axiom#custom-configuration for advanced configuration'
    );
  }

  prisma.$on('beforeExit', async () => {
    await provider.shutdown();
  });

  return prisma;
}
