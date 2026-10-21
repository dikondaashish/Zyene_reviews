import { handleGetReplyRules, handlePutReplyRules } from "@/services/reviews/reply-rules-settings-api";

export const dynamic = "force-dynamic";

/** Reply rules by star rating, approvers and templates for one business. */
export async function GET(request: Request) {
    return handleGetReplyRules(request);
}

export async function PUT(request: Request) {
    return handlePutReplyRules(request);
}
