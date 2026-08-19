import { NextResponse } from "next/server";

const CORS_HEADERS: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function withGenericWebhookCors(res: NextResponse): NextResponse {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
}

export function genericWebhookOptionsResponse() {
    return withGenericWebhookCors(new NextResponse(null, { status: 204 }));
}
