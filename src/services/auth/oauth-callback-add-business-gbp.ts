import { logger } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";
import { listAccounts, listLocations, FULL_LOCATION_READ_MASK } from "@/services/google/business-profile";
import type { GoogleLocationDetails } from "@/types/api-routes";
import { OAUTH_GBP_CATEGORY_MAP } from "./oauth-callback-category-map";

export type OAuthAddBusinessGbpDetails = {
    googleAccountId: string | null;
    googleLocationId: string | null;
    externalId: string | null;
    googleReviewUrl: string | null;
    locationName: string | null;
    bizPhone: string | null;
    bizAddress: string | null;
    bizCity: string | null;
    bizState: string | null;
    bizZip: string | null;
    bizWebsite: string | null;
    bizCategory: string;
};

export async function fetchOAuthAddBusinessGbpDetails(accessToken: string | undefined): Promise<OAuthAddBusinessGbpDetails> {
    let googleAccountId: string | null = null;
    let googleLocationId: string | null = null;
    let externalId: string | null = null;
    let googleReviewUrl: string | null = null;
    let locationName: string | null = null;
    let bizPhone: string | null = null;
    let bizAddress: string | null = null;
    let bizCity: string | null = null;
    let bizState: string | null = null;
    let bizZip: string | null = null;
    let bizWebsite: string | null = null;
    let bizCategory = "uncategorized";

    try {
        if (accessToken) {
            const accounts = await listAccounts(accessToken);
            if (accounts.length > 0) {
                const account = accounts[0];
                googleAccountId = account.name.split("/")[1];

                const locations = await listLocations(accessToken, account.name, FULL_LOCATION_READ_MASK);
                if (locations.length > 0) {
                    const location = locations[0] as GoogleLocationDetails;
                    googleLocationId = location.name.split("/").pop() || null;
                    externalId = googleLocationId;
                    locationName = location.title || null;

                    googleReviewUrl = location.metadata?.newReviewUri || location.metadata?.mapsUri || null;
                    if (location.metadata?.placeId) {
                        googleReviewUrl = `https://search.google.com/local/writereview?placeid=${location.metadata.placeId}`;
                    }

                    bizPhone = location.phoneNumbers?.primaryPhone || null;
                    bizAddress = location.storefrontAddress?.addressLines?.join(", ") || null;
                    bizCity = location.storefrontAddress?.locality || null;
                    bizState = location.storefrontAddress?.administrativeArea || null;
                    bizZip = location.storefrontAddress?.postalCode || null;
                    bizWebsite = location.websiteUri || null;

                    const googleCat = (location.categories?.primaryCategory?.displayName || "").toLowerCase();
                    for (const [keyword, value] of Object.entries(OAUTH_GBP_CATEGORY_MAP)) {
                        if (googleCat.includes(keyword)) {
                            bizCategory = value;
                            break;
                        }
                    }
                }
            }
        }
    } catch (hierarchyError) {
        logger.error({ err: hierarchyError }, "Failed to fetch GBP hierarchy:");
        Sentry.captureException(hierarchyError, { tags: { route: "auth-callback", step: "fetch_gbp_hierarchy_add_biz" } });
    }

    return {
        googleAccountId,
        googleLocationId,
        externalId,
        googleReviewUrl,
        locationName,
        bizPhone,
        bizAddress,
        bizCity,
        bizState,
        bizZip,
        bizWebsite,
        bizCategory,
    };
}
