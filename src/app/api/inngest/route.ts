/**
 * Webhook endpoint Inngest's runtime hits to invoke functions. The serve
 * helper handles auth (signing key in prod), retries, step state, and
 * the `?introspect` GET that the Inngest dashboard uses to discover
 * functions.
 */

import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { functions } from "@/lib/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
