export interface IllustrativeBrand {
    name: string;
    industry: string;
    domain: string;
}

/**
 * Well-known consumer brands shown purely to illustrate the *type* of local business
 * Zyene is built for (by industry). These are NOT Zyene customers, partners, or endorsers —
 * render with the disclaimer in IllustrativeBrandsSection, never as a "trusted by" claim.
 */
export const ILLUSTRATIVE_BRANDS: IllustrativeBrand[] = [
    { name: "Dunkin'", industry: "Cafe & QSR", domain: "dunkindonuts.com" },
    { name: "Chipotle", industry: "Restaurant", domain: "chipotle.com" },
    { name: "Aspen Dental", industry: "Dental", domain: "aspendental.com" },
    { name: "Great Clips", industry: "Salon", domain: "greatclips.com" },
    { name: "Jiffy Lube", industry: "Auto Repair", domain: "jiffylube.com" },
    { name: "Roto-Rooter", industry: "Home Services", domain: "rotorooter.com" },
    { name: "Planet Fitness", industry: "Fitness", domain: "planetfitness.com" },
];
