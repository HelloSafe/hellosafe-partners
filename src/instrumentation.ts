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

  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      // PII redaction. Better Auth + the postback handler can include
      // tokens — opt out by default.
      sendDefaultPii: false,
    });
  } else if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
    });
  }
}

// Called by Next.js when a server-rendered request errors. We forward to
// Sentry so unhandled errors in App Router routes / server components show up.
// Sentry handles "no DSN configured" itself: it becomes a no-op.
export const onRequestError = Sentry.captureRequestError;
