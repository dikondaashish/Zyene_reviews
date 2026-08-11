export type IntegrationItem = {
    name: string;
    color: string;
    letter: string;
    /** Root domain to fetch a real logo for via Google's favicon service. Omit for Zyene's own features (e.g. "REST API"). */
    domain?: string;
    badge: string | null;
    status: "live" | "soon";
    features: string[];
    description: string;
};
