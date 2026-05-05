import "server-only";

/**
 * Structured logger for server code. Emits one JSON line per event on
 * stdout/stderr — ready to be ingested by Axiom (via their Vercel
 * integration), Better Stack, Datadog, or any log search tool that
 * understands JSON.
 *
 * Usage:
 *   import { log } from "@/lib/log";
 *   log.event("conversion.recorded", { partnerId, amountCents, status });
 *   log.warn("postback.ref_mismatch", { ref, partnerCode });
 *   log.error("mail.failed", { template, to, error });
 *
 * Why not Pino / Winston: Vercel functions are short-lived and the
 * built-in console is already piped to their log drain. We just need
 * a thin wrapper that adds level, timestamp, and the event name.
 */

type Level = "debug" | "info" | "warn" | "error";

type LogEntry = {
  ts: string;
  level: Level;
  event: string;
  // Whatever JSON-serializable payload the caller provides.
  [key: string]: unknown;
};

function emit(level: Level, event: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...(data ?? {}),
  };
  // Errors / warns go to stderr; the rest to stdout. Vercel's drain
  // tags each correctly.
  const line = JSON.stringify(entry);
  if (level === "error" || level === "warn") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const log = {
  /** Verbose dev signal. Off by default in prod via Vercel filtering. */
  debug(event: string, data?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "production") return;
    emit("debug", event, data);
  },

  /** Default level. Use for "X happened" business events. */
  event(event: string, data?: Record<string, unknown>) {
    emit("info", event, data);
  },

  /** Caller intends to alert on this in dashboards. */
  warn(event: string, data?: Record<string, unknown>) {
    emit("warn", event, data);
  },

  /**
   * Unrecoverable failure. Sentry should also catch the underlying
   * exception; this log adds context for triage in the log search.
   */
  error(event: string, data?: Record<string, unknown>) {
    emit("error", event, data);
  },
};
