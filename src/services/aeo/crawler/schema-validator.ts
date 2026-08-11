import { extractJsonLdBlocks, flattenEntities, entityTypes, type JsonLdBlock } from "./extract-json-ld";

/**
 * F5.4: validates the schema.org types that actually matter for AEO —
 * LocalBusiness/Organization (identity a citation-checking crawler or AI
 * agent uses to confirm WHO this page is about), FAQPage (the single
 * highest-leverage type for direct-answer extraction), Article/BlogPosting,
 * and BreadcrumbList (site structure). This is not full schema.org spec
 * validation — schema.org has hundreds of types, and claiming to validate
 * "structured data" in general would be exactly the kind of overclaim this
 * module exists to avoid. Required fields per type follow Google's own
 * Search Central structured-data guidelines, not the (looser) schema.org
 * spec minimums, since Google's guidelines are what actually gates rich
 * results and are the more defensible bar for "AI-readable."
 */

/**
 * schema.org's LocalBusiness subtypes, live-verified: Wolfpack BBQ's real
 * production homepage (checked 2026-08-09) uses `Restaurant`, not the
 * generic `LocalBusiness` — and Google's own structured-data guidelines say
 * to use the MOST SPECIFIC applicable type. A validator that only recognized
 * the literal string "LocalBusiness" would have flagged Wolfpack's complete,
 * correct, well-optimized markup as missing — a real false positive caught
 * against real data, not a hypothetical. This list is the common subtypes
 * for this product's actual customer base (food service, retail, personal
 * care, home services, professional services), not the full schema.org
 * LocalBusiness family tree.
 */
const LOCAL_BUSINESS_TYPES = new Set([
    "LocalBusiness",
    "Restaurant",
    "CafeOrCoffeeShop",
    "BarOrPub",
    "FastFoodRestaurant",
    "Bakery",
    "Store",
    "AutoDealer",
    "AutoRepair",
    "ProfessionalService",
    "LegalService",
    "MedicalBusiness",
    "Dentist",
    "Physician",
    "HomeAndConstructionBusiness",
    "Electrician",
    "Plumber",
    "HousePainter",
    "RoofingContractor",
    "GeneralContractor",
    "SportsActivityLocation",
    "GymOrFitnessCenter",
    "LodgingBusiness",
    "Hotel",
    "BeautySalon",
    "HairSalon",
    "DaySpa",
    "ChildCare",
    "EntertainmentBusiness",
    "FinancialService",
    "RealEstateAgent",
    "TravelAgency",
]);

const REQUIRED_FIELDS: Readonly<Record<string, readonly string[]>> = {
    Organization: ["name", "url"],
    FAQPage: ["mainEntity"],
    Article: ["headline", "author", "datePublished"],
    BlogPosting: ["headline", "author", "datePublished"],
    BreadcrumbList: ["itemListElement"],
};
const LOCAL_BUSINESS_REQUIRED_FIELDS = ["name", "address"];

function requiredFieldsFor(type: string): readonly string[] | null {
    if (LOCAL_BUSINESS_TYPES.has(type)) return LOCAL_BUSINESS_REQUIRED_FIELDS;
    return REQUIRED_FIELDS[type] ?? null;
}

/** Any recognized LocalBusiness subtype, or Organization — identity that must not conflict across blocks on one page. */
export function isIdentityType(type: string): boolean {
    return LOCAL_BUSINESS_TYPES.has(type) || type === "Organization";
}

export type SchemaEntityFinding = {
    entityType: string;
    kind: "missing_field" | "empty_field";
    field: string;
};

export type SchemaValidationResult = {
    blocksFound: number;
    parseErrors: string[];
    entitiesFound: { type: string; label: string | null }[];
    fieldFindings: SchemaEntityFinding[];
    /** Same @type appearing twice with a different name/identity value — a real conflict, not a duplicate listing. */
    conflictingIdentities: { entityType: string; labels: string[] }[];
};

function fieldPresent(entity: Record<string, unknown>, field: string): boolean {
    const v = entity[field];
    if (v === undefined || v === null) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    return true;
}

function labelOf(entity: Record<string, unknown>): string | null {
    const name = entity.name ?? entity.headline;
    return typeof name === "string" ? name : null;
}

export function validateSchemaBlocks(html: string): SchemaValidationResult {
    const blocks: JsonLdBlock[] = extractJsonLdBlocks(html);
    const parseErrors = blocks.filter((b) => b.parseError).map((b) => b.parseError as string);

    const entities = blocks.filter((b) => b.parsed !== null).flatMap((b) => flattenEntities(b.parsed));

    const entitiesFound: SchemaValidationResult["entitiesFound"] = [];
    const fieldFindings: SchemaEntityFinding[] = [];
    const identityLabelsByType = new Map<string, Set<string>>();

    for (const entity of entities) {
        const types = entityTypes(entity);
        for (const type of types) {
            entitiesFound.push({ type, label: labelOf(entity) });

            const required = requiredFieldsFor(type);
            if (required) {
                for (const field of required) {
                    if (!fieldPresent(entity, field)) {
                        fieldFindings.push({ entityType: type, kind: "missing_field", field });
                    }
                }
            }

            if (isIdentityType(type)) {
                // Grouped under one family key, not the raw @type: Restaurant and
                // LocalBusiness disagreeing on name is exactly as real a conflict
                // as two Restaurant blocks disagreeing — they are the same kind
                // of claim ("what business is this page about") in different
                // schema.org vocabulary.
                const familyKey = LOCAL_BUSINESS_TYPES.has(type) ? "LocalBusiness" : "Organization";
                const label = labelOf(entity);
                if (label) {
                    const set = identityLabelsByType.get(familyKey) ?? new Set<string>();
                    set.add(label);
                    identityLabelsByType.set(familyKey, set);
                }
            }
        }
    }

    const conflictingIdentities: SchemaValidationResult["conflictingIdentities"] = [];
    for (const [entityType, labels] of identityLabelsByType) {
        if (labels.size > 1) {
            conflictingIdentities.push({ entityType, labels: [...labels] });
        }
    }

    return {
        blocksFound: blocks.length,
        parseErrors,
        entitiesFound,
        fieldFindings,
        conflictingIdentities,
    };
}
