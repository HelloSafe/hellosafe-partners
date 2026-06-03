import { describe, it, expect } from "vitest";
import { attachLinkStats } from "./aggregate";

type Link = { id: string; label: string; destination: string };

const links: Link[] = [
  { id: "l1", label: "Link 1", destination: "mutuelle" },
  { id: "l2", label: "Link 2", destination: "pno" },
  { id: "l3", label: "Link 3", destination: "auto" },
];

describe("attachLinkStats", () => {
  it("attaches clicks, sales and commission by link id", () => {
    const out = attachLinkStats(
      links,
      [
        { linkId: "l1", clicks: 12 },
        { linkId: "l2", clicks: 3 },
      ],
      [
        { linkId: "l1", sales: 2, commissionCents: 5000 },
        { linkId: "l2", sales: 1, commissionCents: 1500 },
      ],
    );

    expect(out[0]).toMatchObject({ id: "l1", clicks: 12, sales: 2, commissionCents: 5000 });
    expect(out[1]).toMatchObject({ id: "l2", clicks: 3, sales: 1, commissionCents: 1500 });
  });

  it("does NOT fan out commission by click count (regression guard)", () => {
    // The old single-JOIN query summed commission once per (click × conversion)
    // row, so a link with 3 clicks reported 3× its real commission. With the
    // pre-aggregated merge, the commission must stay exactly as given.
    const out = attachLinkStats(
      [{ id: "l1", label: "x", destination: "auto" }],
      [{ linkId: "l1", clicks: 3 }],
      [{ linkId: "l1", sales: 1, commissionCents: 30810 }],
    );

    expect(out[0].clicks).toBe(3);
    expect(out[0].sales).toBe(1);
    expect(out[0].commissionCents).toBe(30810); // not 92430 (3×)
  });

  it("defaults missing clicks/sales/commission to 0", () => {
    const out = attachLinkStats(links, [{ linkId: "l1", clicks: 5 }], []);

    expect(out[0]).toMatchObject({ id: "l1", clicks: 5, sales: 0, commissionCents: 0 });
    expect(out[1]).toMatchObject({ id: "l2", clicks: 0, sales: 0, commissionCents: 0 });
    expect(out[2]).toMatchObject({ id: "l3", clicks: 0, sales: 0, commissionCents: 0 });
  });

  it("ignores sales rows whose linkId is null (conversion outlived its link)", () => {
    const out = attachLinkStats(
      [{ id: "l1", label: "x", destination: "auto" }],
      [],
      [
        { linkId: null, sales: 9, commissionCents: 99999 },
        { linkId: "l1", sales: 1, commissionCents: 100 },
      ],
    );

    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ id: "l1", sales: 1, commissionCents: 100 });
  });

  it("preserves the original link fields and ordering", () => {
    const out = attachLinkStats(links, [], []);

    expect(out.map((r) => r.id)).toEqual(["l1", "l2", "l3"]);
    expect(out[0].label).toBe("Link 1");
    expect(out[0].destination).toBe("mutuelle");
  });
});
