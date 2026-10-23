import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CompetitorSuggestion } from "@/lib/competitors/competitor-suggestion-types";

const mocks = vi.hoisted(() => ({ user: { id: "u1" } as { id: string } | null, business: null as Record<string, unknown> | null, lookup: vi.fn(), tracked: [] as unknown[] }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/redis", () => ({ redis: {} }));
vi.mock("@/app/actions/competitor", () => ({ addCompetitor: vi.fn() }));
vi.mock("@/lib/db/supabase/server", () => ({
    createClient: async () => ({
        auth: { getUser: async () => ({ data: { user: mocks.user } }) },
        from: () => ({ select: () => ({ eq: async () => ({ data: mocks.tracked, error: null }) }) }),
    }),
}));
vi.mock("@/lib/auth/business-context", () => ({
    getActiveBusinessId: async () => ({ businessId: mocks.business ? "biz" : null, business: mocks.business }),
}));
vi.mock("@/lib/competitors/competitor-suggestions", async (importOriginal) => ({
    ...(await importOriginal<object>()), lookupCompetitorSuggestions: mocks.lookup,
}));

const { GET } = await import("@/app/api/competitors/suggestions/route");
const { CompetitorSuggestionsList } = await import("@/app/(dashboard)/competitors/competitor-suggestions-list");
const { CompetitorsListToolbar } = await import("@/app/(dashboard)/competitors/competitors-list-toolbar");
const { CompetitorsListEmptyState } = await import("@/app/(dashboard)/competitors/competitors-list-empty-state");

const sug = (name: string, i: number, extra: Partial<CompetitorSuggestion> = {}): CompetitorSuggestion => ({
    placeId: `ChIJ${i}xxxxxxxxxx`, name, rating: 4.4, reviews: 1200 + i, distanceMiles: 0.8, address: "1 Main St",
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=ChIJ${i}xxxxxxxxxx`, ...extra,
});

describe("GET /api/competitors/suggestions", () => {
    beforeEach(() => {
        mocks.user = { id: "u1" }; mocks.tracked = []; mocks.lookup.mockReset();
        mocks.business = { name: "Taj Palace", city: "Kansas City", google_review_url: "https://search.google.com/local/writereview?placeid=ChIJown12345678", review_platforms: [] };
    });

    it("needs a signed-in user and an active business", async () => {
        mocks.user = null;
        expect((await GET()).status).toBe(401);
        mocks.user = { id: "u1" }; mocks.business = null;
        expect((await GET()).status).toBe(400);
    });

    it("passes the owner's place id and hides businesses already tracked", async () => {
        mocks.lookup.mockResolvedValue({ status: "ok", suggestions: [sug("Spice Route", 1), sug("Curry House", 2)] });
        mocks.tracked = [{ name: "Spice Route", google_url: null }];
        const body = await (await GET()).json();
        expect(mocks.lookup).toHaveBeenCalledWith({ businessId: "biz", name: "Taj Palace", city: "Kansas City", placeId: "ChIJown12345678" });
        expect(body.suggestions.map((s: CompetitorSuggestion) => s.name)).toEqual(["Curry House"]);
    });

    it("shows at most six", async () => {
        mocks.lookup.mockResolvedValue({ status: "ok", suggestions: Array.from({ length: 8 }, (_, i) => sug(`Place ${i}`, i)) });
        expect((await (await GET()).json()).suggestions).toHaveLength(6);
    });

    it("explains an empty list", async () => {
        mocks.lookup.mockResolvedValue({ status: "no_listing" });
        expect(await (await GET()).json()).toEqual({ suggestions: [], reason: "no_listing" });
    });
});

describe("suggestion list", () => {
    const render = (state: object, extra: object = {}) => renderToStaticMarkup(createElement(CompetitorSuggestionsList, {
        state: state as never, trackingId: null, onTrack: () => {}, onRetry: () => {}, ...extra,
    }));

    it("shows each business with rating, reviews, distance, a Maps link and a Track button", () => {
        const html = render({ status: "ready", suggestions: [sug("Spice Route", 1)] });
        expect(html).toContain("Spice Route");
        expect(html).toContain("4.4");
        expect(html).toContain("1,201 reviews");
        expect(html).toContain("0.8 mi away");
        expect(html).toContain('target="_blank"');
        expect(html).toContain("query_place_id=ChIJ1xxxxxxxxxx");
        expect(html).toContain('aria-label="Track Spice Route"');
    });

    it("limits how many it shows", () => {
        const html = render({ status: "ready", suggestions: [1, 2, 3, 4].map((i) => sug(`P${i}`, i)) }, { limit: 3 });
        expect(html.match(/aria-label="Track /g)).toHaveLength(3);
    });

    it("shows a spinner on the one being added and pauses the others", () => {
        const html = render({ status: "ready", suggestions: [sug("A1", 1), sug("B2", 2)] }, { trackingId: "ChIJ1xxxxxxxxxx" });
        expect(html).toContain("Adding…");
        expect(html.match(/disabled=""/g)).toHaveLength(2);
    });

    it("has loading, error, empty and no-listing states", () => {
        expect(render({ status: "loading" })).toContain('aria-busy="true"');
        expect(render({ status: "error" })).toContain("Try again");
        expect(render({ status: "ready", suggestions: [] })).toContain("couldn&#x27;t find more businesses like yours");
        expect(render({ status: "ready", suggestions: [], reason: "no_listing" })).toContain("Connect your Google Business Profile");
    });

    it("hides missing details instead of showing blanks", () => {
        const html = render({ status: "ready", suggestions: [sug("Quiet", 1, { rating: null, distanceMiles: null, address: null, reviews: 1 })] });
        expect(html).toContain("1 review<");
        expect(html).not.toContain("mi away");
    });
});

describe("where suggestions appear", () => {
    const toolbar = (competitors: unknown[]) => renderToStaticMarkup(createElement(CompetitorsListToolbar, {
        rangeOptions: [], optimisticRange: "30d" as never, setRange: () => {}, competitors: competitors as never,
        syncWatchLoading: false, onSyncCompetitorWatch: () => {}, businessId: "biz", onAddCompetitor: () => {},
    }));

    it("puts a Suggest competitors button beside Add once the owner tracks someone", () => {
        const html = toolbar([{ id: "c1", name: "X" }]);
        expect(html).toContain("Suggest competitors");
        expect(html.indexOf("Suggest competitors")).toBeLessThan(html.indexOf("Add a competitor"));
    });

    it("skips the button when nothing is tracked, because the empty state already lists suggestions", () => {
        expect(toolbar([])).not.toContain("Suggest competitors");
        const empty = renderToStaticMarkup(createElement(CompetitorsListEmptyState, { businessId: "biz", onAddCompetitor: () => {} }));
        expect(empty).toContain("Businesses like yours nearby");
        expect(empty).toContain('aria-busy="true"');
        expect(empty).toContain("Add a competitor");
    });
});
