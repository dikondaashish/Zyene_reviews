export const DEVELOPER_API_ENDPOINTS = [
    { method: "POST", path: "/api/v1/requests/send", desc: "Send a review request" },
    { method: "GET", path: "/api/v1/reviews", desc: "List reviews" },
    { method: "GET", path: "/api/v1/analytics", desc: "Get analytics data" },
] as const;

export const DEVELOPER_API_DOCS_COOKBOOK_PATH = "/docs/cookbook";
export const DEVELOPER_API_DOCS_API_PATH = "/docs/api";
