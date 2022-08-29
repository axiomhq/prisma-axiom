import { Prisma, PrismaClient } from "@prisma/client";
import { InstrumentationOption } from "@opentelemetry/instrumentation";
import AxiomClient from "@axiomhq/axiom-node";
import { throttle } from "./throttle";
import { setupOtel } from "./instrumentation";

const CloudUrl = "https://cloud.axiom.co";

interface AxiomConfig {
  axiomToken?: string;
  axiomDataset?: string;
  axiomUrl?: string,
  disableTracing?: boolean;
  additionalInstrumentations?: InstrumentationOption[];
}

const defaultConfig: AxiomConfig = {
  axiomToken: process.env.AXIOM_TOKEN,
  axiomDataset: process.env.AXIOM_DATASET,
  axiomUrl: process.env.AXIOM_URL,
  disableTracing: false,
  additionalInstrumentations: [],
};

export function withAxiom(
  prisma: PrismaClient,
  config: AxiomConfig = defaultConfig
) {
  // Merge provided config with default config to fall back to environment
  // variables if not provided.
  config = { ...defaultConfig, ...config };
  // Use the CloudURL if no URL is provided.
  config.axiomUrl = config.axiomUrl || CloudUrl;

  if (!config.axiomToken) {
    console.error("axiom: Failed to initialize prisma-axiom, you need to set an Axiom API token with ingest permission");
    return prisma;
  } else if (!config.axiomDataset) {
    console.error("axiom: No dataset provided, logs will not be sent to axiom");
  }

  if (config.axiomDataset) {
    const { middleware, flush } = logWithAxiom(config.axiomToken, config.axiomDataset);
    prisma.$use(middleware);
    prisma.$on("beforeExit", flush);
  }

  if (!config.disableTracing) {
    setupOtel(config.axiomToken, config.axiomUrl, config.additionalInstrumentations || []);
  }

  return prisma;
}

function logWithAxiom(token: string, dataset: string, client?: AxiomClient) {
  let axiom: AxiomClient;
  if (client) {
    axiom = client;
  } else {
    axiom = new AxiomClient(undefined, token);
  }

  async function _ingest() {
    await axiom.datasets.ingestEvents(dataset, events);

    // clear events
    events = [];
  }

  let events: LogEvent[] = [];
  const throttledIngest = throttle(_ingest, 1000);

  // middleware
  const middleware = async (
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<any>
  ) => {
    const before = Date.now();
    var result = [];
    var err = undefined;

    // if we error, we want to log the error and send to axiom
    try {
      result = await next(params);
    } catch (e: any) {
      console.log(e);
      err = e;
    }

    const event: LogEvent = {
      _time: before,
      level: err ? "error" : "info",
      prisma: {
        clientVersion: Prisma.prismaVersion.client,
        durationMs: Date.now() - before,
        args: JSON.stringify(params.args),
        model: params.model,
        action: params.action,
        dataPath: params.dataPath,
        runInTransaction: params.runInTransaction,
        error: err ? err.toString() : null,
      },
    };

    events.push(event);
    throttledIngest();

    return result;
  };

  const flush = async () => {
    await _ingest();
  };

  return { middleware, flush };
}

interface LogEvent {
  _time: number;
  level: string;
  prisma: {
    clientVersion: string;
    durationMs: number;
    args: any;
    model?: string;
    action: string;
    dataPath: string[];
    runInTransaction: any;
    error?: any;
  };
}

export default logWithAxiom;
