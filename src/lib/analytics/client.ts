"use client";

import posthog from "posthog-js";
import type { EventName, EventProps } from "./events";

/**
 * Browser-side analytics. PostHog runs in cookieless mode (memory only,
 * no cross-site cookies, no session recording) so we don't need a cookie
 * banner under EU rules. Trade-off: PostHog can't recognize the same
 * anonymous visitor across browser sessions — but we identify them as
 * soon as they log in, so the partner journey is still tracked end to
 * end once they're a known user.
 *
 * Initializes lazily on first call to track() / identify(). Fully
 * no-ops if NEXT_PUBLIC_POSTHOG_KEY is unset (dev / preview deploys).
 */

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.posthog.com";

let initialized = false;

function ensureInit() {
  if (initialized || !KEY || typeof window === "undefined") return;
  posthog.init(KEY, {
    api_host: HOST,
    // In-memory only. No localStorage, no cookies.
    persistence: "memory",
    disable_session_recording: true,
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    // Avoid the /decide poll: we don't use feature flags here yet.
    advanced_disable_decide: true,
  });
  initialized = true;
}

/** Identify the current user (call after successful login). */
export function identify(
  userId: string,
  traits?: Record<string, string | number | boolean | null>,
) {
  ensureInit();
  if (!initialized) return;
  posthog.identify(userId, traits);
}

/** Reset identity (call on logout). */
export function reset() {
  if (!initialized) return;
  posthog.reset();
}

/** Strongly-typed event capture. No-op if NEXT_PUBLIC_POSTHOG_KEY is unset. */
export function track<N extends EventName>(name: N, props: EventProps<N>) {
  ensureInit();
  if (!initialized) return;
  posthog.capture(name, props);
}
