import { describe, expect, it } from "vitest";

import { parseLlmsTxt } from "../../src/services/aeo/technical-audit/llms-txt";
import { compareNapObservation, normalizePhone } from "../../src/services/aeo/technical-audit/nap-consistency";
import { parseKeywordDemandResponse } from "../../src/services/aeo/prompts/keyword-demand";

describe("Phase 3 technical and demand audits", () => {
    it("validates the required llms.txt H1 and extracts link evidence", () => {
        const result = parseLlmsTxt("# Wolfpack BBQ\n\n> Kansas City barbecue.\n\n## Pages\n- [Menu](https://wolfpackkc.com/menu): Current menu");
        expect(result).toMatchObject({ valid: true, title: "Wolfpack BBQ", summaryPresent: true, linkCount: 1 });
    });

    it("rejects a present llms.txt file without its required H1", () => {
        expect(parseLlmsTxt("Wolfpack BBQ\n\n- [Menu](https://wolfpackkc.com/menu)")).toMatchObject({ valid: false, issues: ["missing_h1"] });
    });

    it("normalizes North American phone numbers and reports exact NAP mismatches", () => {
        expect(normalizePhone("+1 (816) 555-0123")).toBe("8165550123");
        expect(compareNapObservation(
            { name: "Wolfpack BBQ", address: "910 E 5th St, Kansas City, MO 64106", phone: "816-555-0123" },
            { name: "Wolfpack BBQ", address: "910 E Fifth Street, Kansas City MO 64106", phone: "816-555-9999" }
        )).toMatchObject({ nameMatches: true, addressMatches: false, phoneMatches: false, consistent: false });
    });

    it("keeps keyword demand explicitly estimated and provider-attributed", () => {
        const result = parseKeywordDemandResponse({
            tasks: [{ status_code: 20000, cost: 0.01, result: [{ items: [{ keyword: "best bbq kansas city", keyword_info: { search_volume: 720, monthly_searches: [{ year: 2026, month: 7, search_volume: 760 }] } }] }] }],
        }, "2026-08-18T20:00:00.000Z");
        expect(result).toEqual([{ keyword: "best bbq kansas city", monthlyVolume: 720, provider: "dataforseo", isEstimated: true, capturedAt: "2026-08-18T20:00:00.000Z", costMicroUsd: 10000 }]);
    });
});
