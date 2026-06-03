import { describe, it, expect } from "vitest";
import { toCents, splitRef } from "./parse";
import { PostbackPayloadSchema } from "./validators";

describe("toCents", () => {
  it("converts euros (number) to integer cents", () => {
    expect(toCents(89)).toBe(8900);
    expect(toCents(13.35)).toBe(1335);
  });

  it("converts numeric strings", () => {
    expect(toCents("79")).toBe(7900);
    expect(toCents("9.99")).toBe(999);
  });

  it("rounds to the nearest cent", () => {
    expect(toCents(0.014)).toBe(1); // 1.4 → 1
    expect(toCents(0.016)).toBe(2); // 1.6 → 2
  });

  it("returns 0 for undefined / null / non-finite", () => {
    expect(toCents(undefined)).toBe(0);
    expect(toCents("not-a-number")).toBe(0);
    expect(toCents(Infinity)).toBe(0);
    expect(toCents("1e999")).toBe(0); // parseFloat → Infinity
  });
});

describe("splitRef", () => {
  it("splits on the LAST dash (partnerCode itself contains a dash)", () => {
    expect(splitRef("hs-abc123-shortcode")).toEqual({
      partnerCode: "hs-abc123",
      shortCode: "shortcode",
    });
  });

  it("handles a single dash", () => {
    expect(splitRef("partner-link")).toEqual({
      partnerCode: "partner",
      shortCode: "link",
    });
  });

  it("returns null when there is no dash", () => {
    expect(splitRef("nodash")).toBeNull();
  });
});

describe("PostbackPayloadSchema", () => {
  const base = { ref: "hs-abc123-xyz", externalOrderId: "ORDER-1" };

  it("accepts a valid payload", () => {
    const r = PostbackPayloadSchema.safeParse({
      ...base,
      amount: 89,
      commission: 13.35,
      currency: "EUR",
      status: "validated",
    });
    expect(r.success).toBe(true);
  });

  it("accepts numeric-string amounts", () => {
    const r = PostbackPayloadSchema.safeParse({ ...base, amount: "89.00" });
    expect(r.success).toBe(true);
  });

  it("rejects negative amounts (ledger integrity)", () => {
    expect(PostbackPayloadSchema.safeParse({ ...base, amount: -5 }).success).toBe(
      false,
    );
    expect(
      PostbackPayloadSchema.safeParse({ ...base, commission: "-1.5" }).success,
    ).toBe(false);
  });

  it("rejects a non 3-letter currency", () => {
    expect(
      PostbackPayloadSchema.safeParse({ ...base, currency: "EUROS" }).success,
    ).toBe(false);
  });

  it("requires ref and externalOrderId", () => {
    expect(PostbackPayloadSchema.safeParse({ externalOrderId: "x" }).success).toBe(
      false,
    );
    expect(PostbackPayloadSchema.safeParse({ ref: "x" }).success).toBe(false);
  });
});
