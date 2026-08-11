/**
 * Turns a stored two-letter US state code into the region name search vendors
 * expect, and refuses to guess when it cannot.
 *
 * This exists because a bare city is not a location. DataForSEO rejects
 * `location_name: "Kansas City"` outright (40501), and the reason it must is the
 * same reason we cannot paper over it: there is a Kansas City in Missouri and
 * another in Kansas, twenty minutes apart. Picking one would invent a precision
 * the data never had, and a local-visibility product that silently measures the
 * wrong metro is worse than one that measures nothing.
 *
 * Abbreviations are not accepted by the vendor either — "Kansas City,MO,United
 * States" is rejected exactly like the bare city — so the expansion below is
 * required, not cosmetic.
 */

const US_STATE_NAMES: Readonly<Record<string, string>> = {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
    CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
    FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
    IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
    ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan",
    MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
    NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
    NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
    OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
    RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
    TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
    WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", PR: "Puerto Rico",
};

/** Countries whose full name we can state. Absent means "do not build a name". */
const COUNTRY_NAMES: Readonly<Record<string, string>> = {
    US: "United States",
};

/**
 * Full region name for a stored state value, or undefined when we cannot say.
 *
 * Undefined is a real answer and callers must handle it by widening the search
 * to the country, NOT by sending the city alone. Accepts a value that is already
 * a full name so a business row holding "Missouri" is not discarded.
 */
export function resolveRegionName(
    country: string | null | undefined,
    state: string | null | undefined
): string | undefined {
    if (!state) return undefined;
    const trimmed = state.trim();
    if (trimmed.length === 0) return undefined;

    // Only US codes are mapped; another country's two-letter subdivision would
    // collide with these (Victoria and Virginia are both "VA").
    if ((country ?? "US").toUpperCase() !== "US") return undefined;

    if (trimmed.length === 2) return US_STATE_NAMES[trimmed.toUpperCase()];

    const known = Object.values(US_STATE_NAMES).find(
        (name) => name.toLowerCase() === trimmed.toLowerCase()
    );
    return known;
}

/** Full country name for an ISO code, or undefined when we cannot state one. */
export function resolveCountryName(country: string | null | undefined): string | undefined {
    if (!country) return undefined;
    return COUNTRY_NAMES[country.trim().toUpperCase()];
}
