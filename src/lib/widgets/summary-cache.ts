import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { redis } from "@/lib/db/redis";
import type { PublicWidgetData, PublicWidgetReview } from "@/lib/widgets/public-types";

export const widgetSummarySchema = z.object({ points: z.array(z.string().min(1).max(250)).min(1).max(3), reviewCount: z.number().int().min(1).max(100) });
export function widgetSummaryInput(reviews: PublicWidgetReview[], source: "google" | "all") {
    return reviews.filter(review => (source === "all" || review.platform.toLowerCase() === "google") && review.content.trim()).slice(0, 100);
}
export function widgetSummaryKey(slug: string, reviews: PublicWidgetReview[], source: "google" | "all") {
    // Changing visibility, source, content, rating or identity invalidates publication immediately.
    const fingerprint = createHash("sha256").update(JSON.stringify(widgetSummaryInput(reviews, source).map(r => [r.id, r.content, r.rating]))).digest("hex");
    return `widget_summary_v1:${slug}:${source}:${fingerprint}`;
}
export async function readWidgetSummaries(slug: string, reviews: PublicWidgetReview[]): Promise<PublicWidgetData["summaries"]> {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return undefined;
    try {
        const results = await Promise.all((["google", "all"] as const).map(async source => {
            const value = await redis.get(widgetSummaryKey(slug, reviews, source));
            const parsed = widgetSummarySchema.safeParse(value);
            return [source, parsed.success ? parsed.data : undefined] as const;
        }));
        return Object.fromEntries(results);
    } catch { return undefined; }
}
