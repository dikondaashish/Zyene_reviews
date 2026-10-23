import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { loadAutomationsOverview } from "@/services/automations/load-automations-overview";
import { loadInboundSettings } from "@/services/enrollment/inbound-settings-api";
import { loadSetupProgress } from "@/services/automations/load-setup-progress";
import { isGoogleBusinessConnected } from "@/lib/google/is-google-connected";
import { AutomationsOverviewView } from "@/components/automations/automations-overview-view";

export const metadata = { title: "Automations", description: "Review request, reminder and reply automations in one place." };

export default async function AutomationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { businessId, business } = await getActiveBusinessId();
    if (!businessId || !(await userCanAccessBusiness(supabase, user.id, businessId))) redirect("/dashboard");

    const admin = createAdminClient();
    const [overview, inbound, canManage, { data: campaigns }, setup] = await Promise.all([
        loadAutomationsOverview(admin, businessId),
        loadInboundSettings(admin, businessId),
        canManageBusinessIntegration(supabase, user.id, businessId),
        admin.from("campaigns").select("id, name, status").eq("business_id", businessId).in("status", ["active", "paused"]).order("created_at", { ascending: false }),
        loadSetupProgress(admin, businessId, isGoogleBusinessConnected(business?.review_platforms)),
    ]);

    return (
        <AutomationsOverviewView
            businessId={businessId}
            overview={overview}
            inbound={inbound}
            campaigns={(campaigns ?? []).map((c) => ({ id: c.id, name: c.name, status: c.status }))}
            canManage={canManage}
            setup={setup}
        />
    );
}
