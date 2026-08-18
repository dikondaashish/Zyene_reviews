import { describe, expect, it } from "vitest";

import {
    buildLocationSignal,
    buildPhotoSignal,
    buildPostSignal,
    serviceDescription,
} from "../../src/services/aeo/technical-audit/gbp-audit-signals";
import type { GoogleMediaItem } from "../../src/services/google/media";
import type { GoogleLocalPost } from "../../src/services/google/local-posts";

const NOW = new Date("2026-08-11T00:00:00Z");

function daysAgo(days: number): string {
    return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

describe("buildPhotoSignal", () => {
    it("counts owner uploads only, and reports total media separately", () => {
        const items: GoogleMediaItem[] = [
            { mediaFormat: "PHOTO", createTime: daysAgo(10) },
            { mediaFormat: "PHOTO", createTime: daysAgo(5) },
            // Customer-contributed: carries attribution, so the owner gets no credit.
            { mediaFormat: "PHOTO", createTime: daysAgo(1), attribution: { profileName: "A. Customer" } },
            // Videos are media, but they are not photos.
            { mediaFormat: "VIDEO", createTime: daysAgo(2) },
        ];

        const signal = buildPhotoSignal({ items, totalMediaItemCount: 4, truncated: false });

        expect(signal.ownerPhotoCount).toBe(2);
        expect(signal.totalMediaCount).toBe(4);
        // The customer photo is newer, but recency must track owner uploads.
        expect(signal.latestOwnerPhotoAt).toBe(daysAgo(5));
    });

    it("reports no latest date when there are no owner photos", () => {
        const signal = buildPhotoSignal({
            items: [{ mediaFormat: "PHOTO", createTime: daysAgo(1), attribution: { profileName: "X" } }],
            totalMediaItemCount: 1,
            truncated: false,
        });

        expect(signal.ownerPhotoCount).toBe(0);
        expect(signal.latestOwnerPhotoAt).toBeNull();
    });

    it("ignores createTime values Google returned unparseable", () => {
        const signal = buildPhotoSignal({
            items: [
                { mediaFormat: "PHOTO", createTime: "not-a-date" },
                { mediaFormat: "PHOTO", createTime: daysAgo(30) },
            ],
            totalMediaItemCount: 2,
            truncated: false,
        });

        expect(signal.ownerPhotoCount).toBe(2);
        expect(signal.latestOwnerPhotoAt).toBe(daysAgo(30));
    });
});

describe("buildPostSignal", () => {
    const posts: GoogleLocalPost[] = [
        { state: "LIVE", createTime: daysAgo(5), summary: "Fresh live post" },
        { state: "RECURRING", createTime: daysAgo(20), summary: "Recurring post" },
        // Excluded: not visible to searchers.
        { state: "REJECTED", createTime: daysAgo(3), summary: "Rejected post" },
        { state: "SCHEDULED", createTime: daysAgo(1), summary: "Scheduled post" },
        { state: "PROCESSING", createTime: daysAgo(2), summary: "Processing post" },
        // Excluded: outside the window.
        { state: "LIVE", createTime: daysAgo(200), summary: "Ancient post" },
    ];

    it("counts only published posts inside the window", () => {
        const signal = buildPostSignal(posts, NOW);

        expect(signal.recentCount).toBe(2);
        expect(signal.recentSummaries).toEqual(["Fresh live post", "Recurring post"]);
        expect(signal.windowDays).toBe(90);
    });

    it("orders summaries newest first", () => {
        const signal = buildPostSignal(
            [
                { state: "LIVE", createTime: daysAgo(40), summary: "older" },
                { state: "LIVE", createTime: daysAgo(2), summary: "newer" },
            ],
            NOW
        );

        expect(signal.recentSummaries).toEqual(["newer", "older"]);
    });
});

describe("serviceDescription", () => {
    it("reads the description off whichever arm of the union is set", () => {
        expect(serviceDescription({ structuredServiceItem: { description: "Structured copy" } })).toBe(
            "Structured copy"
        );
        expect(
            serviceDescription({ freeFormServiceItem: { label: { description: "Free-form copy" } } })
        ).toBe("Free-form copy");
        expect(serviceDescription({ freeFormServiceItem: { label: { displayName: "No copy" } } })).toBe("");
    });
});

describe("buildLocationSignal", () => {
    it("defaults absent service fields to empty rather than undefined", () => {
        const signal = buildLocationSignal({});
        expect(signal.serviceItems).toEqual([]);
        expect(signal.serviceArea).toBeNull();
    });
});
