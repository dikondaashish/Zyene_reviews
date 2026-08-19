import { describe, expect, it } from "vitest";

import { promptDetailRedirect } from "@/services/aeo/prompt-detail-navigation";

describe("promptDetailRedirect", () => {
    it("redirects an unavailable prompt to the tenant-scoped prompt list", () => {
        expect(promptDetailRedirect({ kind: "not-found" })).toBe("/google-seo-aeo/prompts");
    });

    it("does not redirect an available prompt", () => {
        expect(promptDetailRedirect({ kind: "ok" })).toBeNull();
    });
});
