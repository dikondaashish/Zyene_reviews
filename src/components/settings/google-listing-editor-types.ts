export type GoogleListingForm = {
    title: string;
    websiteUri: string;
    primaryPhone: string;
    description: string;
};

export type GoogleProfileHealthCheck = { id: string; label: string; ok: boolean; hint?: string };

export type GoogleListingMeta = {
    primaryCategoryDisplay: string;
    mapsUri: string;
    hasRegularHours: boolean;
};
