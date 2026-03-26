import type { LodgingRecord } from "./lodging";

/**
 * 0–100 rough completeness: how many major lodging sections have any data.
 */
export function computeLodgingHealth(lodging: LodgingRecord | null | undefined): number {
    if (!lodging || typeof lodging !== "object") return 0;

    const sections = [
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
    ];

    let filled = 0;
    for (const key of sections) {
        const v = lodging[key];
        if (v && typeof v === "object" && Object.keys(v as object).length > 0) {
            filled++;
        }
    }

    const per = 100 / sections.length;
    return Math.min(100, Math.round(filled * per));
}
