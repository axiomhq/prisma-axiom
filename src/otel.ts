import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { AxiomCloudUrl, printInitializationError } from './shared';

const Version = require('../package.json').version;

export function axiomTraceExporter(axiomUrl: string = '', axiomToken: string = '') {
  if (!axiomUrl || !axiomToken) {
    axiomToken = process.env.AXIOM_TOKEN || '';
    axiomUrl = process.env.AXIOM_URL || AxiomCloudUrl;
  }

  // if failed to retreive the token, exit
  if (!axiomToken) {
    printInitializationError();
    return new OTLPTraceExporter();
  }

  return new OTLPTraceExporter({
    url: axiomUrl + '/api/v1/traces',
    headers: {
      Authorization: `Bearer ${axiomToken}`,
      Accept: 'application/json',
      'User-Agent': 'prisma-axiom/' + Version,
    },
    concurrencyLimit: 10,
  });
}
