import "server-only";
import { PostHog } from "posthog-node";
import type { EventName, EventProps } from "./events";

/**
 * Server-side PostHog. Used to capture events that originate server-side
 * (e.g. admin approves a partner, postback receives a conversion). For
 * server-fired events we don't gate on cookie consent — the visitor's
 * action already happened, and we never persist PII server-side here
 * (only the partner's stable id + non-sensitive metadata).
 *
 * Returns null when POSTHOG_KEY is unset so dev / preview deploys work.
 */

let cached: PostHog | null | undefined = undefined;

function getClient(): PostHog | null {
  if (cached !== undefined) return cached;
  const key = process.env.POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) {
    cached = null;
    return null;
  }
  cached = new PostHog(key, {
    host: process.env.POSTHOG_HOST ?? "https://eu.posthog.com",
    flushAt: 1, // capture is best-effort here, fire and forget per event
    flushInterval: 0,
  });
  return cached;
}

/**
 * Capture a server-side event. `distinctId` should be the partner id when
 * we have one, otherwise a stable session id or "anonymous-server".
 */
export function captureServer<N extends EventName>(
  distinctId: string,
  name: N,
  props: EventProps<N>,
) {
  const client = getClient();
  if (!client) return;
  client.capture({
    distinctId,
    event: name,
    properties: props,
  });
}
