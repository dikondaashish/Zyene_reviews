import { expect, it } from "vitest";
import { isTestContact } from "@/lib/customers/test-contact";
import { selectCampaignAudience } from "@/services/campaigns/campaign-audience";
it("only treats the explicit reserved tag as a test contact", () => {
    expect(isTestContact({ tags: ["zyene:test"] })).toBe(true);
    expect(isTestContact({ tags: ["demo", "test"] })).toBe(false);
    expect(isTestContact({ tags: null })).toBe(false);
});
it("excludes tagged test contacts from campaigns without deleting them", () => {
    const base = { first_name: "Alex", last_name: null, email: "alex@example.test", phone: null, is_opted_out: false };
    const contacts = [{ ...base, id: "real" }, { ...base, id: "test", tags: ["zyene:test"] }];
    expect(selectCampaignAudience(contacts, "email").map(row => row.customerId)).toEqual(["real"]);
    expect(contacts).toHaveLength(2);
});
