import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { CompetitorsList } from "./competitors-list";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { TrendingUp } from "lucide-react";

export const metadata = {
    title: "Competitors - Zyene Reviews",
    description: "Monitor your competitors' ratings and performance.",
};

type RangeKey = "7d" | "30d" | "90d" | "12m";

function normalizeRange(raw: string | undefined): RangeKey {
    if (raw === "7d" || raw === "30d" || raw === "90d" || raw === "12m") return raw;
    return "30d";
}

function getRangeStart(range: RangeKey): Date {
    const now = new Date();
    if (range === "12m") {
        const d = new Date(now);
        d.setFullYear(d.getFullYear() - 1);
        return d;
    }
    const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export default async function CompetitorsPage({
    searchParams,
}: {
    searchParams: Promise<{ range?: string }>;
}) {
    const supabase = await createClient();
    const sp = await searchParams;
    const range = normalizeRange(sp.range);
    const rangeStart = getRangeStart(range);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get active business from context
    const { businessId } = await getActiveBusinessId();

    if (!businessId) {
        return (
            <BusinessContextEmptyState
                icon={TrendingUp}
                title="Add a business to track competitors"
                description="Competitor monitoring is scoped to your active business. Add a location or switch business in the header to continue."
            />
        );
    }

    // Fetch competitors
    const { data: competitors, error: competitorsError } = await supabase
        .from("competitors")
        .select("id, business_id, name, google_url, average_rating, total_reviews, created_at, updated_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

    const snapshotsPromise = (supabase
        .from("competitor_snapshots" as never) as any)
        .select("id, competitor_id, business_id, captured_at, average_rating, total_reviews, source")
        .eq("business_id", businessId)
        .gte("captured_at", rangeStart.toISOString())
        .order("captured_at", { ascending: false })
        .limit(1000);

    const eventsPromise = (supabase
        .from("competitor_events" as never) as any)
        .select("id, competitor_id, business_id, event_type, title, summary, event_value, event_delta, created_at")
        .eq("business_id", businessId)
        .gte("created_at", rangeStart.toISOString())
        .order("created_at", { ascending: false })
        .limit(200);

    const insightsPromise = (supabase
        .from("competitor_insights" as never) as any)
        .select("id, competitor_id, business_id, range_key, summary, priority, confidence, recommendations, model, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(100);

    const latestRunPromise = (supabase
        .from("competitor_watch_runs" as never) as any)
        .select(
            "id, run_id, business_id, status, scanned, external_updates, snapshots_created, events_created, insights_created, error_message, started_at, finished_at, created_at"
        )
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    const [snapshotsRes, eventsRes, insightsRes, latestRunRes] = await Promise.all([
        snapshotsPromise,
        eventsPromise,
        insightsPromise,
        latestRunPromise,
    ]);

    if (competitorsError || snapshotsRes.error || eventsRes.error || insightsRes.error || latestRunRes.error) {
        console.error("[Competitors page] Fetch failed:", competitorsError);
        return (
            <div className="flex-1 space-y-6 p-8 pt-6">
                <DashboardFetchError
                    message="We could not load competitors. Check your connection and try again."
                    retryHref="/competitors"
                />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Competitor Monitoring</h2>
                    <p className="text-muted-foreground">
                        Keep track of your competitors' review performance to stay ahead.
                    </p>
                </div>
            </div>

            <CompetitorsList
                businessId={businessId}
                initialCompetitors={competitors || []}
                range={range}
                snapshotRows={(snapshotsRes.data || []) as Array<{
                    id: string;
                    competitor_id: string;
                    business_id: string;
                    captured_at: string;
                    average_rating: number;
                    total_reviews: number;
                    source: string;
                }>}
                eventRows={(eventsRes.data || []) as Array<{
                    id: string;
                    competitor_id: string;
                    business_id: string;
                    event_type: string;
                    title: string;
                    summary: string | null;
                    event_value: number | null;
                    event_delta: number | null;
                    created_at: string;
                }>}
                insightRows={(insightsRes.data || []) as Array<{
                    id: string;
                    competitor_id: string;
                    business_id: string;
                    range_key: string;
                    summary: string;
                    priority: string;
                    confidence: number | null;
                    recommendations: string[] | null;
                    model: string | null;
                    created_at: string;
                }>}
                latestRun={
                    (latestRunRes.data as {
                        id: string;
                        run_id: string;
                        business_id: string;
                        status: string;
                        scanned: number;
                        external_updates: number;
                        snapshots_created: number;
                        events_created: number;
                        insights_created: number;
                        error_message: string | null;
                        started_at: string;
                        finished_at: string;
                        created_at: string;
                    } | null) ?? null
                }
            />
        </div>
    );
}
