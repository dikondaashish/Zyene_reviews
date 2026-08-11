import { describe, expect, it } from "vitest";
import { detectNewTechnicalAlerts, findingKey, type FindingLike } from "../../src/services/aeo/alerting/detect-technical-alerts";

function finding(overrides: Partial<FindingLike>): FindingLike {
    return { rule: "ai_bot_blocked", severity: "critical", pageUrl: null, evidence: "x", ...overrides };
}

describe("findingKey", () => {
    it("uses a stable placeholder for run-level (null pageUrl) findings", () => {
        expect(findingKey({ rule: "ai_bot_blocked", pageUrl: null })).toBe("ai_bot_blocked:__site__");
    });

    it("distinguishes the same rule on different pages", () => {
        expect(findingKey({ rule: "http_error", pageUrl: "https://x.com/a" })).not.toBe(
            findingKey({ rule: "http_error", pageUrl: "https://x.com/b" })
        );
    });
});

describe("detectNewTechnicalAlerts", () => {
    it("flags a critical finding that was not present last run", () => {
        const current = [finding({ rule: "ai_bot_blocked", severity: "critical" })];
        const alerts = detectNewTechnicalAlerts(current, new Set());
        expect(alerts).toHaveLength(1);
    });

    it("does not re-flag a finding that already existed in the previous run", () => {
        const current = [finding({ rule: "ai_bot_blocked", severity: "critical", pageUrl: null })];
        const previous = new Set([findingKey({ rule: "ai_bot_blocked", pageUrl: null })]);
        expect(detectNewTechnicalAlerts(current, previous)).toEqual([]);
    });

    it("ignores medium/low severity findings entirely — not F8.4's concern", () => {
        const current = [finding({ severity: "medium" }), finding({ severity: "low" })];
        expect(detectNewTechnicalAlerts(current, new Set())).toEqual([]);
    });

    it("flags a NEW page-level http_error even when the site already has an unrelated critical finding", () => {
        const current = [
            finding({ rule: "ai_bot_blocked", pageUrl: null }),
            finding({ rule: "http_error", severity: "high", pageUrl: "https://x.com/new-broken-page" }),
        ];
        const previous = new Set([findingKey({ rule: "ai_bot_blocked", pageUrl: null })]);
        const alerts = detectNewTechnicalAlerts(current, previous);
        expect(alerts).toHaveLength(1);
        expect(alerts[0].pageUrl).toBe("https://x.com/new-broken-page");
    });

    it("a resolved-then-recurring finding (same key) after being absent one run is treated as new again if it's not in THIS diff's previous set", () => {
        // The caller controls what "previous" means (e.g. last run only, not all history) —
        // this test documents that behavior rather than asserting a specific history policy.
        const current = [finding({ rule: "ai_bot_blocked", pageUrl: null })];
        expect(detectNewTechnicalAlerts(current, new Set())).toHaveLength(1);
    });
});
