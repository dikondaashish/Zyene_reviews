import { fetchWithRetry } from "./business-profile";

const BASE = "https://mybusinesslodging.googleapis.com/v1";

/** Top-level sections (excludes output-only allUnits / someUnits from writes). */
export const LODGING_READ_MASK = [
    "name",
    "metadata",
    "property",
    "services",
    "policies",
    "foodAndDrink",
    "pools",
    "wellness",
    "activities",
    "transportation",
    "families",
    "connectivity",
    "business",
    "accessibility",
    "pets",
    "parking",
    "housekeeping",
    "healthAndSafety",
    "sustainability",
    "commonLivingArea",
    "guestUnits",
].join(",");

export type LodgingRecord = Record<string, unknown>;

export function stripLodgingOutputOnly(lodging: LodgingRecord): LodgingRecord {
    const out = { ...lodging };
    delete out.allUnits;
    delete out.someUnits;
    return out;
}

export async function getLodging(accessToken: string, locationId: string): Promise<LodgingRecord> {
    const url = `${BASE}/locations/${encodeURIComponent(locationId)}/lodging?readMask=${encodeURIComponent(LODGING_READ_MASK)}`;

    const response = await fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const body = await response.text();
        const err = new Error(`Lodging GET ${response.status}: ${body}`);
        (err as Error & { statusCode?: number }).statusCode = response.status;
        throw err;
    }

    return response.json() as Promise<LodgingRecord>;
}

/**
 * PATCH lodging. Body must include valid `metadata`; `name` is set from locationId. Output-only fields stripped.
 */
export async function patchLodging(
    accessToken: string,
    locationId: string,
    body: LodgingRecord,
    updateMask: string
): Promise<LodgingRecord> {
    const resourcePath = `locations/${encodeURIComponent(locationId)}/lodging`;
    const clean = stripLodgingOutputOnly(body);
    clean.name = resourcePath;

    const url = `${BASE}/${resourcePath}?updateMask=${encodeURIComponent(updateMask)}`;

    const response = await fetchWithRetry(url, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(clean),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Lodging PATCH ${response.status}: ${text}`);
    }

    return response.json() as Promise<LodgingRecord>;
}

export interface GoogleUpdatedLodgingResponse {
    lodging?: LodgingRecord;
    diffMask?: string;
}

/**
 * Fields Google has changed on the listing (read-only insight).
 */
export async function getLodgingGoogleUpdated(
    accessToken: string,
    locationId: string
): Promise<GoogleUpdatedLodgingResponse> {
    const path = `locations/${encodeURIComponent(locationId)}/lodging:getGoogleUpdated`;
    const url = `${BASE}/${path}?readMask=${encodeURIComponent("*")}`;

    const response = await fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const body = await response.text();
        const err = new Error(`Lodging getGoogleUpdated ${response.status}: ${body}`);
        (err as Error & { statusCode?: number }).statusCode = response.status;
        throw err;
    }

    return response.json() as Promise<GoogleUpdatedLodgingResponse>;
}
