import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { Building2 } from "lucide-react";
import { loadBusinessInformationPageData } from "./load-business-information-page-data";
import { BusinessInformationPageHeader } from "./business-information-page-header";
import { BusinessInformationDetailsSection } from "./business-information-details-section";
import { BusinessInformationReviewSettingsSection } from "./business-information-review-settings-section";
import {
    BusinessInformationGoogleAccessSection,
    BusinessInformationGoogleListingSection,
    BusinessInformationGoogleLodgingSection,
    BusinessInformationPlaceLinksSection,
} from "./business-information-google-sections";

export default async function BusinessInformationPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const data = await loadBusinessInformationPageData();

    if (data.kind === "no-business") {
        return (
            <BusinessContextEmptyState
                icon={Building2}
                title="Add a business to edit details"
                description="Business information, Google listing, and review settings apply to your active location. Create or select a business first."
            />
        );
    }

    if (data.kind === "place-links-error") {
        return (
            <DashboardFetchError
                message="We could not load Google place action links. Check your connection and try again."
                retryHref="/settings/business-information"
            />
        );
    }

    const { business, isGoogleConnected, isLodgingBusiness, placeLinks } = data;

    return (
        <div className="space-y-8">
            <BusinessInformationPageHeader />
            <BusinessInformationDetailsSection business={business} />
            {isGoogleConnected && <BusinessInformationGoogleListingSection businessId={business.id} />}
            {isGoogleConnected && isLodgingBusiness && (
                <BusinessInformationGoogleLodgingSection businessId={business.id} />
            )}
            {isGoogleConnected && <BusinessInformationGoogleAccessSection businessId={business.id} />}
            <BusinessInformationReviewSettingsSection business={business} />
            {isGoogleConnected && (
                <BusinessInformationPlaceLinksSection businessId={business.id} placeLinks={placeLinks} />
            )}
        </div>
    );
}
