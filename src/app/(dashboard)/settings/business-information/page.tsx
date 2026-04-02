
import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";

import { BusinessInfoForm } from "@/components/settings/business-info-form";
import { ReviewSettingsForm } from "@/components/settings/review-settings-form";
import { PlaceActionLinksManager } from "@/components/settings/place-action-links-manager";
import { GoogleListingEditor } from "@/components/settings/google-listing-editor";
import { GoogleAccountAccessPanel } from "@/components/settings/google-account-access-panel";
import { GoogleLodgingPanel } from "@/components/settings/google-lodging-panel";

import { getActiveBusinessId } from "@/lib/auth/business-context";

export default async function BusinessInformationPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { business } = await getActiveBusinessId();

    if (!business) {
        return (
            <div className="rounded-lg border bg-card shadow-sm p-8 text-center">
                <h2 className="text-lg font-semibold">No business found</h2>
                <p className="text-sm text-muted-foreground mt-1">Please create a business first.</p>
            </div>
        );
    }

    const isGoogleConnected = !!business.review_platforms?.find(
        (p: { platform?: string }) => p.platform === "google"
    );
    
    // Only show Lodging APIs for businesses in the hospitality sector
    const isLodgingBusiness = business.category === "hotel";

    let placeLinks: {
        id: string;
        place_action_type: string;
        uri: string;
        is_preferred: boolean;
        is_broken: boolean;
    }[] = [];

    if (isGoogleConnected) {
        const { data } = await supabase
            .from("gbp_place_action_links")
            .select("id, place_action_type, uri, is_preferred, is_broken")
            .eq("business_id", business.id)
            .order("place_action_type", { ascending: true });
        placeLinks = data ?? [];
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h3 className="text-xl font-semibold tracking-tight">Business Information</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your business details and review request settings.
                </p>
            </div>

            {/* Business Details */}
            <div className="rounded-lg border bg-card shadow-sm">
                <div className="border-b px-6 py-4">
                    <h4 className="text-sm font-semibold">Business Details</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Core information about your business location and contact.
                    </p>
                </div>
                <div className="px-6 py-5">
                    <BusinessInfoForm business={business} />
                </div>
            </div>

            {isGoogleConnected && (
                <div className="rounded-lg border bg-card shadow-sm">
                    <div className="border-b px-6 py-4">
                        <h4 className="text-sm font-semibold">Google Business Profile listing</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Edit the public listing fields Google shows on Search and Maps. This uses the Business
                            Information API (same connection as reviews).
                        </p>
                    </div>
                    <div className="px-6 py-5">
                        <GoogleListingEditor businessId={business.id} />
                    </div>
                </div>
            )}

            {isGoogleConnected && isLodgingBusiness && (
                <div className="rounded-lg border bg-card shadow-sm">
                    <div className="border-b px-6 py-4">
                        <h4 className="text-sm font-semibold">Hotel & lodging (Google)</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Lodging API: amenities, policies, and services shown on Google for hotel-type listings.
                            Non-lodging businesses will see a short notice here.
                        </p>
                    </div>
                    <div className="px-6 py-5">
                        <GoogleLodgingPanel businessId={business.id} />
                    </div>
                </div>
            )}

            {isGoogleConnected && (
                <div className="rounded-lg border bg-card shadow-sm">
                    <div className="border-b px-6 py-4">
                        <h4 className="text-sm font-semibold">Google account access</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Accounts and locations your OAuth token can manage, plus admins on the linked Google
                            Business account.
                        </p>
                    </div>
                    <div className="px-6 py-5">
                        <GoogleAccountAccessPanel businessId={business.id} />
                    </div>
                </div>
            )}

            {/* Review Settings */}
            <div className="rounded-lg border bg-card shadow-sm">
                <div className="border-b px-6 py-4">
                    <h4 className="text-sm font-semibold">Review Request Settings</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Customize how review requests are sent to your customers.
                    </p>
                </div>
                <div className="px-6 py-5">
                    <ReviewSettingsForm business={business} />
                </div>
            </div>

            {isGoogleConnected && (
                <div className="rounded-lg border bg-card shadow-sm">
                    <div className="border-b px-6 py-4">
                        <h4 className="text-sm font-semibold">Google place action links</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Order online, reservations, and other action buttons on your Google listing. Changes sync
                            to Google when you add or remove a link.
                        </p>
                    </div>
                    <div className="px-6 py-5">
                        <PlaceActionLinksManager
                            businessId={business.id}
                            initialLinks={placeLinks}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
