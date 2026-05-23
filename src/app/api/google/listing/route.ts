import { type NextRequest } from "next/server";
import { handleGoogleListingGet } from "@/services/google/listing-api";
import { handleGoogleListingPatch } from "@/services/google/listing-patch-api";

export async function GET(request: NextRequest) {
    return handleGoogleListingGet(request);
}

export async function PATCH(request: Request) {
    return handleGoogleListingPatch(request);
}
