import { handleGoogleLodgingGet, handleGoogleLodgingPatch } from "@/services/google/lodging-api";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    return handleGoogleLodgingGet(request);
}

export async function PATCH(request: Request) {
    return handleGoogleLodgingPatch(request);
}
