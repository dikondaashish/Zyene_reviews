import { createAdminClient } from "@/lib/db/supabase/admin";
import { planAllowsPublicReviewWidget } from "@/services/stripe/plans";
import { recordReviewPageOpen } from "./record-review-page-open";
import { googleMapsSearchUrl, resolveReviewPageGoogle } from "./resolve-review-page-google";
import { REVIEW_PAGE_BUSINESS_SELECT } from "./review-page-select";
import type { ReviewPageBusiness, ReviewPageData } from "./review-page-types";

export type { ReviewPageBusiness, ReviewPageData } from "./review-page-types";

export async function loadReviewPageData(
    slug: string,
    requestId: string | undefined
): Promise<ReviewPageData> {
    const supabase = await createAdminClient();

    const { data: business, error } = await supabase
        .from("businesses")
        .select(REVIEW_PAGE_BUSINESS_SELECT)
        .eq("slug", slug)
        .single();

    if (error || !business) {
        return { kind: "not-found" };
    }

    const org = business.organization as { plan?: string | null; plan_status?: string | null };

    if (!planAllowsPublicReviewWidget(org?.plan ?? null, org?.plan_status ?? null)) {
        return { kind: "subscription", businessName: business.name };
    }

    const { data: platform } = await supabase
        .from("review_platforms")
        .select("external_url")
        .eq("business_id", business.id)
        .eq("platform", "google")
        .limit(1)
        .maybeSingle();

    const { connected, googleUrl } = resolveReviewPageGoogle({
        googleReviewUrl: business.google_review_url,
        platform,
        mapsFallbackUrl: googleMapsSearchUrl(business.name, [
            (business as { address_line1?: string | null }).address_line1,
            (business as { city?: string | null }).city,
            (business as { state?: string | null }).state,
        ]),
    });

    if (!connected) {
        return { kind: "platform", businessName: business.name };
    }

    const resolvedRequestId = requestId;
    await recordReviewPageOpen(business.id, resolvedRequestId);

    const rawPageBg = (business as { review_page_background_color?: string | null })
        .review_page_background_color;
    const reviewPageBackgroundColor =
        typeof rawPageBg === "string" && /^#([0-9A-F]{3}){1,2}$/i.test(rawPageBg)
            ? rawPageBg
            : undefined;

    const ratingStyleRaw = (business as { rating_style?: string | null }).rating_style;
    const ratingStyle =
        ratingStyleRaw === "stars" ||
        ratingStyleRaw === "number" ||
        ratingStyleRaw === "slider" ||
        ratingStyleRaw === "radio"
            ? ratingStyleRaw
            : "emoji";

    return {
        kind: "ok",
        business: business as ReviewPageBusiness,
        googleUrl,
        requestId: resolvedRequestId,
        reviewPageBackgroundColor,
        ratingStyle,
    };
}
