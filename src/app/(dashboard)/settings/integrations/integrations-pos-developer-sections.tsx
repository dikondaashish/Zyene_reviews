import { Utensils, Zap, Code2, MonitorPlay } from "lucide-react";
import { PlaceholderCard } from "@/components/integrations/placeholder-card";
import { ZapierCard } from "@/components/integrations/zapier-card";
import { CloverCard, type CloverConnectionSummary } from "@/components/integrations/clover-card";
import { SquareCard, type SquareConnectionSummary } from "@/components/integrations/square-card";
import { DeveloperApiCard } from "@/components/integrations/developer-api-card";
import { WidgetCard } from "@/components/integrations/widget-card";
import { WidgetUpgradeCard } from "@/components/integrations/widget-upgrade-card";
import { IntegrationsSectionHeader, IntegrationsStatusBadge } from "./integrations-section-header";
import type { IntegrationsPageData } from "./load-integrations-page-data";

type OkData = Extract<IntegrationsPageData, { kind: "ok" }>;

export function IntegrationsPosAutomationSection({
    apiKey,
    businessId,
    cloverConnection,
    cloverConfigured,
    squareConnection,
    squareConfigured,
}: {
    apiKey: string | null;
    businessId: string;
    cloverConnection: CloverConnectionSummary;
    cloverConfigured: boolean;
    squareConnection: SquareConnectionSummary;
    squareConfigured: boolean;
}) {
    return (
        <section className="space-y-5">
            <IntegrationsSectionHeader
                title="POS & Automation"
                description="Trigger review requests automatically from payment and workflow tools"
                icon={Zap}
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                <SquareCard
                    businessId={businessId}
                    connection={squareConnection}
                    configured={squareConfigured}
                />
                <CloverCard
                    businessId={businessId}
                    connection={cloverConnection}
                    configured={cloverConfigured}
                />
                <PlaceholderCard
                    name="Toast"
                    description="Connect Toast POS for automatic follow-ups"
                    icon={<Utensils className="text-primary size-5" />}
                    accentColor="bg-primary"
                />
                <ZapierCard apiKey={apiKey} />
            </div>
        </section>
    );
}

export function IntegrationsDeveloperApiSection({ data }: { data: OkData }) {
    return (
        <section className="space-y-5">
            <IntegrationsSectionHeader
                title="Developer API"
                description="Build custom integrations with our REST API"
                icon={Code2}
                badge={data.apiKey ? <IntegrationsStatusBadge count={1} label="key active" /> : undefined}
            />
            <div className="max-w-2xl">
                <DeveloperApiCard businessId={data.business.id} apiKey={data.apiKey} />
            </div>
        </section>
    );
}

export function IntegrationsWebsiteElementsSection({ data }: { data: OkData }) {
    return (
        <section className="space-y-5">
            <IntegrationsSectionHeader
                title="Website Elements"
                description="Embed your top reviews directly on your own website"
                icon={MonitorPlay}
            />
            {data.canUsePublicWidget ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                    <WidgetCard businessSlug={data.business.slug || ""} />
                </div>
            ) : (
                <WidgetUpgradeCard />
            )}
        </section>
    );
}
