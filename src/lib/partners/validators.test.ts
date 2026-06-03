import { describe, it, expect } from "vitest";
import { CompleteProfileSchema } from "./validators";

/** Collect the issue messages (which double as error codes) from a failed parse. */
function codes(input: unknown): string[] {
  const r = CompleteProfileSchema.safeParse(input);
  return r.success ? [] : r.error.issues.map((i) => i.message);
}

describe("CompleteProfileSchema", () => {
  it("accepts a minimal payload (company + contact only)", () => {
    const r = CompleteProfileSchema.safeParse({
      companyName: "Acme",
      contactName: "Jane",
    });
    expect(r.success).toBe(true);
  });

  it("accepts a full payload with all optional fields", () => {
    const r = CompleteProfileSchema.safeParse({
      companyName: "Acme",
      contactName: "Jane",
      website: "https://acme.com",
      audience: "Comparateur assurance",
      country: "FR",
      monthlyVisitors: 50000,
    });
    expect(r.success).toBe(true);
  });

  it("trims company and contact names", () => {
    const r = CompleteProfileSchema.safeParse({
      companyName: "  Acme  ",
      contactName: "  Jane  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyName).toBe("Acme");
      expect(r.data.contactName).toBe("Jane");
    }
  });

  it("rejects an empty / whitespace-only companyName with MISSING_FIELDS", () => {
    expect(codes({ companyName: "", contactName: "Jane" })).toContain(
      "MISSING_FIELDS",
    );
    expect(codes({ companyName: "   ", contactName: "Jane" })).toContain(
      "MISSING_FIELDS",
    );
  });

  it("rejects an empty / whitespace-only contactName with MISSING_FIELDS", () => {
    expect(codes({ companyName: "Acme", contactName: "" })).toContain(
      "MISSING_FIELDS",
    );
    expect(codes({ companyName: "Acme", contactName: "   " })).toContain(
      "MISSING_FIELDS",
    );
  });

  it("rejects a fully missing contactName", () => {
    // A wholly absent field yields zod's default required message (the custom
    // MISSING_FIELDS code only applies to a present-but-empty string); the
    // route maps any failure to MISSING_FIELDS via its fallback.
    expect(CompleteProfileSchema.safeParse({ companyName: "Acme" }).success).toBe(
      false,
    );
  });

  it("accepts monthlyVisitors as either a string or a number", () => {
    expect(
      CompleteProfileSchema.safeParse({
        companyName: "Acme",
        contactName: "Jane",
        monthlyVisitors: "50000",
      }).success,
    ).toBe(true);
    expect(
      CompleteProfileSchema.safeParse({
        companyName: "Acme",
        contactName: "Jane",
        monthlyVisitors: 50000,
      }).success,
    ).toBe(true);
  });

  it("accepts null for the optional fields", () => {
    const r = CompleteProfileSchema.safeParse({
      companyName: "Acme",
      contactName: "Jane",
      website: null,
      audience: null,
      country: null,
      monthlyVisitors: null,
    });
    expect(r.success).toBe(true);
  });
});
