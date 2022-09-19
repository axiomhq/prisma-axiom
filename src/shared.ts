export const AxiomCloudUrl = 'https://cloud.axiom.co';

export function printInitializationError() {
  console.error('axiom: Failed to initialize prisma-axiom, you need to set an Axiom API token with ingest permission');
}
