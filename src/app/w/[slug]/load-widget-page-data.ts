import { createAdminClient } from "@/lib/db/supabase/admin";
import { planAllowsPublicReviewWidget } from "@/services/stripe/plans";
import { fetchVisibleReviewRollupsByBusinessIds } from "@/lib/reviews/visible-review-rollups";
import type { PublicWidgetReview } from "@/lib/widgets/public-types";
import { readWidgetSummaries } from "@/lib/widgets/summary-cache";
import type { PublicWidgetData } from "@/lib/widgets/public-types";

export type WidgetReview = PublicWidgetReview;

export type WidgetPageData =
    | { kind: "not-found" }
    | { kind: "subscription"; businessName: string }
    | {
          kind: "ok";
          businessName: string;
          reviewsUrl: string;
          writeReviewUrl?: string;
          googleCount: number;
          googleRating: number;
          hideBranding: boolean;
          widgetType: string;
          reviewCount: number;
          averageRating: number;
          formattedReviews: WidgetReview[];
          summaries?: PublicWidgetData["summaries"];
      };

export function sanitizeExternalReviewUrl(value: string | null | undefined): string | undefined {
    try {
        const url = new URL(value ?? "");
        return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
    } catch {
        return undefined;
    }
}

export async function loadWidgetPageData(
    slug: string,
    widgetType: string,
    configurable = false,
): Promise<WidgetPageData> {
    const admin = createAdminClient();

    const { data: business } = await admin
        .from("businesses")
        .select(`
            id,
            name,
            hide_branding,
            status,
            google_review_url,
            organization:organizations (
                plan,
                plan_status
            )
        `)
        .eq("slug", slug)
        .maybeSingle();

    if (!business || business.status !== "active") {
        return { kind: "not-found" };
    }

    const org = (
        business as { organization?: { plan?: string | null; plan_status?: string | null } }
    ).organization;

    if (!planAllowsPublicReviewWidget(org?.plan ?? null, org?.plan_status ?? null)) {
        return { kind: "subscription", businessName: business.name ?? "Business" };
    }

    const visibleRollupMap = await fetchVisibleReviewRollupsByBusinessIds(admin, [business.id]);
    const vr = visibleRollupMap.get(business.id)!;

    const { data: reviews, error: reviewsError } = await admin
        .from("reviews")
        .select(`
            id,
            rating,
            text,
            external_url,
            author_name,
            created_at,
            platform,
            review_date,
            author_avatar_url,
            review_photo_urls,
            ai_summary,
            response_text,
            response_status
        `)
        .eq("business_id", business.id)
        .eq("is_visible", true)
        .gte("rating", configurable ? 1 : 4)
        .order("review_date", { ascending: false })
        .limit(configurable ? 100 : 20);

    if (reviewsError) throw new Error("Unable to load public widget reviews");

    const formattedReviews: WidgetReview[] = (reviews ?? []).map((r) => ({
        id: r.id,
        author_name: r.author_name || "Customer",
        rating: r.rating ?? 5,
        content: (r.text || "").trim(),
        platform: r.platform || "Direct",
        created_at: r.review_date || r.created_at || "",
        external_url: sanitizeExternalReviewUrl(r.external_url),
        avatar: sanitizeExternalReviewUrl(r.author_avatar_url),
        photos: Array.from(new Set((r.review_photo_urls || []).map(sanitizeExternalReviewUrl).filter((url): url is string => !!url))).slice(0, 8),
        summary: r.ai_summary?.slice(0, 500) || undefined,
        ownerReply: r.response_status === "responded" ? r.response_text?.slice(0, 5000) || undefined : undefined,
    }));

    const reviewCount = vr.totalVisible;
    const rawAverage =
        vr.totalVisible > 0
            ? vr.averageRatingVisible
            : formattedReviews.length > 0
              ? formattedReviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) /
                formattedReviews.length
              : 0;
    const averageRating = Number.isFinite(rawAverage) ? rawAverage : 0;

    return {
        kind: "ok",
        businessName: business.name ?? "Reviews",
        reviewsUrl: `/w/${encodeURIComponent(slug)}`,
        writeReviewUrl: sanitizeExternalReviewUrl(business.google_review_url),
        googleCount: vr.googleVisibleCount ?? 0,
        googleRating: vr.googleAverageRating ?? 0,
        hideBranding: !!(business as { hide_branding?: boolean | null }).hide_branding,
        widgetType,
        reviewCount,
        averageRating,
        formattedReviews,
        summaries: configurable ? await readWidgetSummaries(slug, formattedReviews) : undefined,
    };
}
