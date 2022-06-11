import { Prisma } from '@prisma/client'
import AxiomClient, { datasets } from '@axiomhq/axiom-node';

// get env var AXIOM_TOKEN
const axiomToken = process.env.AXIOM_TOKEN;
// get env var AXIOM_DATASET
const axiomDataset = process.env.AXIOM_DATASET;

const axiom = new AxiomClient(undefined, axiomToken);

async function logWithAxiom(params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) {
    const before = Date.now();
    var result = [];
    var err = undefined;

    // if we error out, we want to log the error and send to axiom
    try {
        result = await next(params);
    } catch (e) {
        err = e;
    }

    // if axiomDataset is not set don't bother sending to axiom
    if (axiomDataset) {
        try {
            const res = await axiom.datasets.ingestString(
                axiomDataset,
                JSON.stringify([{
                    _time: before,
                    prisma: {
                        clientVersion: Prisma.prismaVersion.client,
                        durationMs: Date.now() - before,
                        ...params,
                        error: err,
                        resultLength: result ? result.length : undefined
                    }
                }]),
                datasets.ContentType.JSON,
                datasets.ContentEncoding.Identity
            );
            console.log(res);
        }
        catch (e) {
            console.error(e);
        }
    }

    return result;
}

export default logWithAxiom;