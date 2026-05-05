import "server-only";
import { Inngest } from "inngest";

/**
 * Inngest client used by the app to fire events.
 *
 * Dev: run `npx inngest-cli@latest dev` and the SDK auto-connects to
 * http://localhost:8288. No env vars required.
 *
 * Prod: set INNGEST_EVENT_KEY (and INNGEST_SIGNING_KEY for the webhook
 * endpoint) in Vercel; the SDK auto-detects the cloud target.
 *
 * Without keys, `inngest.send()` resolves but the event is dropped — so
 * dev / preview deploys work without an Inngest account.
 *
 * Event shapes are documented in ./events.ts (used as type-level docs;
 * the v4 SDK has moved away from a single client-level schema bag).
 */
export const inngest = new Inngest({
  id: "hellosafe-partners",
});
