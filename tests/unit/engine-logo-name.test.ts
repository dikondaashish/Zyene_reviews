import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { engineName } from "@/services/aeo/engines/engine-name";
import { engineLogoUrl } from "@/components/google-seo-aeo/engine-logo";
import { ANSWER_ENGINE_IDS } from "@/services/aeo/engines/engine-types";

describe("engine names and logos", () => {
    it("shows the catalog name, never the raw id", () => {
        expect(engineName("chatgpt")).toBe("ChatGPT");
        expect(engineName("google_ai_overview")).toBe("Google AI Overview");
        expect(engineName("some_new_engine")).toBe("some new engine");
    });

    it("has a sharp local logo file for every engine", () => {
        for (const id of ANSWER_ENGINE_IDS) {
            const url = engineLogoUrl(id) ?? "";
            expect(url).toMatch(/^\/integrations\/logos\/.+\.(svg|png)$/);
            expect(existsSync(join(process.cwd(), "public", url))).toBe(true);
        }
        expect(engineLogoUrl("unknown")).toBeNull();
    });
});

describe("integration brand logos", () => {
    it("serves every integrations-page brand from a local file that exists", async () => {
        const { getBrandLogoUrl } = await import("@/lib/marketing/integration-brands");
        for (const domain of ["google.com", "facebook.com", "yelp.com", "tripadvisor.com", "squareup.com", "clover.com", "toasttab.com", "zapier.com"]) {
            const url = getBrandLogoUrl(domain);
            expect(url.startsWith("/integrations/logos/")).toBe(true);
            expect(existsSync(join(process.cwd(), "public", url))).toBe(true);
        }
    });
});
