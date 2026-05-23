export const dynamic = "force-dynamic";
import type { NextRequest } from "next/server";

import { getGoogleLocationSelector, postGoogleLocationSelector } from "@/services/google/location-selector-api";

export async function GET(request: NextRequest) {
  return getGoogleLocationSelector(request);
}

export async function POST(request: NextRequest) {
  return postGoogleLocationSelector(request);
}
