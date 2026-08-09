import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { getGoogleSearchKeywords, getGooglePerformanceTotals } from "@/services/google/performance-queries";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { getGoogleLocation } from "@/services/google/listing-information";
import { fetchVisibleReviewRollupsByBusinessIds } from "@/lib/reviews/visible-review-rollups";
import { calcKeywordCoverage } from "./google-seo-aeo-audit-utils";
import { buildGoogleSeoAeoAudits } from "./google-seo-aeo-build-audits";
import type { GoogleSeoAeoContentProps } from "./google-seo-aeo-content-props";
import { fetchGoogleSeoAeoSecondaryData } from "./google-seo-aeo-secondary-fetch";
import { loadAeoVisibility } from "./load-aeo-visibility";
import { loadSearchConsoleSection } from "./load-search-console-section";

export type GoogleSeoAeoLoadResult =
    | { kind: "no-business" }
    | { kind: "no-platform" }
    | { kind: "ok"; content: GoogleSeoAeoContentProps };

export async function loadGoogleSeoAeoPageData(): Promise<GoogleSeoAeoLoadResult> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { businessId, business } = await getActiveBusinessId();
    if (!businessId || !business) return { kind: "no-business" };

    const { data: platform } = await supabase
        .from("review_platforms")
        .select("id, platform, google_location_id, granted_scopes")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .maybeSingle();

    if (!platform?.id) return { kind: "no-platform" };

    const now = new Date();
    const start30 = new Date(now);
    start30.setDate(start30.getDate() - 29);

    const [visibleRollupMap, perfTotals, keywords, google30TotalRes, google30RespondedRes, placeActionsRes, aiRunRes, heatmapRunRes] =
        await Promise.all([
            fetchVisibleReviewRollupsByBusinessIds(supabase, [businessId]),
            getGooglePerformanceTotals(supabase, businessId, start30, now),
            getGoogleSearchKeywords(supabase, businessId, 20),
            supabase
                .from("reviews")
                .select("*", { count: "exact", head: true })
                .eq("business_id", businessId)
                .eq("platform", "google")
                .eq("is_visible", true)
                .gte("review_date", start30.toISOString()),
            supabase
                .from("reviews")
                .select("*", { count: "exact", head: true })
                .eq("business_id", businessId)
                .eq("platform", "google")
                .eq("is_visible", true)
                .eq("response_status", "responded")
                .gte("review_date", start30.toISOString()),
            supabase
                .from("gbp_place_action_links")
                .select("id", { count: "exact", head: true })
                .eq("business_id", businessId),
            supabase.from("google_seo_ai_visibility_runs")
                .select("id, query, status, created_at")
                .eq("business_id", businessId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle(),
            supabase.from("google_seo_heatmap_runs")
                .select("id, keyword, status, created_at")
                .eq("business_id", businessId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle(),
        ]);

    const visibleRollup = visibleRollupMap.get(businessId)!;
    const googleAvgLive = visibleRollup.googleAverageRating;
    const googleCountLive = visibleRollup.googleVisibleCount;
    const reviews30dCount = google30TotalRes.count ?? 0;
    const responded30dCount = google30RespondedRes.count ?? 0;
    const replyRate = reviews30dCount > 0 ? responded30dCount / reviews30dCount : 0;

    if (google30TotalRes.error || google30RespondedRes.error) {
        logger.error(
            { err: google30TotalRes.error || google30RespondedRes.error },
            "[Google SEO/AEO] review count fetch failed:"
        );
    }

    let listingDescription = "";
    try {
        const { accessToken } = await getValidGoogleToken(platform.id);
        if (accessToken && platform.google_location_id) {
            const loc = await getGoogleLocation(accessToken, platform.google_location_id);
            listingDescription = loc.profile?.description?.trim() || "";
        }
    } catch {
        // Non-fatal for MVP: keep description empty and fail this check.
    }

    const topKeywordList = keywords.slice(0, 12).reduce<string[]>((acc, k) => {
        if (k.keyword) acc.push(k.keyword);
        return acc;
    }, []);
    const { audits, score, measuredCount } = buildGoogleSeoAeoAudits({
        listingDescription,
        keywordCoverage: calcKeywordCoverage(listingDescription, topKeywordList),
        reviews30dCount,
        googleAvgLive,
        googleCountLive,
        replyRate,
        responded30dCount,
        perfTotals,
        actionLinkCount: placeActionsRes.count ?? 0,
    });

    const latestAiRun = aiRunRes.data as
        | { id: string; query: string; status: string; created_at: string }
        | null;
    const latestHeatmapRun = heatmapRunRes.data as
        | { id: string; keyword: string; status: string; created_at: string }
        | null;

    const secondary = await fetchGoogleSeoAeoSecondaryData(businessId, latestAiRun, latestHeatmapRun);
    // Read through the caller's RLS-scoped client, not the admin one: the
    // org-scoped policies on aeo_samples are the isolation boundary here.
    const aeoVisibility = await loadAeoVisibility(supabase, businessId);
    const searchConsole = await loadSearchConsoleSection(businessId, platform.id, platform.granted_scopes);

    return {
        kind: "ok",
        content: {
            businessId,
            businessName: typeof business.name === "string" ? business.name : "Your business",
            businessAddress:
                typeof business.address_line1 === "string" && business.address_line1.trim().length > 0
                    ? business.address_line1
                    : "No address",
            score,
            measuredCount,
            googleAvgLive,
            googleCountLive,
            audits,
            listingDescription,
            topKeywordList,
            competitors: secondary.competitors,
            latestAiRun,
            aiResults: secondary.aiResults,
            latestHeatmapRun,
            heatmapCells: secondary.heatmapCells,
            aeoVisibility,
            searchConsole,
        },
    };
}
