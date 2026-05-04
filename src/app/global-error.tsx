"use client";

/**
 * Last-resort error boundary at the root of the App Router tree.
 * Catches errors that bubble out of `[locale]/layout.tsx` and React
 * render errors anywhere in the tree. Required for Sentry to capture
 * unrecoverable client-side errors.
 *
 * Renders a minimal fallback HTML — keep this file dependency-free so it
 * survives even when the rest of the app's bundle is broken.
 */

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
