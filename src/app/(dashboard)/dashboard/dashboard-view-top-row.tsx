import { DashboardCustomerPortalCard } from "@/components/dashboard/dashboard-ssr-false-blocks";
import { SmartInsightsCard } from "@/components/dashboard/smart-insights-card";
import type { DashboardViewProps } from "./types";

type Props = Pick<DashboardViewProps, "business">;

export function DashboardViewTopRow({ business }: Props) {
    return (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-stretch">
            <div className="min-w-0">
                <SmartInsightsCard businessName={business.name || ""} />
            </div>
            <div className="min-w-0">
                <DashboardCustomerPortalCard
                    businessId={business.id}
                    businessSlug={business.slug}
                    businessName={business.name || "Business"}
                    businessLogoUrl={business.logo_url ?? null}
                    brandColor={business.brand_color ?? null}
                    reviewPageBackgroundColor={business.review_page_background_color ?? null}
                />
            </div>
        </div>
    );
}
