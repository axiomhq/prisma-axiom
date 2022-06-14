import { Prisma } from '@prisma/client';
import AxiomClient, { datasets } from '@axiomhq/axiom-node';
var stringify = require('json-stable-stringify');

// get env var AXIOM_TOKEN and AXIOM_DATASET
const axiomToken = process.env.AXIOM_TOKEN;
const axiomDataset = process.env.AXIOM_DATASET;

const axiom = new AxiomClient(undefined, axiomToken);

async function logWithAxiom(params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) {
    const before = Date.now();
    var result = [];
    var err = undefined;

    // if we error, we want to log the error and send to axiom
    try {
        result = await next(params);
    } catch (e) {
        err = e;
    }

    // if axiomDataset is not set don't bother sending to axiom
    if (axiomDataset) {
        try {
            await axiom.datasets.ingestString(
                axiomDataset,
                JSON.stringify([{
                    _time: before,
                    prisma: {
                        clientVersion: Prisma.prismaVersion.client,
                        durationMs: Date.now() - before,
                        args: stringify(params.args),
                        model: params.model,
                        action: params.action,
                        dataPath: params.dataPath,
                        runInTransaction: params.runInTransaction,
                        error: stringify(err),
                    }
                }]),
                datasets.ContentType.JSON,
                datasets.ContentEncoding.Identity
            );
        }
        catch (e) {
            console.error(e);
        }
    }

    // now throw the error if we had one
    if (err != undefined) {
        throw err;
    }

    return result;
}

export default logWithAxiom;