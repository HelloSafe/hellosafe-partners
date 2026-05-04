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
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    disableLogger: true,
    automaticVercelMonitors: false,
  });
};

export default withWrappers(nextConfig);
