import { InstrumentationOption } from '@opentelemetry/instrumentation';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import { axiomTraceExporter } from './otel';
import { AxiomCloudUrl, printInitializationError } from './shared';

// Re-export for advanced configuration
export { axiomTraceExporter } from './otel';

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

export default function withAxiom<T>(fn: (...args: any[]) => Promise<T>, config: AxiomConfig = defaultConfig): (...args: any[]) => Promise<T> {
  // Merge provided config with default config to fall back to environment
  // variables if not provided.
  config = { ...defaultConfig, ...config };
  config.axiomUrl = config.axiomUrl || AxiomCloudUrl;

  if (!config.axiomToken) {
    printInitializationError();
    return fn; // Return early if no token is provided.
  }

  let instrumentations: any[] = [new PrismaInstrumentation()]; // TODO: Remove any
  if (config.additionalInstrumentations) {
    instrumentations.concat(config.additionalInstrumentations);
  }

  const sdk = new NodeSDK({
    traceExporter: axiomTraceExporter(config.axiomUrl, config.axiomToken),
    instrumentations,
  });

  // Add service name + version attributes
  sdk.addResource(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.npm_package_name,
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version,
    })
  );

  return async (...args: any[]) => {
    await sdk.start()
    const res = await fn(...args);
    await sdk.shutdown();
    return res;
  }
}
