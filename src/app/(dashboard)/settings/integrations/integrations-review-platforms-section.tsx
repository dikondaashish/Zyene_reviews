import { Star } from "lucide-react";
import { GoogleIntegrationCard } from "@/components/integrations/google-card";
import { YelpIntegrationCard } from "@/components/integrations/yelp-card";
import { FacebookIntegrationCard } from "@/components/integrations/facebook-card";
import { PlaceholderCard } from "@/components/integrations/placeholder-card";
import { IntegrationsSectionHeader, IntegrationsStatusBadge } from "./integrations-section-header";
import { TripAdvisorIcon } from "./integrations-icons";
import type { IntegrationsPageData } from "./load-integrations-page-data";

type OkData = Extract<IntegrationsPageData, { kind: "ok" }>;

export function IntegrationsReviewPlatformsSection({ data }: { data: OkData }) {
    const rollup = data.visibleRollup;

    return (
        <section className="space-y-5">
            <IntegrationsSectionHeader
                title="Review Platforms"
                description="Monitor and respond to reviews across all major platforms"
                icon={Star}
                badge={<IntegrationsStatusBadge count={data.connectedCount} label="connected" />}
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                <GoogleIntegrationCard
                    platform={data.googlePlatform as Parameters<typeof GoogleIntegrationCard>[0]["platform"]}
                    businessId={data.business.id}
                    businessName={data.business.name || ""}
                    dbGoogleSyncedRowCount={rollup?.googleRowCount ?? 0}
                    dbVisibleGoogleReviewCount={rollup?.googleVisibleCount ?? 0}
                    dbVisibleGoogleAverageRating={rollup?.googleAverageRating ?? null}
                />
                <YelpIntegrationCard
                    platform={data.yelpPlatform as Parameters<typeof YelpIntegrationCard>[0]["platform"]}
                    businessId={data.business.id}
                    businessName={data.business.name || ""}
                    dbYelpSyncedRowCount={rollup?.yelpRowCount ?? 0}
                    dbVisibleYelpReviewCount={rollup?.yelpVisibleCount ?? 0}
                />
                <FacebookIntegrationCard
                    platform={data.facebookPlatform as Parameters<typeof FacebookIntegrationCard>[0]["platform"]}
                    businessId={data.business.id}
                    businessName={data.business.name || ""}
                    dbFacebookSyncedRowCount={rollup?.facebookRowCount ?? 0}
                    dbVisibleFacebookReviewCount={rollup?.facebookVisibleCount ?? 0}
                    dbVisibleFacebookAverageRating={rollup?.facebookAverageRating ?? null}
                />
                <PlaceholderCard
                    name="TripAdvisor"
                    description="Sync TripAdvisor reviews for hotels & businesses"
                    icon={<TripAdvisorIcon />}
                    accentColor="bg-chart-2/100"
                />
            </div>
        </section>
    );
}
