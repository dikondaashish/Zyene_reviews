export const dynamic = "force-dynamic";

import { patchTeamMember, deleteTeamMember } from "@/services/team/team-member-api";
import type { NextRequest } from "next/server";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return patchTeamMember(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return deleteTeamMember(request, context);
}
