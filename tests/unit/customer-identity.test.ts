import { describe, expect, it } from "vitest";

import {
  customerIdentityMatches,
  normalizeCustomerEmail,
  normalizeCustomerPhone,
} from "@/lib/customers/identity";

describe("customer identity normalization", () => {
  it("normalizes email case and whitespace", () => {
    expect(normalizeCustomerEmail("  Karthik.Reddy@Zyene.com ")).toBe(
      "karthik.reddy@zyene.com",
    );
    expect(normalizeCustomerEmail("   ")).toBeNull();
  });

  it("normalizes North American phone formatting to one identity", () => {
    expect(normalizeCustomerPhone("(972) 555-0199")).toBe("+19725550199");
    expect(normalizeCustomerPhone("+1 972-555-0199")).toBe("+19725550199");
    expect(normalizeCustomerPhone("not a phone")).toBeNull();
  });

  it("matches when either normalized email or phone is shared", () => {
    const emailOnly = { email: "person@example.com", phone: null };
    const phoneOnly = { email: null, phone: "+1 (972) 555-0199" };

    expect(
      customerIdentityMatches(emailOnly, {
        email: " PERSON@example.com ",
        phone: "+1 214 555 0100",
      }),
    ).toBe(true);
    expect(
      customerIdentityMatches(phoneOnly, {
        email: "other@example.com",
        phone: "9725550199",
      }),
    ).toBe(true);
    expect(customerIdentityMatches(emailOnly, phoneOnly)).toBe(false);
  });
});
