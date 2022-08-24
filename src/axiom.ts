import { Prisma } from "@prisma/client";
import AxiomClient from "@axiomhq/axiom-node";
import { throttle } from "./throttle";
const stringify = require("json-stable-stringify");

// get env var AXIOM_TOKEN and AXIOM_DATASET
const axiomToken = process.env.AXIOM_TOKEN;
const axiomDataset = process.env.AXIOM_DATASET || "";

class Axiom {
  client: AxiomClient;
  throttledIngest = throttle(this._ingest, 1000);
  events: LogEvent[] = [];

  constructor(client?: AxiomClient) {
    if (client) {
      this.client = client;
    } else {
      this.client = new AxiomClient(undefined, axiomToken);
    }
  }

  _ingest() {
    this.client.datasets.ingestEvents(axiomDataset, this.events);

    // clear events
    this.events = [];
  }

  middleware = async (
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

    this.events.push(event);
    this.throttledIngest();

    return result;
  };
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

export default Axiom;
