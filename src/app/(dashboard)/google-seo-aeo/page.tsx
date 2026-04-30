import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { Building2, CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getGoogleSearchKeywords, getGooglePerformanceTotals } from "@/services/google/performance-queries";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { getGoogleLocation } from "@/services/google/listing-information";
import { DescriptionOptimizerCard } from "@/components/google-seo-aeo/description-optimizer-card";
import { RunAuditControls } from "@/components/google-seo-aeo/run-audit-controls";
import { fetchVisibleReviewRollupsByBusinessIds } from "@/lib/reviews/visible-review-rollups";

type AuditItem = {
    id: string;
    label: string;
    status: "pass" | "fail" | "pending";
    detail: string;
};

type AuditFixAction = {
    href: string;
    label: string;
};

function getAuditFixAction(auditId: string): AuditFixAction {
    switch (auditId) {
        case "business-description":
            return { href: "/google-seo-aeo#description-optimizer", label: "Optimize" };
        case "review-frequency":
            return { href: "/campaigns", label: "Create campaign" };
        case "google-rating":
            return { href: "/requests", label: "Request reviews" };
        case "review-replies":
            return { href: "/reviews", label: "Reply now" };
        case "profile-performance":
            return { href: "/analytics", label: "View analytics" };
        case "images":
            return { href: "/settings/business-information#photos", label: "Add photos" };
        case "post-frequency":
            return { href: "/settings/business-information#posts", label: "Manage posts" };
        case "post-keywords":
            return { href: "/settings/business-information#posts", label: "Optimize posts" };
        case "services-list":
            return { href: "/settings/business-information#services", label: "Update services" };
        case "service-descriptions":
            return { href: "/settings/business-information#services", label: "Edit descriptions" };
        case "service-area":
            return { href: "/settings/business-information#service-area", label: "Edit area" };
        default:
            return { href: "/settings/business-information", label: "Fix" };
    }
}

function calcKeywordCoverage(description: string, keywords: string[]): number {
    const low = description.toLowerCase();
    const matched = keywords.filter((k) => low.includes(k.toLowerCase())).length;
    return matched;
}

export default async function GoogleSeoAeoPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { businessId, business } = await getActiveBusinessId();
    if (!businessId || !business) {
        return (
            <BusinessContextEmptyState
                icon={Building2}
                title="Add a business to run Google SEO/AEO audits"
                description="Google SEO/AEO is scoped to your active location. Create or select a business first."
            />
        );
    }

    const { data: platform } = await supabase
        .from("review_platforms")
        .select("id, platform, google_location_id")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .maybeSingle();

    if (!platform?.id) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Google SEO/AEO</h2>
                <Card>
                    <CardContent className="py-8">
                        <p className="text-sm text-muted-foreground">
                            Connect Google Business Profile first to start SEO/AEO auditing.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/integrations">Open Integrations</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const now = new Date();
    const start30 = new Date(now);
    start30.setDate(start30.getDate() - 29);

    const [visibleRollupMap, perfTotals, keywords, googleReviewsRes, placeActionsRes, aiRunRes, heatmapRunRes] =
        await Promise.all([
            fetchVisibleReviewRollupsByBusinessIds(supabase, [businessId]),
            getGooglePerformanceTotals(supabase, businessId, start30, now),
            getGoogleSearchKeywords(supabase, businessId, 20),
            supabase
                .from("reviews")
                .select("id, response_status, review_date")
                .eq("business_id", businessId)
                .eq("platform", "google")
                .eq("is_visible", true)
                .gte("review_date", start30.toISOString()),
            supabase
                .from("gbp_place_action_links")
                .select("id", { count: "exact", head: true })
                .eq("business_id", businessId),
            (supabase.from("google_seo_ai_visibility_runs" as never) as any)
                .select("id, query, status, created_at")
                .eq("business_id", businessId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle(),
            (supabase.from("google_seo_heatmap_runs" as never) as any)
                .select("id, keyword, status, created_at")
                .eq("business_id", businessId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle(),
        ]);

    const visibleRollup = visibleRollupMap.get(businessId)!;
    const googleAvgLive = visibleRollup.googleAverageRating;
    const googleCountLive = visibleRollup.googleVisibleCount;

    const reviews = googleReviewsRes.data || [];
    const responded = reviews.filter((r) => r.response_status === "responded").length;
    const replyRate = reviews.length > 0 ? responded / reviews.length : 0;

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

    const keywordCoverage = calcKeywordCoverage(
        listingDescription,
        keywords.slice(0, 12).map((k) => k.keyword)
    );

    const topKeywordList = keywords.slice(0, 12).map((k) => k.keyword).filter(Boolean);
    const actionLinkCount = placeActionsRes.count ?? 0;
    const auditMinServicesTarget = 25;
    const inferredServicesCount = actionLinkCount;

    const audits: AuditItem[] = [
        {
            id: "business-description",
            label: "Business Description",
            status: listingDescription.length >= 80 && keywordCoverage >= 3 ? "pass" : "fail",
            detail:
                listingDescription.length === 0
                    ? "No Google description found."
                    : `${keywordCoverage} target keywords found in description.`,
        },
        {
            id: "review-frequency",
            label: "Review Frequency (30d)",
            status: reviews.length >= 10 ? "pass" : "fail",
            detail: `${reviews.length} Google reviews in last 30 days.`,
        },
        {
            id: "google-rating",
            label: "Google Rating",
            status: googleAvgLive >= 4.2 ? "pass" : "fail",
            detail: `${googleAvgLive.toFixed(1)} / 5 (${googleCountLive.toLocaleString()} visible in Zyene)`,
        },
        {
            id: "review-replies",
            label: "Review Replies (30d)",
            status: replyRate >= 0.8 ? "pass" : "fail",
            detail: `${Math.round(replyRate * 100)}% replied (${responded}/${reviews.length})`,
        },
        {
            id: "profile-performance",
            label: "Profile Activity (30d)",
            status:
                (perfTotals?.profileViews || 0) > 0 && (perfTotals?.rawRowCount || 0) > 0
                    ? "pass"
                    : "fail",
            detail: `${perfTotals?.profileViews?.toLocaleString() || 0} profile views`,
        },
        {
            id: "images",
            label: "# of Images",
            status: "pending",
            detail: "Not measured yet (Google media audit pending implementation).",
        },
        {
            id: "post-frequency",
            label: "Post Frequency",
            status: "pending",
            detail: "Not measured yet (Google posts audit pending implementation).",
        },
        {
            id: "post-keywords",
            label: "Post Keyword Optimization",
            status: "pending",
            detail: "Not measured yet (post keyword parsing pending implementation).",
        },
        {
            id: "services-list",
            label: "Action Links Coverage (proxy)",
            status: inferredServicesCount >= auditMinServicesTarget ? "pass" : "fail",
            detail: `Detected ${inferredServicesCount} place action links (proxy signal). Target: ${auditMinServicesTarget}+`,
        },
        {
            id: "service-descriptions",
            label: "Service Descriptions",
            status: "pending",
            detail: "Not measured yet (service description sync pending implementation).",
        },
        {
            id: "service-area",
            label: "Service Area",
            status: "pending",
            detail: "Not measured yet (service area distance audit pending implementation).",
        },
    ];

    const measured = audits.filter((a) => a.status !== "pending");
    const score =
        measured.length === 0
            ? 0
            : Math.round((measured.filter((a) => a.status === "pass").length / measured.length) * 100);

    const latestAiRun = aiRunRes.data as
        | { id: string; query: string; status: string; created_at: string }
        | null;
    const latestHeatmapRun = heatmapRunRes.data as
        | { id: string; keyword: string; status: string; created_at: string }
        | null;

    const [aiResultsRes, heatmapCellsRes] = await Promise.all([
        latestAiRun
            ? ((supabase.from("google_seo_ai_visibility_results" as never) as any)
                  .select("model, found, position, snippet")
                  .eq("run_id", latestAiRun.id)
                  .order("model", { ascending: true })
                  .limit(20) as Promise<{ data: Array<{ model: string; found: boolean; position: number | null; snippet: string | null }> | null }>)
            : Promise.resolve({ data: null }),
        latestHeatmapRun
            ? ((supabase.from("google_seo_heatmap_cells" as never) as any)
                  .select("cell_label, rank_position, visibility_score")
                  .eq("run_id", latestHeatmapRun.id)
                  .order("visibility_score", { ascending: false })
                  .limit(30) as Promise<{ data: Array<{ cell_label: string; rank_position: number | null; visibility_score: number }> | null }>)
            : Promise.resolve({ data: null }),
    ]);
    const aiResults = aiResultsRes.data || [];
    const heatmapCells = heatmapCellsRes.data || [];

    const { data: competitors } = await supabase
        .from("competitors")
        .select("id, name, average_rating, total_reviews, google_url")
        .eq("business_id", businessId)
        .order("average_rating", { ascending: false })
        .limit(3);

    const businessName = typeof business.name === "string" ? business.name : "Your business";
    const businessAddress =
        typeof business.address_line1 === "string" && business.address_line1.trim().length > 0
            ? business.address_line1
            : "No address";

    return (
        <div className="space-y-6 p-4 md:p-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Google SEO/AEO</h2>
                <p className="text-sm text-muted-foreground">
                    Optimization diagnostics and direct Google-ready fixes for {businessName}.
                </p>
            </div>

            <RunAuditControls businessId={businessId} />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Optimization Score</span>
                        <span className="text-3xl font-bold">{score}%</span>
                    </CardTitle>
                    <CardDescription>
                        {businessName} · {businessAddress} · {googleAvgLive.toFixed(1)}/5 ·{" "}
                        {googleCountLive.toLocaleString()} reviews (visible in Zyene)
                        {" · "}
                        Based on {measured.length} measured checks.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Audit Results</CardTitle>
                    <CardDescription>
                        SEO/AEO requirements with pass/fail status and direct fix actions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {audits.map((a) => (
                        <div key={a.id} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    {a.status === "pass" ? (
                                        <CheckCircle2 className="h-4 w-4 text-chart-2" />
                                    ) : a.status === "fail" ? (
                                        <XCircle className="h-4 w-4 text-sync-action" />
                                    ) : (
                                        <span className="inline-flex h-4 w-4 rounded-full border border-muted-foreground/40" />
                                    )}
                                    <p className="font-medium">{a.label}</p>
                                    <Badge
                                        variant={
                                            a.status === "pass"
                                                ? "secondary"
                                                : a.status === "fail"
                                                  ? "destructive"
                                                  : "outline"
                                        }
                                    >
                                        {a.status === "pass"
                                            ? "Pass"
                                            : a.status === "fail"
                                              ? "Fail"
                                              : "Pending"}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{a.detail}</p>
                            </div>
                            {(() => {
                                const fixAction = getAuditFixAction(a.id);
                                return (
                            <Button asChild size="sm" variant="outline">
                                <Link href={fixAction.href}>{fixAction.label}</Link>
                            </Button>
                                );
                            })()}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div id="description-optimizer">
                <DescriptionOptimizerCard
                    businessId={businessId}
                    currentDescription={listingDescription}
                    topKeywords={topKeywordList}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Competitors</CardTitle>
                    <CardDescription>Public Google profile benchmark snapshot.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {(competitors || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No tracked competitors yet.</p>
                    ) : (
                        competitors!.map((c, i) => (
                            <div key={c.id} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-medium">
                                        #{i + 1} {c.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {Number(c.average_rating || 0).toFixed(1)} ({(c.total_reviews || 0).toLocaleString()} reviews)
                                    </p>
                                </div>
                                {c.google_url ? (
                                    <Button asChild size="sm" variant="ghost">
                                        <a href={c.google_url} target="_blank" rel="noopener noreferrer">
                                            Open <ExternalLink className="ml-1 h-3.5 w-3.5" />
                                        </a>
                                    </Button>
                                ) : null}
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>AI Visibility</CardTitle>
                    <CardDescription>
                        Beta estimate from internal scoring heuristics (real provider checks coming next).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {latestAiRun ? (
                        <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">
                                Latest run: <span className="font-medium text-foreground">{latestAiRun.query}</span> ·{" "}
                                {latestAiRun.status}
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {aiResults.map((m) => (
                                    <div key={m.model} className="rounded-lg border p-3">
                                        <p className="text-sm font-medium">{m.model}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {m.found
                                                ? `Result: ${m.position ? `${m.position}${m.position === 1 ? "st" : m.position === 2 ? "nd" : m.position === 3 ? "rd" : "th"} position` : "Found"}`
                                                : "Result: Not found"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No AI visibility audits yet. Run one above.
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Heatmap audits</CardTitle>
                    <CardDescription>
                        Beta estimated geo-grid (real rank-tracking integration coming next).
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    {latestHeatmapRun ? (
                        <>
                            <p>
                                Keyword:{" "}
                                <span className="font-medium text-foreground">{latestHeatmapRun.keyword}</span> ·{" "}
                                {latestHeatmapRun.status}
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {heatmapCells.slice(0, 9).map((cell) => (
                                    <div key={cell.cell_label} className="rounded-lg border p-3">
                                        <p className="text-sm font-medium">{cell.cell_label}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Rank #{cell.rank_position ?? "—"} · Visibility {cell.visibility_score}%
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p>No heatmap audits yet. Run one above.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

