import "server-only";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { LimitVerdict } from "./client";

/**
 * Best-guess client IP from common reverse-proxy headers. Falls back to
 * "unknown" so the limiter still partitions per-route in degraded cases
 * (better than not limiting at all).
 */
export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/** Build a 429 response with the right headers from a limit verdict. */
export function rateLimitResponse(verdict: LimitVerdict) {
  const retryAfter =
    verdict.reset > 0 ? Math.max(1, Math.ceil((verdict.reset - Date.now()) / 1000)) : 60;
  return NextResponse.json(
    { error: "RATE_LIMITED" },
    {
      status: 429,
      headers: {
        "retry-after": String(retryAfter),
        "x-ratelimit-remaining": String(Math.max(0, verdict.remaining)),
      },
    },
  );
}
