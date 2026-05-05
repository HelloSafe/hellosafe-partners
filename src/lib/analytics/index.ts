/**
 * Public surface of the analytics module.
 *
 * Browser:
 *   import { track, identify, reset } from "@/lib/analytics";
 *
 * Server:
 *   import { captureServer } from "@/lib/analytics/server";
 */

export { track, identify, reset } from "./client";
export type { AnalyticsEvent, EventName, EventProps } from "./events";
