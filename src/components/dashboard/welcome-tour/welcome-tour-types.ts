/** What the first-run welcome needs, loaded on the server for the business the owner just set up. */
export type WelcomeTourData = {
    businessId: string;
    firstName: string;
    businessName: string;
    reviewLink: string;
    googleConnected: boolean;
    /** Plain-language reply rules, e.g. "1–3★ wait for your approval"; empty when rules are off. */
    replyRules: string[];
    /** Picks the first slide's photo (their industry) and logo (their site's icon). */
    category?: string | null;
    website?: string | null;
};
