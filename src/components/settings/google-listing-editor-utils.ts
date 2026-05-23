import type {
    GoogleListingForm,
    GoogleListingMeta,
    GoogleProfileHealthCheck,
} from "./google-listing-editor-types";

export function unwrapGoogleListingApiData<T>(payload: unknown): T {
    const root = payload as { data?: T } & T;
    return (root?.data ?? root) as T;
}

type ListingApiShape = {
    title?: string;
    websiteUri?: string;
    primaryPhone?: string;
    description?: string;
    primaryCategoryDisplay?: string;
    mapsUri?: string;
    hasRegularHours?: boolean;
};

export function parseGoogleListingLoadPayload(payload: unknown): {
    form: GoogleListingForm;
    meta: GoogleListingMeta;
    profileHealth: { score: number; checks: GoogleProfileHealthCheck[] } | null;
} {
    const data = unwrapGoogleListingApiData<{
        listing?: ListingApiShape;
        profileHealth?: { score: number; checks: GoogleProfileHealthCheck[] };
    }>(payload);
    const L = data?.listing;
    if (!L) {
        throw new Error("Google listing payload missing listing details");
    }
    return {
        form: {
            title: L.title || "",
            websiteUri: L.websiteUri || "",
            primaryPhone: L.primaryPhone || "",
            description: L.description || "",
        },
        meta: {
            primaryCategoryDisplay: L.primaryCategoryDisplay || "",
            mapsUri: L.mapsUri || "",
            hasRegularHours: !!L.hasRegularHours,
        },
        profileHealth: data.profileHealth ?? null,
    };
}

export function parseGoogleListingSavePayload(payload: unknown): {
    form?: GoogleListingForm;
    profileHealth?: { score: number; checks: GoogleProfileHealthCheck[] };
} {
    const data = unwrapGoogleListingApiData<{
        listing?: ListingApiShape;
        profileHealth?: { score: number; checks: GoogleProfileHealthCheck[] };
    }>(payload);
    const L = data.listing;
    return {
        form: L
            ? {
                  title: L.title || "",
                  websiteUri: L.websiteUri || "",
                  primaryPhone: L.primaryPhone || "",
                  description: L.description || "",
              }
            : undefined,
        profileHealth: data.profileHealth,
    };
}
