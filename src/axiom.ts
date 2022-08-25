import { Prisma, PrismaClient } from "@prisma/client";
import { InstrumentationOption } from "@opentelemetry/instrumentation";
import AxiomClient from "@axiomhq/axiom-node";
import { throttle } from "./throttle";
import { setupOtel } from "./instrumentation";

const stringify = require("json-stable-stringify");

// get env var AXIOM_TOKEN and AXIOM_DATASET
const axiomToken = process.env.AXIOM_TOKEN;
const axiomDataset = process.env.AXIOM_DATASET || "";

interface AxiomConfig {
  additionalInstrumentations?: InstrumentationOption[];
  noInstrumentation?: boolean;
}

const defaultConfig: AxiomConfig = {
  additionalInstrumentations: [],
  noInstrumentation: false,
};

export function withAxiom(
  prisma: PrismaClient,
  config: AxiomConfig = defaultConfig
) {
  const { middleware, flush } = logWithAxiom();
  prisma.$use(middleware);
  prisma.$on("beforeExit", flush);

  if (config.noInstrumentation === false) {
    setupOtel(config.additionalInstrumentations || []);
  }

  return prisma;
}

function logWithAxiom(client?: AxiomClient) {
  let axiom: AxiomClient;
  if (client) {
    axiom = client;
  } else {
    axiom = new AxiomClient(undefined, axiomToken);
  }

  async function _ingest() {
    await axiom.datasets.ingestEvents(axiomDataset, events);

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
    // if axiomDataset is not set don't bother sending to axiom
    if (!process.env.AXIOM_DATASET) {
      return await next(params);
    }

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
        args: stringify(params.args),
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
