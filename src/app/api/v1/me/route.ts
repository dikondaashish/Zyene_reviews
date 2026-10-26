import { NextResponse, type NextRequest } from "next/server";

import { authenticateApiKey, corsPreflight, withCors } from "@/app/api/v1/_lib/auth";

export async function OPTIONS() {
    return corsPreflight();
}

/**
 * Identifies the business an API key belongs to. Zapier uses it as the auth
 * test and for the connection label, so it needs the scope every key has.
 */
export async function GET(req: NextRequest) {
    const auth = await authenticateApiKey(req, "review_requests:write");
    if (!auth.ok) return auth.response;

    return withCors(
        NextResponse.json({
            success: true,
            data: {
                businessId: auth.businessId,
                businessName: auth.businessName,
                businessSlug: auth.businessSlug,
            },
        }),
    );
}
