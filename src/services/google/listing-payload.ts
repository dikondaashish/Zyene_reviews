import { getGoogleLocation } from "@/services/google/listing-information";

export function publicListingPayload(loc: Awaited<ReturnType<typeof getGoogleLocation>>) {
    return {
        title: loc.title ?? "",
        websiteUri: loc.websiteUri ?? "",
        primaryPhone: loc.phoneNumbers?.primaryPhone ?? "",
        description: loc.profile?.description ?? "",
        primaryCategoryDisplay: loc.categories?.primaryCategory?.displayName ?? "",
        addressLines: loc.storefrontAddress?.addressLines ?? [],
        locality: loc.storefrontAddress?.locality ?? "",
        administrativeArea: loc.storefrontAddress?.administrativeArea ?? "",
        postalCode: loc.storefrontAddress?.postalCode ?? "",
        mapsUri: loc.metadata?.mapsUri ?? "",
        newReviewUri: loc.metadata?.newReviewUri ?? "",
        hasRegularHours: !!(loc.regularHours?.periods && loc.regularHours.periods.length > 0),
    };
}
