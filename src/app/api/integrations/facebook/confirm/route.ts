import { handleFacebookConfirm } from "@/services/facebook/confirm-api";

/**
 * POST: Confirm Facebook page connection.
 */
export async function POST(req: Request) {
    return handleFacebookConfirm(req);
}
