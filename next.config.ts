import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {};

// Sentry only uploads sourcemaps when SENTRY_AUTH_TOKEN is present. In dev
// and CI without a token, withSentryConfig is a build-time no-op for
// uploads while still wiring runtime instrumentation hooks.
const sentryEnabled = Boolean(
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
);

const withWrappers = (cfg: NextConfig) => {
  const intl = withNextIntl(cfg);
  if (!sentryEnabled) return intl;
  return withSentryConfig(intl, {
    org: process.env.SENTRY_ORG ?? "hellosafe",
    project: process.env.SENTRY_PROJECT ?? "hellosafe-partners",
    // Source maps are uploaded at build time; no token in dev means no
    // upload — Sentry runtime still reports errors, just unminified.
    authToken: process.env.SENTRY_AUTH_TOKEN,
    widenClientFileUpload: true,
    // Proxy errors through this app to bypass ad-blockers that block
    // ingest.sentry.io. The middleware (proxy.ts) excludes /monitoring.
    tunnelRoute: "/monitoring",
    silent: !process.env.CI,
  });
};

export default withWrappers(nextConfig);
