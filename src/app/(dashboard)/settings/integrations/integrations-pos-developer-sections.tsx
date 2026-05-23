import { Store, Utensils, CreditCard, Zap, Code2, MonitorPlay } from "lucide-react";
import { PlaceholderCard } from "@/components/integrations/placeholder-card";
import { ZapierCard } from "@/components/integrations/zapier-card";
import { DeveloperApiCard } from "@/components/integrations/developer-api-card";
import { WidgetCard } from "@/components/integrations/widget-card";
import { WidgetUpgradeCard } from "@/components/integrations/widget-upgrade-card";
import { IntegrationsSectionHeader, IntegrationsStatusBadge } from "./integrations-section-header";
import type { IntegrationsPageData } from "./load-integrations-page-data";

type OkData = Extract<IntegrationsPageData, { kind: "ok" }>;

export function IntegrationsPosAutomationSection({ apiKey }: { apiKey: string | null }) {
    return (
        <section className="space-y-5">
            <IntegrationsSectionHeader
                title="POS & Automation"
                description="Trigger review requests automatically from payment and workflow tools"
                icon={Zap}
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                <PlaceholderCard
                    name="Square"
                    description="Auto-send review requests after Square payments"
                    icon={<Store className="text-foreground/70 size-5" />}
                    accentColor="bg-foreground/70"
                />
                <PlaceholderCard
                    name="Clover"
                    description="Trigger review requests from Clover transactions"
                    icon={<CreditCard className="text-chart-2 size-5" />}
                    accentColor="bg-chart-2/90"
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
