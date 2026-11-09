import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { handleReviewsExport } from "@/services/reviews/export-api";

export async function GET(request: Request) {
    try {
        return await handleReviewsExport(request);
    } catch (error: unknown) {
        logger.error({ err: error }, "[Reviews Export] Failed");
        return new NextResponse("Could not export reviews. Please try again.", { status: 500 });
    }
}
