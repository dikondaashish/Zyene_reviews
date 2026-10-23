import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { countReviewsByStatus } from "@/lib/reviews/status-counts";
import { ReviewsFilters } from "@/components/reviews/reviews-filters";

type Filter = [string, unknown];

/** Minimal stand-in for the Supabase count query: records filters, answers from `answer`. */
function fakeSupabase(answer: (filters: Filter[]) => { count: number | null; error: unknown }) {
    const calls: Filter[][] = [];
    const client = {
        from(table: string) {
            const filters: Filter[] = [["table", table]];
            calls.push(filters);
            const query = {
                select: () => query,
                eq(column: string, value: unknown) {
                    filters.push([column, value]);
                    return query;
                },
                then: (resolve: (v: unknown) => void) => resolve(answer(filters)),
            };
            return query;
        },
    };
    return { client: client as never, calls };
}

describe("countReviewsByStatus", () => {
    it("counts visible reviews of this business for each inbox filter", async () => {
        const byStatus: Record<string, number> = { pending: 12, responded: 340, ignored: 3 };
        const { client, calls } = fakeSupabase((f) => ({ count: byStatus[String(f.find(([c]) => c === "response_status")?.[1])], error: null }));

        await expect(countReviewsByStatus(client, "biz-1")).resolves.toEqual({ needs_response: 12, responded: 340, ignored: 3 });
        expect(calls).toHaveLength(3);
        for (const filters of calls) {
            expect(filters).toContainEqual(["table", "reviews"]);
            expect(filters).toContainEqual(["business_id", "biz-1"]);
            expect(filters).toContainEqual(["is_visible", true]);
        }
    });

    it("returns null instead of a wrong number when any count fails", async () => {
        const { client } = fakeSupabase((f) =>
            f.some(([c, v]) => c === "response_status" && v === "ignored") ? { count: null, error: { message: "boom" } } : { count: 5, error: null },
        );
        await expect(countReviewsByStatus(client, "biz-1")).resolves.toBeNull();
    });
});

const filters = { status: "needs_response", rating: "all", sort: "newest" };
const render = (counts: Parameters<typeof ReviewsFilters>[0]["counts"]) =>
    renderToStaticMarkup(createElement(ReviewsFilters, { filters, onFilterChange: () => {}, counts }));

describe("status pills", () => {
    it("shows how many reviews sit under each filter", () => {
        const html = render({ all: 355, needs_response: 12, responded: 340, ignored: 3 });
        expect(html).toMatch(/Needs reply<span[^>]*>12<\/span>/);
        expect(html).toMatch(/All<span[^>]*>355<\/span>/);
        expect(html).toMatch(/Responded<span[^>]*>340<\/span>/);
        expect(html).toMatch(/Ignored<span[^>]*>3<\/span>/);
    });

    it("highlights a non-empty to-do count and formats thousands", () => {
        const html = render({ all: 1200, needs_response: 1200, responded: 0, ignored: 0 });
        expect(html).toMatch(/Needs reply<span class="[^"]*text-primary[^"]*">1,200<\/span>/);
        expect(html).toMatch(/Responded<span class="[^"]*text-muted-foreground[^"]*">0<\/span>/);
    });

    it("keeps an empty to-do list calm, not orange", () => {
        expect(render({ all: 5, needs_response: 0, responded: 5, ignored: 0 })).toMatch(/Needs reply<span class="[^"]*text-muted-foreground[^"]*">0<\/span>/);
    });

    it("shows plain labels when counts are unavailable", () => {
        const html = render(null);
        expect(html).toContain(">Needs reply</button>");
        expect(html).not.toMatch(/tabular-nums/);
    });
});
