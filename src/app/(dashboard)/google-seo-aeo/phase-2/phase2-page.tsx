import { Building2 } from "lucide-react";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { GoogleSeoAeoSubnav } from "../google-seo-aeo-subnav";
import { loadPhase2PageData } from "./load-phase2-page-data";
import { VisibilityPanel } from "./visibility-panel";
import { TechnicalPanel } from "./technical-panel";
import { RecommendationsPanel } from "./recommendations-panel";
import { ReportsPanel } from "./reports-panel";
import { IntegrationsPanel } from "./integrations-panel";

export async function Phase2Page() {
    const data = await loadPhase2PageData();
    if (data.kind === "no-business") return <BusinessContextEmptyState icon={Building2} title="Add a business for competitive insights" description="Phase 2 data is scoped to the active business and organization." />;
    return (
        <div className="min-w-0 space-y-8 overflow-x-hidden p-4 md:p-8">
            <GoogleSeoAeoSubnav active="/google-seo-aeo/phase-2" />
            <header><h1 className="text-3xl font-bold">Competitive insights</h1><p className="mt-1 text-sm text-muted-foreground">Measured AI visibility, technical evidence, optimization workflows, and reporting for {data.businessName}.</p></header>
            <VisibilityPanel data={data.visibility} />
            <TechnicalPanel data={data.operations} />
            <RecommendationsPanel data={data.operations} />
            <ReportsPanel data={data.operations} />
            <IntegrationsPanel data={data.operations} businessId={data.businessId} />
        </div>
    );
}
