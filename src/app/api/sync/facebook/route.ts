import { handleFacebookSyncPost } from "@/services/facebook/sync-facebook-api";

export async function POST(request: Request) {
    return handleFacebookSyncPost(request);
}
