import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { getGoogleSearchKeywords, getGooglePerformanceTotals } from "@/services/google/performance-queries";
import { fetchVisibleReviewRollupsByBusinessIds } from "@/lib/reviews/visible-review-rollups";
import { filterDescriptionKeywords } from "@/lib/aeo/description-keywords";
import { calcKeywordCoverage } from "./google-seo-aeo-audit-utils";
import { buildGoogleSeoAeoAudits } from "./google-seo-aeo-build-audits";
import type { GoogleSeoAeoContentProps } from "./google-seo-aeo-content-props";
import { fetchGoogleSeoAeoSecondaryData } from "./google-seo-aeo-secondary-fetch";
import { loadAeoVisibility } from "./load-aeo-visibility";
import { loadGoogleListingSignals } from "./load-google-listing-signals";
import { loadSearchConsoleSection } from "./load-search-console-section";
import { loadShareOfVoice } from "./load-share-of-voice";
import { assertAeoQueriesSucceeded } from "@/services/aeo/query-results";

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

    const platformResult = await supabase
        .from("review_platforms")
        .select("id, platform, google_location_id, google_account_id, granted_scopes")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .maybeSingle();
    assertAeoQueriesSucceeded("Unable to load Google platform connection", platformResult);
    const platform = platformResult.data;

    if (!platform?.id) return { kind: "no-platform" };

    // Start the slow Google reads now; they only need the platform row.
    const googleSignalsPromise = loadGoogleListingSignals(platform);
    googleSignalsPromise.catch(() => undefined); // awaited below; avoids an unhandled rejection if a DB read fails first

    const now = new Date();
    const start30 = new Date(now);
    start30.setDate(start30.getDate() - 29);

    const [visibleRollupMap, perfTotals, keywords, google30TotalRes, google30RespondedRes, aiRunRes, heatmapRunRes, competitorNamesRes] =
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
            supabase.from("competitors").select("name").eq("business_id", businessId),
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
    assertAeoQueriesSucceeded("Unable to load Google SEO/AEO measurements", google30TotalRes,
        google30RespondedRes, aiRunRes, heatmapRunRes);

    const latestAiRun = aiRunRes.data as
        | { id: string; query: string; status: string; created_at: string }
        | null;
    const latestHeatmapRun = heatmapRunRes.data as
        | { id: string; keyword: string; status: string; created_at: string }
        | null;

    // These share no data, so they run together with the Google reads started above.
    const [{ listingDescription, gbpSignals }, secondary, aeoVisibility, searchConsole, shareOfVoice] = await Promise.all([
        googleSignalsPromise,
        fetchGoogleSeoAeoSecondaryData(businessId, latestAiRun, latestHeatmapRun),
        // Read through the caller's RLS-scoped client, not the admin one: the
        // org-scoped policies on aeo_samples are the isolation boundary here.
        loadAeoVisibility(supabase, businessId),
        loadSearchConsoleSection(businessId, platform.id, platform.granted_scopes),
        loadShareOfVoice(supabase, businessId),
    ]);

    // Searches for this business or a tracked competitor by name are not description keywords.
    const topKeywordList = filterDescriptionKeywords(
        keywords.reduce<string[]>((acc, k) => {
            if (k.keyword) acc.push(k.keyword);
            return acc;
        }, []),
        {
            businessName: typeof business.name === "string" ? business.name : "",
            competitorNames: (competitorNamesRes.data ?? []).map((c) => String(c.name ?? "")),
        },
    ).slice(0, 12);
    const { audits, score, measuredCount } = buildGoogleSeoAeoAudits({
        listingDescription,
        keywordCoverage: calcKeywordCoverage(listingDescription, topKeywordList),
        reviews30dCount,
        googleAvgLive,
        googleCountLive,
        replyRate,
        responded30dCount,
        perfTotals,
        gbpSignals,
        topKeywords: topKeywordList,
    });

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
            shareOfVoice,
        },
    };
}
