// Imports
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import {
  InstrumentationOption,
  registerInstrumentations,
} from "@opentelemetry/instrumentation";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import { Resource } from "@opentelemetry/resources";

const AXIOM_URL = process.env.AXIOM_URL;

const collectorOptions = {
  url: AXIOM_URL + "/api/v1/traces", // url is optional and can be omitted - default is http://localhost:4318/v1/traces
  headers: {
    Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
    // 'Content-Type': 'application/json',
    Accept: "application/json",
  }, // an optional object containing custom headers to be sent with each request
  concurrencyLimit: 10, // an optional limit on pending requests
};

export function setupOtel(additionalInstrumentations: InstrumentationOption[]) {
  console.log(collectorOptions);
  const exporter = new OTLPTraceExporter(collectorOptions);

  // Configure the trace provider
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.npm_package_name,
    }),
  });

  // Configure how spans are processed and exported. In this case we're sending spans
  // as we receive them to an OTLP-compatible collector (e.g. Jaeger).
  // TODO: use BatchSpanProcessor
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Register your auto-instrumentors
  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      new PrismaInstrumentation(),
      ...additionalInstrumentations,
    ],
  });

  // Register the provider globally
  provider.register();
}
