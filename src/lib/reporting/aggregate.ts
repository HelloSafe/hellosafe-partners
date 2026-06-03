/**
 * Pure merge helpers for the per-link reporting breakdown — no IO, unit-testable.
 *
 * The route layer pre-aggregates clicks and conversions in flat, indexed,
 * GROUP BY queries (one scan each) and hands the grouped rows here to be
 * stitched onto the link list. This avoids both the N+1 correlated subqueries
 * and the JOIN fan-out that inflates SUMs when a link has clicks AND
 * conversions in the same query.
 */

export type ConvStatus = "pending" | "validated" | "cancelled";

export type LinkMeta = {
  linkId: string;
  label: string;
  destination: string;
  subId: string;
  campaign: string;
  createdAt: Date;
};

export type ClickCount = { linkId: string; clicks: number };

export type ConvStatusAgg = {
  linkId: string | null;
  status: ConvStatus;
  count: number;
  amountCents: number;
  commissionCents: number;
};

export type PerLinkRow = LinkMeta & {
  clicks: number;
  pendingConv: number;
  validatedConv: number;
  cancelledConv: number;
  /** Validated gross revenue, in cents. */
  revenueCents: number;
  /** Validated commission, in cents. */
  commissionCents: number;
};

export function mergePerLink(
  links: LinkMeta[],
  clickRows: ClickCount[],
  convRows: ConvStatusAgg[],
): PerLinkRow[] {
  const clicksByLink = new Map<string, number>();
  for (const c of clickRows) clicksByLink.set(c.linkId, c.clicks);

  const convByLink = new Map<string, Partial<Record<ConvStatus, ConvStatusAgg>>>();
  for (const r of convRows) {
    if (r.linkId == null) continue; // conversions can outlive their link (set null)
    const bucket = convByLink.get(r.linkId) ?? {};
    bucket[r.status] = r;
    convByLink.set(r.linkId, bucket);
  }

  return links.map((link) => {
    const b = convByLink.get(link.linkId) ?? {};
    return {
      ...link,
      clicks: clicksByLink.get(link.linkId) ?? 0,
      pendingConv: b.pending?.count ?? 0,
      validatedConv: b.validated?.count ?? 0,
      cancelledConv: b.cancelled?.count ?? 0,
      revenueCents: b.validated?.amountCents ?? 0,
      commissionCents: b.validated?.commissionCents ?? 0,
    };
  });
}
