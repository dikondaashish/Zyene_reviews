import { getAppBaseUrl } from "@/config/env";

type Endpoint = {
    method: "GET" | "POST";
    path: string;
    description: string;
    example: string;
};

export function buildEndpoints(apiOrigin: string): Endpoint[] {
    const base = apiOrigin.replace(/\/$/, "");
    return [
        {
            method: "POST",
            path: "/api/v1/requests/send",
            description: "Send a review request via SMS or email. Required scope: review_requests:write.",
            example: `curl -X POST "${base}/api/v1/requests/send" \\
  -H "X-API-Key: zy_..." \\
  -H "Content-Type: application/json" \\
  -d '{"customerName":"Alex","customerPhone":"+18165551234","channel":"sms"}'`,
        },
        {
            method: "GET",
            path: "/api/v1/reviews",
            description: "List reviews with pagination and filters. Required scope: reviews:read.",
            example: `curl "${base}/api/v1/reviews?page=1&limit=20&status=pending&minRating=4" \\
  -H "X-API-Key: zy_..."`,
        },
        {
            method: "GET",
            path: "/api/v1/analytics",
            description: "Aggregate review and request activity. Required scope: analytics:read.",
            example: `curl "${base}/api/v1/analytics?days=30" \\
  -H "X-API-Key: zy_..."`,
        },
    ];
}
