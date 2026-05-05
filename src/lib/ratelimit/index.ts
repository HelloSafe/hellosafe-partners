/**
 * Public surface of the ratelimit module.
 *
 * Usage in a route handler:
 *   const verdict = await loginLimiter(clientIp(req));
 *   if (!verdict.success) return rateLimitResponse(verdict);
 */

export {
  loginLimiter,
  signupLimiter,
  redirectLimiter,
  postbackLimiter,
} from "./client";
export type { LimitVerdict } from "./client";
export { clientIp, rateLimitResponse } from "./helpers";
