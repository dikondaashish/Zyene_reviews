import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getActiveBusinessId } from "@/lib/business-context";
import { CompetitorsList } from "./competitors-list";

export const metadata = {
    title: "Competitors - Zyene Ratings",
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
            <div className="flex flex-col items-center justify-center min-h-100">
                <h2 className="text-xl font-semibold">No Business Found</h2>
                <p className="text-muted-foreground">Please complete onboarding.</p>
            </div>
        );
    }

    // Fetch competitors
    const { data: competitors } = await supabase
        .from("competitors")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

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
