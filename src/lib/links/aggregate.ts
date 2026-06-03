/**
 * Pure helper to attach per-link click + non-cancelled sales/commission stats
 * to a list of links. No IO, unit-testable.
 *
 * Callers pre-aggregate clicks and conversions in separate flat GROUP BY
 * queries and merge here. This replaces the previous pattern that LEFT JOINed
 * both clicks AND conversions before SUMming — which fanned out the commission
 * sum by the per-link click count (a link with 3 clicks reported 3x its real
 * commission).
 */

export type LinkClicks = { linkId: string; clicks: number };
export type LinkSales = {
  linkId: string | null;
  sales: number;
  commissionCents: number;
};

export function attachLinkStats<T extends { id: string }>(
  links: T[],
  clickRows: LinkClicks[],
  salesRows: LinkSales[],
): (T & { clicks: number; sales: number; commissionCents: number })[] {
  const clicksByLink = new Map<string, number>();
  for (const c of clickRows) clicksByLink.set(c.linkId, c.clicks);

  const salesByLink = new Map<string, LinkSales>();
  for (const s of salesRows) {
    if (s.linkId != null) salesByLink.set(s.linkId, s);
  }

  return links.map((l) => ({
    ...l,
    clicks: clicksByLink.get(l.id) ?? 0,
    sales: salesByLink.get(l.id)?.sales ?? 0,
    commissionCents: salesByLink.get(l.id)?.commissionCents ?? 0,
  }));
}
