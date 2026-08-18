import { describe, expect, it } from "vitest";

import { buildGbpAuditChecks } from "../../src/services/aeo/technical-audit/gbp-audit-checks";
import type { GbpAuditSignals } from "../../src/services/aeo/technical-audit/gbp-audit-signals";
import {
    MIN_OWNER_PHOTOS,
    MIN_POSTS_IN_WINDOW,
    MIN_SERVICES,
    PHOTO_RECENCY_DAYS,
} from "../../src/services/aeo/technical-audit/gbp-audit-thresholds";

const NOW = new Date("2026-08-11T00:00:00Z");

function daysAgo(days: number): string {
    return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

const EMPTY_SIGNALS: GbpAuditSignals = { photos: null, posts: null, location: null };

function run(signals: Partial<GbpAuditSignals>, keywords: string[] = []) {
    const results = buildGbpAuditChecks({ ...EMPTY_SIGNALS, ...signals }, { keywords, now: NOW });
    return new Map(results.map((r) => [r.id, r]));
}

describe("GBP audit checks — the six F5.10 rows", () => {
    it("returns exactly the six ids F5.10 owns", () => {
        const ids = buildGbpAuditChecks(EMPTY_SIGNALS, { keywords: [], now: NOW }).map((r) => r.id);
        expect(ids).toEqual([
            "images",
            "post-frequency",
            "post-keywords",
            "services-list",
            "service-descriptions",
            "service-area",
        ]);
    });

    it("reports unavailable — never fail — when Google returned nothing", () => {
        const checks = run({});
        for (const id of ["images", "post-frequency", "services-list", "service-area"]) {
            expect(checks.get(id)!.status, id).toBe("unavailable");
        }
    });
});

describe("images", () => {
    const photos = (count: number, newestDaysAgo: number) => ({
        photos: {
            ownerPhotoCount: count,
            totalMediaCount: count,
            latestOwnerPhotoAt: daysAgo(newestDaysAgo),
            truncated: false,
        },
    });

    it("passes on enough recent owner photos", () => {
        expect(run(photos(MIN_OWNER_PHOTOS, 1)).get("images")!.status).toBe("pass");
    });

    it("fails one photo below the bar", () => {
        expect(run(photos(MIN_OWNER_PHOTOS - 1, 1)).get("images")!.status).toBe("fail");
    });

    it("fails when the count is fine but the newest photo is stale", () => {
        const check = run(photos(MIN_OWNER_PHOTOS + 20, PHOTO_RECENCY_DAYS + 1)).get("images")!;
        expect(check.status).toBe("fail");
        expect(check.detail).toContain(`within the last ${PHOTO_RECENCY_DAYS} days`);
    });

    it("passes exactly on the recency boundary", () => {
        expect(run(photos(MIN_OWNER_PHOTOS, PHOTO_RECENCY_DAYS)).get("images")!.status).toBe("pass");
    });

    it("fails, rather than crashes, when no photo carries a readable date", () => {
        const check = run({
            photos: { ownerPhotoCount: 12, totalMediaCount: 12, latestOwnerPhotoAt: null, truncated: false },
        }).get("images")!;
        expect(check.status).toBe("fail");
    });
});

describe("post frequency and keyword coverage", () => {
    const postSignal = (summaries: string[]) => ({
        posts: { recentSummaries: summaries, recentCount: summaries.length, windowDays: 90 },
    });

    it("passes at the post-count bar", () => {
        const summaries = Array.from({ length: MIN_POSTS_IN_WINDOW }, (_, i) => `post ${i}`);
        expect(run(postSignal(summaries)).get("post-frequency")!.status).toBe("pass");
    });

    it("fails one post below the bar", () => {
        const summaries = Array.from({ length: MIN_POSTS_IN_WINDOW - 1 }, (_, i) => `post ${i}`);
        expect(run(postSignal(summaries)).get("post-frequency")!.status).toBe("fail");
    });

    it("marks keyword coverage not-applicable when there are no posts to read", () => {
        const check = run(postSignal([]), ["plumber kansas city"]).get("post-keywords")!;
        expect(check.status).toBe("not-applicable");
        expect(check.detail).toContain("Post Frequency");
    });

    it("marks keyword coverage unavailable when we have no keywords to check against", () => {
        const check = run(postSignal(["a post"]), []).get("post-keywords")!;
        expect(check.status).toBe("unavailable");
    });

    it("passes when half the recent posts mention a tracked keyword", () => {
        const check = run(
            postSignal(["Best BBQ in Kansas City", "Closed for the holiday"]),
            ["bbq in kansas city"]
        ).get("post-keywords")!;
        expect(check.status).toBe("pass");
    });

    it("fails when fewer than half mention one, and matches case-insensitively", () => {
        const check = run(
            postSignal(["BBQ IN KANSAS CITY", "Holiday hours", "New patio"]),
            ["bbq in kansas city"]
        ).get("post-keywords")!;
        expect(check.status).toBe("fail");
        expect(check.detail).toContain("1 of 3");
    });
});

describe("services — the replaced proxy", () => {
    const services = (count: number, described: number) => ({
        location: {
            serviceItems: Array.from({ length: count }, (_, i) => ({
                freeFormServiceItem: {
                    label: { displayName: `Service ${i}`, description: i < described ? "Copy" : undefined },
                },
            })),
            serviceArea: null,
        },
    });

    it("scores the real service count, not place action links", () => {
        const check = run(services(MIN_SERVICES, MIN_SERVICES)).get("services-list")!;
        expect(check.status).toBe("pass");
        expect(check.label).toBe("Services Listed");
        expect(check.detail).toContain("service");
        // Criterion #29a: no stand-in signal may remain behind this row.
        expect(check.detail).not.toMatch(/action link|proxy/i);
    });

    it("fails one service below the bar", () => {
        expect(run(services(MIN_SERVICES - 1, 0)).get("services-list")!.status).toBe("fail");
    });

    it("counts structured service descriptions as well as free-form ones", () => {
        const check = run({
            location: {
                serviceItems: [
                    { structuredServiceItem: { serviceTypeId: "job_1", description: "Structured copy" } },
                    { freeFormServiceItem: { label: { displayName: "Two", description: "Free-form copy" } } },
                ],
                serviceArea: null,
            },
        }).get("service-descriptions")!;
        expect(check.status).toBe("pass");
        expect(check.detail).toContain("2 of 2");
    });

    it("marks descriptions not-applicable when no services are listed", () => {
        const check = run(services(0, 0)).get("service-descriptions")!;
        expect(check.status).toBe("not-applicable");
        expect(check.detail).toContain("Services Listed");
    });

    it("fails when most services carry no description", () => {
        expect(run(services(4, 1)).get("service-descriptions")!.status).toBe("fail");
    });
});

describe("service area", () => {
    const withArea = (area: GbpAuditSignals["location"] extends null ? never : object | null) => ({
        location: { serviceItems: [], serviceArea: area as never },
    });

    it("does not apply to a storefront that never travels to customers", () => {
        expect(run(withArea(null)).get("service-area")!.status).toBe("not-applicable");
    });

    it("passes a service-area business that declared its areas", () => {
        const check = run(
            withArea({
                businessType: "CUSTOMER_LOCATION_ONLY",
                places: { placeInfos: [{ placeName: "Kansas City, MO", placeId: "p1" }] },
            })
        ).get("service-area")!;
        expect(check.status).toBe("pass");
    });

    it("fails a service-area business that declared none", () => {
        const check = run(
            withArea({ businessType: "CUSTOMER_AND_BUSINESS_LOCATION", places: { placeInfos: [] } })
        ).get("service-area")!;
        expect(check.status).toBe("fail");
        expect(check.detail).toContain("Add the areas you cover");
    });
});
