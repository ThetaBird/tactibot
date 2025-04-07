import { Axiom } from "@axiomhq/js";

const IS_PROD = process.env.NODE_ENV == "production";
if (IS_PROD) console.log = () => {};

// Initialize the Axiom client
const axiomClient = new Axiom({
  token: process.env.AXIOMTOKEN,
  orgId: process.env.AXIOMORG,
});

export default async function log(data: any) {
  if (!IS_PROD) return;

  try {
    // Convert to array if it's not already
    const events = Array.isArray(data) ? data : [data];

    // Ingest the events to the dataset
    axiomClient.ingest(process.env.AXIOMDATASET, events);
    await axiomClient.flush();
  } catch (error) {
    // Silently fail in production, but still return the error
    return error;
  }
}
