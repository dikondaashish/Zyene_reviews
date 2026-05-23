import { GoogleListingEditor } from "@/components/settings/google-listing-editor";
import { GoogleLodgingPanel } from "@/components/settings/google-lodging-panel";
import { GoogleAccountAccessPanel } from "@/components/settings/google-account-access-panel";
import { PlaceActionLinksManager } from "@/components/settings/place-action-links-manager";
import type { PlaceLinkRow } from "./load-business-information-page-data";

export function BusinessInformationGoogleListingSection({ businessId }: { businessId: string }) {
    return (
        <div className="rounded-lg border border-border bg-card">
            <div className="border-b px-6 py-4">
                <h4 className="text-sm font-semibold">Google Business Profile listing</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Edit the public listing fields Google shows on Search and Maps. This uses the Business
                    Information API (same connection as reviews).
                </p>
            </div>
            <div className="px-6 py-5">
                <GoogleListingEditor key={businessId} businessId={businessId} />
            </div>
        </div>
    );
}

export function BusinessInformationGoogleLodgingSection({ businessId }: { businessId: string }) {
    return (
        <div className="rounded-lg border border-border bg-card">
            <div className="border-b px-6 py-4">
                <h4 className="text-sm font-semibold">Hotel & lodging (Google)</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Lodging API: amenities, policies, and services shown on Google for hotel-type listings.
                    Non-lodging businesses will see a short notice here.
                </p>
            </div>
            <div className="px-6 py-5">
                <GoogleLodgingPanel key={businessId} businessId={businessId} />
            </div>
        </div>
    );
}

export function BusinessInformationGoogleAccessSection({ businessId }: { businessId: string }) {
    return (
        <div className="rounded-lg border border-border bg-card">
            <div className="border-b px-6 py-4">
                <h4 className="text-sm font-semibold">Google account access</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Accounts and locations your OAuth token can manage, plus admins on the linked Google
                    Business account.
                </p>
            </div>
            <div className="px-6 py-5">
                <GoogleAccountAccessPanel key={businessId} businessId={businessId} />
            </div>
        </div>
    );
}

export function BusinessInformationPlaceLinksSection({
    businessId,
    placeLinks,
}: {
    businessId: string;
    placeLinks: PlaceLinkRow[];
}) {
    return (
        <div className="rounded-lg border border-border bg-card">
            <div className="border-b px-6 py-4">
                <h4 className="text-sm font-semibold">Google place action links</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Order online, reservations, and other action buttons on your Google listing. Changes sync
                    to Google when you add or remove a link.
                </p>
            </div>
            <div className="px-6 py-5">
                <PlaceActionLinksManager
                    key={businessId}
                    businessId={businessId}
                    initialLinks={placeLinks}
                />
            </div>
        </div>
    );
}
