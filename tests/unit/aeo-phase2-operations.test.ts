import { describe, expect, it } from "vitest";
import { detectCompetitorOvertakes, detectNegativeSentimentSpike, type CompetitiveMentionFact } from "@/services/aeo/alerting/detect-competitive-alerts";
import { mineReviewThemes } from "@/services/aeo/content-briefs/review-mining";
import { findUncitedRelevantPages } from "@/services/aeo/analytics/uncited-page-gaps";
import { recommendationDelta } from "@/services/aeo/content-briefs/recommendation-impact";
import { reportPeriod, nextReportSend } from "@/services/aeo/reporting/report-schedule";
import { renderAeoReportHtml } from "@/services/aeo/reporting/report-html";
import { renderAeoReportPdf } from "@/services/aeo/reporting/report-pdf";
import type { AeoReportModel } from "@/services/aeo/reporting/report-model";

function fact(sampleId: string, at: string, kind: CompetitiveMentionFact["brandKind"], label: string, sentiment: CompetitiveMentionFact["sentiment"] = "neutral"): CompetitiveMentionFact {
    return { promptId: "p1", sampleId, sampledAt: at, brandKind: kind, brandLabel: label, sentiment };
}

describe("Phase 2 operational analytics", () => {
    it("detects a competitor moving ahead and a negative sentiment spike", () => {
        const facts = [
            fact("s1", "2026-01-01", "own", "Us", "positive"), fact("s2", "2026-01-02", "own", "Us", "neutral"),
            fact("s3", "2026-01-03", "own", "Us", "positive"), fact("s4", "2026-01-04", "competitor", "Them"),
            fact("s5", "2026-01-05", "competitor", "Them"), fact("s6", "2026-01-06", "competitor", "Them"), fact("s7", "2026-01-07", "competitor", "Them"),
            fact("s4", "2026-01-04", "own", "Us", "negative"), fact("s5", "2026-01-05", "own", "Us", "negative"),
            fact("s6", "2026-01-06", "own", "Us", "negative"),
        ];
        expect(detectCompetitorOvertakes(facts)[0]?.competitor).toBe("Them");
        expect(detectNegativeSentimentSpike(facts)?.recentRate).toBe(1);
    });

    it("mines recurring review themes without inventing any", () => {
        const themes = mineReviewThemes(["Fast friendly service", "Friendly staff and fast response", "The service was friendly"]);
        expect(themes.map((row) => row.theme)).toContain("friendly");
        expect(themes.find((row) => row.theme === "friendly")?.mentions).toBe(3);
    });

    it("finds an uncited page only when its terms overlap a real prompt", () => {
        const gaps = findUncitedRelevantPages({
            pages: [{ url: "https://example.com/emergency-plumber", text: "Emergency plumber in Austin" }],
            prompts: [{ id: "p1", text: "book an emergency plumber in Austin" }],
            citedUrls: new Set(),
        });
        expect(gaps[0]?.url).toContain("emergency-plumber");
        expect(findUncitedRelevantPages({ pages: gaps.map((row) => ({ url: row.url, text: row.prompt })), prompts: [{ id: "p1", text: gaps[0]!.prompt }], citedUrls: new Set([gaps[0]!.url]) })).toEqual([]);
    });

    it("measures recommendation impact against the stored baseline", () => {
        expect(recommendationDelta(
            { successfulSamples: 10, visibilityRate: 0.2, targetCitations: 1 },
            { successfulSamples: 12, visibilityRate: 0.5, targetCitations: 4 }
        )).toMatchObject({ visibilityDelta: 0.3, citationDelta: 3, successfulSamples: 12 });
    });
});

describe("Phase 2 reporting", () => {
    const model: AeoReportModel = { brandName: "Zyene", businessName: "A & B", periodStart: "2026-01-01", periodEnd: "2026-01-31", visibilityPercent: 50, successfulSamples: 4, totalSamples: 5, citations: 3, ownCitations: 1, competitorMentions: 2, technicalFindings: 1, topPrompts: [{ prompt: "best <service>", named: 2, samples: 4 }] };

    it("renders escaped branded HTML and a non-empty PDF", () => {
        const html = renderAeoReportHtml(model);
        expect(html).toContain("A &amp; B"); expect(html).not.toContain("best <service>");
        expect(renderAeoReportPdf(model).byteLength).toBeGreaterThan(500);
    });

    it("computes calendar periods and next sends", () => {
        expect(reportPeriod("weekly", new Date("2026-02-10T12:00:00Z"))).toEqual({ start: "2026-02-03", end: "2026-02-09" });
        expect(nextReportSend("monthly", new Date("2026-01-15T00:00:00Z"))).toContain("2026-02-15");
    });
});
