import "server-only";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * Upstash Redis + Ratelimit. Without UPSTASH_REDIS_REST_URL +
 * UPSTASH_REDIS_REST_TOKEN, the limiters become no-ops (every request
 * succeeds), so dev / preview deploys work without an Upstash account.
 *
 * Per-route limiters are exported below. Using sliding window for
 * accuracy on tight limits (login / signup); fixed window for the hot
 * path /r/[code] where extreme throughput matters more than precision.
 */

let cachedRedis: Redis | null | undefined = undefined;

function getRedis(): Redis | null {
  if (cachedRedis !== undefined) return cachedRedis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    cachedRedis = null;
    return null;
  }
  cachedRedis = new Redis({ url, token });
  return cachedRedis;
}

export type LimitVerdict = {
  /** True when the request is allowed; false when rate-limited. */
  success: boolean;
  /** Remaining tokens in the window. -1 when no provider is configured. */
  remaining: number;
  /** Unix ms when the window resets. -1 when no provider. */
  reset: number;
};

const NOOP_VERDICT: LimitVerdict = { success: true, remaining: -1, reset: -1 };

function makeLimiter(
  prefix: string,
  build: (redis: Redis) => Ratelimit,
): (key: string) => Promise<LimitVerdict> {
  let cached: Ratelimit | null = null;
  return async (key: string) => {
    const redis = getRedis();
    if (!redis) return NOOP_VERDICT;
    if (!cached) cached = build(redis);
    const out = await cached.limit(`${prefix}:${key}`);
    return { success: out.success, remaining: out.remaining, reset: out.reset };
  };
}

/** 5 attempts / 5 min per key (typically the email or IP). */
export const loginLimiter = makeLimiter("login", (redis) =>
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "5 m"),
    analytics: true,
    prefix: "ratelimit",
  }),
);

/** 3 signups / hour per IP. */
export const signupLimiter = makeLimiter("signup", (redis) =>
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: true,
    prefix: "ratelimit",
  }),
);

/**
 * Hot path: 60 redirects / minute per IP. Fixed window favors throughput
 * over precision (a burst of 60 within 1s is OK).
 */
export const redirectLimiter = makeLimiter("redirect", (redis) =>
  new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(60, "1 m"),
    analytics: true,
    prefix: "ratelimit",
  }),
);

/** 30 postbacks / second per source IP. Defense in depth on top of bearer. */
export const postbackLimiter = makeLimiter("postback", (redis) =>
  new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(30, "1 s"),
    analytics: true,
    prefix: "ratelimit",
  }),
);

/** 20 widget analyses / minute per IP. Public, unauth'd endpoint. */
export const widgetLimiter = makeLimiter("widget", (redis) =>
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    analytics: true,
    prefix: "ratelimit",
  }),
);
