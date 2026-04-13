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

export default async function CompetitorsPage() {
    const supabase = await createClient();

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
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

    if (competitorsError) {
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
            />
        </div>
    );
}
