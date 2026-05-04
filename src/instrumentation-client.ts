/**
 * Client-side Sentry boot. Runs before the app becomes interactive.
 *
 * Sentry only activates when NEXT_PUBLIC_SENTRY_DSN is set. Otherwise this
 * file is effectively a no-op.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment:
      process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    // Replay: 10% of normal sessions, 100% of sessions with errors.
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Sentry Logs feature.
    enableLogs: true,
    sendDefaultPii: false,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
  });
}

// Required by Sentry to instrument router transitions.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
