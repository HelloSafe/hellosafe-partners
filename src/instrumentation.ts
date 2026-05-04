/**
 * Next.js root instrumentation. Boots Sentry on Node and Edge runtimes.
 *
 * Sentry only activates when SENTRY_DSN is set. Without it everything
 * downgrades to a no-op so local dev and CI work without a Sentry account.
 */

import * as Sentry from "@sentry/nextjs";

export async function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  const common = {
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    // 100% trace sampling in dev for fast feedback, 10% in production.
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    // Sentry Logs feature: opt-in, enables Sentry.logger.* + log search.
    enableLogs: true,
    // PII redaction. Better Auth + the postback handler can include
    // tokens — opt out by default. Flip to true once you have a scrubber.
    sendDefaultPii: false,
  } as const;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      ...common,
      // Attach local variable values to stack frames (Node-only).
      includeLocalVariables: true,
    });
  } else if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init(common);
  }
}

// Called by Next.js when a server-rendered request errors. We forward to
// Sentry so unhandled errors in App Router routes / server components show up.
// Sentry handles "no DSN configured" itself: it becomes a no-op.
export const onRequestError = Sentry.captureRequestError;
