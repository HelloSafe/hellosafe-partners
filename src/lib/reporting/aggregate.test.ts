import { describe, it, expect } from "vitest";
import { mergePerLink, type LinkMeta, type ConvStatusAgg } from "./aggregate";

const createdAt = new Date("2026-01-15T00:00:00.000Z");

const links: LinkMeta[] = [
  { linkId: "l1", label: "Link 1", destination: "mutuelle", subId: "aff-a", campaign: "spring", createdAt },
  { linkId: "l2", label: "Link 2", destination: "pno", subId: "", campaign: "", createdAt },
];

function conv(
  linkId: string | null,
  status: ConvStatusAgg["status"],
  count: number,
  amountCents: number,
  commissionCents: number,
): ConvStatusAgg {
  return { linkId, status, count, amountCents, commissionCents };
}

describe("mergePerLink", () => {
  it("buckets conversion counts by status into separate columns", () => {
    const out = mergePerLink(
      [links[0]],
      [{ linkId: "l1", clicks: 40 }],
      [
        conv("l1", "pending", 3, 30000, 4500),
        conv("l1", "validated", 2, 20000, 3000),
        conv("l1", "cancelled", 1, 10000, 1500),
      ],
    );

    expect(out[0]).toMatchObject({
      linkId: "l1",
      clicks: 40,
      pendingConv: 3,
      validatedConv: 2,
      cancelledConv: 1,
    });
  });

  it("derives revenue and commission ONLY from the validated bucket", () => {
    const out = mergePerLink(
      [links[0]],
      [{ linkId: "l1", clicks: 5 }],
      [
        conv("l1", "pending", 1, 99999, 88888), // must be ignored for money
        conv("l1", "validated", 2, 20000, 3000),
        conv("l1", "cancelled", 1, 77777, 66666), // must be ignored for money
      ],
    );

    expect(out[0].revenueCents).toBe(20000);
    expect(out[0].commissionCents).toBe(3000);
  });

  it("does NOT fan out validated money by click count (regression guard)", () => {
    // A link with many clicks must report the validated commission once, not
    // multiplied by the number of clicks (the old JOIN-then-SUM bug).
    const out = mergePerLink(
      [links[0]],
      [{ linkId: "l1", clicks: 137 }],
      [conv("l1", "validated", 1, 61620, 30810)],
    );

    expect(out[0].clicks).toBe(137);
    expect(out[0].validatedConv).toBe(1);
    expect(out[0].revenueCents).toBe(61620); // not 137×
    expect(out[0].commissionCents).toBe(30810); // not 137×
  });

  it("defaults clicks and all conversion columns to 0 when absent", () => {
    const out = mergePerLink(links, [], []);

    for (const row of out) {
      expect(row).toMatchObject({
        clicks: 0,
        pendingConv: 0,
        validatedConv: 0,
        cancelledConv: 0,
        revenueCents: 0,
        commissionCents: 0,
      });
    }
  });

  it("skips conversion rows whose linkId is null (set-null on link delete)", () => {
    const out = mergePerLink(
      [links[0]],
      [],
      [
        conv(null, "validated", 5, 50000, 9999),
        conv("l1", "validated", 1, 10000, 2000),
      ],
    );

    expect(out).toHaveLength(1);
    expect(out[0].validatedConv).toBe(1);
    expect(out[0].commissionCents).toBe(2000);
  });

  it("preserves link metadata and input ordering", () => {
    const out = mergePerLink(links, [], []);

    expect(out.map((r) => r.linkId)).toEqual(["l1", "l2"]);
    expect(out[0]).toMatchObject({
      label: "Link 1",
      destination: "mutuelle",
      subId: "aff-a",
      campaign: "spring",
      createdAt,
    });
  });
});
