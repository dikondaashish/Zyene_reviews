export const API_KEY_SCOPES = [
    "review_requests:write",
    "reviews:read",
    "analytics:read",
    "prompts:read",
    "results:read",
    "citations:read",
    "scores:read",
] as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

export const DEVELOPER_API_SCOPES: ApiKeyScope[] = [
    "review_requests:write",
    "reviews:read",
    "analytics:read",
];

export const ZAPIER_API_SCOPES: ApiKeyScope[] = ["review_requests:write"];

export function canManageApiKeys(role: string | null | undefined): boolean {
    const normalized = String(role ?? "").trim().toLowerCase();
    return normalized === "owner" || normalized === "admin";
}
