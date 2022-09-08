import { PrismaClient } from '@prisma/client';
import { InstrumentationOption } from '@opentelemetry/instrumentation';
import { setupOtel } from './otel';

const CloudUrl = 'https://cloud.axiom.co';

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
  // Use the CloudURL if no URL is provided.
  config.axiomUrl = config.axiomUrl || CloudUrl;

  if (!config.axiomToken) {
    console.error(
      'axiom: Failed to initialize prisma-axiom, you need to set an Axiom API token with ingest permission'
    );
    return prisma;
  }

  const provider = setupOtel(config.axiomToken, config.axiomUrl, config.additionalInstrumentations || []);
  prisma.$on('beforeExit', async () => {
    await provider.shutdown();
  });

  return prisma;
}
