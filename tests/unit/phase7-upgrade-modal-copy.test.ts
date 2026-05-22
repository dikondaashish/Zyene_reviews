import { describe, expect, it } from "vitest";
import { getUpgradeModalCopy } from "../../src/lib/phase7/upgrade-modal-copy";

describe("upgrade modal copy", () => {
    it("includes blueprint-specific unlock messaging", () => {
        const ai = getUpgradeModalCopy("ai_reply_limit");
        expect(ai.description).toMatch(/1,500 AI replies/i);

        const loc = getUpgradeModalCopy("business_location");
        expect(loc.description).toMatch(/Professional/i);
        expect(loc.description).toMatch(/\$59\.99/i);

        const req = getUpgradeModalCopy("review_request_limit");
        expect(req.description).toMatch(/SMS/i);
    });
});
