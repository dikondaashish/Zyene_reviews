import { handleGetInboundSettings, handlePutInboundSettings } from "@/services/enrollment/inbound-settings-api";

export const dynamic = "force-dynamic";

/** Invoice-copy email enrollment settings for one business. */
export async function GET(request: Request) {
    return handleGetInboundSettings(request);
}

export async function PUT(request: Request) {
    return handlePutInboundSettings(request);
}
