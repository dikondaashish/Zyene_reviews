import { describe, expect, it } from "vitest";
import { summarizeAudits } from "../../src/app/(dashboard)/google-seo-aeo/audit-presentation";

describe("summarizeAudits", () => {
    it("separates actionable failures from completed and unscored checks", () => {
        const summary = summarizeAudits([
            {
                id: "rating",
                label: "Google Rating",
                status: "pass",
                detail: "Healthy",
            },
            {
                id: "posts",
                label: "Post Frequency",
                status: "fail",
                detail: "No posts",
            },
            {
                id: "keywords",
                label: "Post Keywords",
                status: "not-applicable",
                detail: "No posts",
            },
            {
                id: "description",
                label: "Business Description",
                status: "fail",
                detail: "Needs keywords",
            },
        ]);

        expect(summary).toEqual({
            needsAttention: [
                {
                    id: "posts",
                    label: "Post Frequency",
                    status: "fail",
                    detail: "No posts",
                },
                {
                    id: "description",
                    label: "Business Description",
                    status: "fail",
                    detail: "Needs keywords",
                },
            ],
            onTrack: [
                {
                    id: "rating",
                    label: "Google Rating",
                    status: "pass",
                    detail: "Healthy",
                },
            ],
            unscored: [
                {
                    id: "keywords",
                    label: "Post Keywords",
                    status: "not-applicable",
                    detail: "No posts",
                },
            ],
        });
    });
});
