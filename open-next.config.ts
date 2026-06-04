import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext → Cloudflare Workers build config.
 *
 * Minimal on purpose: no incrementalCache override (no R2/KV) because the app
 * has no ISR / `revalidate` pages. If we later add ISR, wire an R2 incremental
 * cache here (and an r2_buckets binding in wrangler.jsonc).
 */
export default defineCloudflareConfig({});
