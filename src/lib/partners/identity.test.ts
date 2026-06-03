import { describe, it, expect } from "vitest";
import { derivePartnerIdentity } from "./identity";

describe("derivePartnerIdentity", () => {
  it("uses the real name when present (Google case)", () => {
    expect(derivePartnerIdentity({ name: "Acme Corp", email: "x@acme.com" })).toEqual(
      { companyName: "Acme Corp", contactName: "Acme Corp" },
    );
  });

  it("trims surrounding whitespace from the name", () => {
    expect(
      derivePartnerIdentity({ name: "  Acme  ", email: "x@acme.com" }),
    ).toEqual({ companyName: "Acme", contactName: "Acme" });
  });

  it("falls back to the email local-part when name is missing", () => {
    expect(
      derivePartnerIdentity({ name: null, email: "john.doe@example.com" }),
    ).toEqual({ companyName: "john.doe", contactName: "john.doe" });
    expect(derivePartnerIdentity({ email: "bob@y.com" })).toEqual({
      companyName: "bob",
      contactName: "bob",
    });
  });

  it("falls back to the local-part when name is only whitespace", () => {
    expect(derivePartnerIdentity({ name: "   ", email: "jane@x.com" })).toEqual({
      companyName: "jane",
      contactName: "jane",
    });
  });

  it("last-resort 'Partenaire' when name and local-part are both empty", () => {
    // companyName is NOT NULL in the DB — a row must never be blank.
    expect(derivePartnerIdentity({ name: null, email: "@nodomain.com" })).toEqual(
      { companyName: "Partenaire", contactName: "Partenaire" },
    );
  });

  it("always returns companyName === contactName", () => {
    const r = derivePartnerIdentity({ name: "Solo", email: "s@s.com" });
    expect(r.companyName).toBe(r.contactName);
  });
});
