import { handleGoogleAccountAccessGet } from "@/services/google/account-access-api";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    return handleGoogleAccountAccessGet(request);
}
