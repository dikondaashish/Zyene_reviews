import { handleGoogleSyncGet, handleGoogleSyncPost } from "@/services/google/sync-google-api";

export async function GET(request: Request) {
    return handleGoogleSyncGet(request);
}

export async function POST(request: Request) {
    return handleGoogleSyncPost(request);
}
