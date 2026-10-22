import { describe, expect, it } from "vitest";
import {
    getAuditGuidance,
    getScoreVerdict,
    rankByImpact,
} from "../../src/app/(dashboard)/google-seo-aeo/audit-guidance";
import type { AuditItem } from "../../src/app/(dashboard)/google-seo-aeo/google-seo-aeo-audit-utils";

const audit = (id: string): AuditItem => ({ id, label: `Label ${id}`, status: "fail", detail: "" });

describe("getAuditGuidance", () => {
    it("gives known checks a plain title and a reason", () => {
        const guidance = getAuditGuidance(audit("review-frequency"));
        expect(guidance.title).toBe("New reviews this month");
        expect(guidance.why.length).toBeGreaterThan(0);
        expect(guidance.impact).toBe("high");
    });

    it("falls back to the audit's own label for unknown checks", () => {
        expect(getAuditGuidance(audit("brand-new-check"))).toEqual({
            title: "Label brand-new-check",
            why: "",
            impact: "medium",
            effort: "",
        });
    });
});

describe("rankByImpact", () => {
    it("moves high-impact fixes first and keeps order within a tier", () => {
        const ranked = rankByImpact([audit("images"), audit("google-rating"), audit("post-frequency"), audit("review-replies")]);
        expect(ranked.map((a) => a.id)).toEqual(["google-rating", "review-replies", "images", "post-frequency"]);
    });

    it("does not mutate its input", () => {
        const input = [audit("images"), audit("google-rating")];
        rankByImpact(input);
        expect(input.map((a) => a.id)).toEqual(["images", "google-rating"]);
    });
});

describe("getScoreVerdict", () => {
    it("never grades a business when nothing was measured", () => {
        expect(getScoreVerdict(0, 0).label).toBe("Not scored yet");
    });

    it.each([
        [100, "Strong"],
        [80, "Strong"],
        [79, "Fair"],
        [50, "Fair"],
        [49, "Needs work"],
        [0, "Needs work"],
    ])("score %i reads as %s", (score, label) => {
        expect(getScoreVerdict(score, 5).label).toBe(label);
    });
});
