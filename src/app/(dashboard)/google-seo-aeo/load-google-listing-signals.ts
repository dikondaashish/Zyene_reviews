import { getValidGoogleToken } from "@/services/google/sync-service";
import { getGoogleLocation, type GoogleLocationFull } from "@/services/google/listing-information";
import { fetchGbpAuditSignals } from "@/services/aeo/technical-audit/fetch-gbp-audit-signals";

type GooglePlatform = { id: string; google_location_id: string | null; google_account_id: string | null };

/**
 * The Google Business Profile reads behind the description check and the GBP checks.
 * These are the slowest calls on the page, so the loader starts this before its database
 * reads and awaits it alongside them.
 */
export async function loadGoogleListingSignals(platform: GooglePlatform) {
    // One location read serves both the description check and the three
    // location-backed GBP checks (services, descriptions, service area).
    let googleAccessToken: string | null = null;
    let googleLocation: GoogleLocationFull | null = null;
    try {
        const { accessToken } = await getValidGoogleToken(platform.id);
        googleAccessToken = accessToken ?? null;
        if (accessToken && platform.google_location_id) {
            googleLocation = await getGoogleLocation(accessToken, platform.google_location_id);
        }
    } catch {
        // Non-fatal: the GBP checks report `unavailable` rather than failing.
    }
    const gbpSignals = await fetchGbpAuditSignals({
        accessToken: googleAccessToken,
        accountId: platform.google_account_id,
        locationId: platform.google_location_id,
        location: googleLocation,
    });
    return { listingDescription: googleLocation?.profile?.description?.trim() || "", gbpSignals };
}
