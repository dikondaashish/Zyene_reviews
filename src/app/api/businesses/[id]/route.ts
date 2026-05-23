export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { patchBusiness, deleteBusiness } from "@/services/businesses/business-by-id-api";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return patchBusiness(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return deleteBusiness(request, context);
}
