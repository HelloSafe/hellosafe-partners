"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Mounts at the root of the app. Tracks a `page_viewed` event on every
 * App Router transition (PostHog runs cookieless and starts on the first
 * track() call). Renders nothing visible.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if (!pathname) return;
    track("page_viewed", { path: pathname, locale });
  }, [pathname, locale]);

  return null;
}
