/**
 * Return the unobfuscated Google Business Profile location id from any resource shape we store.
 * Google APIs may give us a raw id, `locations/{id}`, or `accounts/{id}/locations/{id}`.
 */
export function normalizeGoogleLocationId(raw: string | null | undefined): string | null {
    if (typeof raw !== "string") return null;

    const value = raw.trim();
    if (!value) return null;

    const segments = value.split("/").filter(Boolean);
    const locationIndex = segments.lastIndexOf("locations");
    if (locationIndex >= 0 && locationIndex + 1 === segments.length - 1) {
        return segments[locationIndex + 1];
    }

    return segments.length === 1 ? segments[0] : null;
}

export function requireGoogleLocationId(
    raw: string | null | undefined,
    apiName: string
): string {
    const locationId = normalizeGoogleLocationId(raw);
    if (!locationId) {
        throw new Error(`Invalid or empty google_location_id for ${apiName}`);
    }
    return locationId;
}
