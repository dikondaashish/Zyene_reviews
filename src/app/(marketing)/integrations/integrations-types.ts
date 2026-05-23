export type IntegrationItem = {
    name: string;
    color: string;
    letter: string;
    badge: string | null;
    status: "live" | "soon";
    features: string[];
    description: string;
};
