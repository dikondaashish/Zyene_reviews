import { redirect } from "next/navigation";
import { Plug } from "lucide-react";
import { createClient } from "@/lib/db/supabase/server";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { ZapierSetupClient } from "./zapier-setup-client";
import { ZapierPartnerTilesCard } from "./zapier-partner-tiles-card";
import { loadZapierPageData } from "./load-zapier-page-data";
import { ZapierPageHeader } from "./zapier-page-header";

export default async function ZapierIntegrationPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    const data = await loadZapierPageData();

    if (data.kind === "no-business") {
        return (
            <BusinessContextEmptyState
                icon={Plug}
                title="Add a business to set up Zapier"
                description="Zapier sends review-request triggers into a specific business. Add or pick a business first."
            />
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-10 p-4 sm:p-6 lg:p-8">
            <ZapierPageHeader />
            <ZapierSetupClient
                appBaseUrl={data.appBaseUrl}
                apiKey={data.apiKey}
                businessId={data.business.id}
                canManageApiKeys={data.canManageApiKeys}
            >
                <ZapierPartnerTilesCard />
            </ZapierSetupClient>
        </div>
    );
}
