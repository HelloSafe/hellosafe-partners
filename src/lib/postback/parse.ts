/** Pure helpers for the postback module — no IO, safe to unit-test. */

/** Convert a euro amount (number or numeric string) to integer cents. */
export function toCents(v: number | string | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

/**
 * Parse the "<partnerCode>-<shortCode>" ref. partnerCode itself contains a
 * dash (e.g. "hs-abc123") so we split on the LAST dash.
 */
export function splitRef(
  ref: string,
): { partnerCode: string; shortCode: string } | null {
  const lastDash = ref.lastIndexOf("-");
  if (lastDash < 0) return null;
  return {
    partnerCode: ref.slice(0, lastDash),
    shortCode: ref.slice(lastDash + 1),
  };
}
