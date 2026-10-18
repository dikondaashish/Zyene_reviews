export type IntegrationIcon = "api" | "webhook" | "widget";

export type IntegrationItem = {
    name: string;
    /** Root domain of a third-party brand; resolves to a local vector logo. Omit for Zyene's own features. */
    domain?: string;
    /** Glyph for Zyene's own features (no third-party brand mark). */
    icon?: IntegrationIcon;
    badge: string | null;
    status: "live" | "soon";
    features: string[];
    description: string;
};
