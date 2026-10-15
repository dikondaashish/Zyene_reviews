export interface IllustrativeBrand {
    name: string;
    industry: string;
    domain: string;
}

/**
 * The owner reports genuine customer relationships and logo permissions.
 * Corporate versus franchise/location scope and approved wording still need
 * per-brand verification. Withhold endorsements until that scope is verified;
 * private relationship and permission records must remain outside Git.
 */
export const ILLUSTRATIVE_BRANDS: IllustrativeBrand[] = [
    // Google's logo service resolves Dunkin's www host; the bare domain returns 404.
    { name: "Dunkin'", industry: "Cafe & QSR", domain: "www.dunkindonuts.com" },
    { name: "Chipotle", industry: "Restaurant", domain: "chipotle.com" },
    { name: "Aspen Dental", industry: "Dental", domain: "aspendental.com" },
    { name: "Great Clips", industry: "Salon", domain: "greatclips.com" },
    { name: "Jiffy Lube", industry: "Auto Repair", domain: "jiffylube.com" },
    { name: "Roto-Rooter", industry: "Home Services", domain: "rotorooter.com" },
    { name: "Planet Fitness", industry: "Fitness", domain: "planetfitness.com" },
];
