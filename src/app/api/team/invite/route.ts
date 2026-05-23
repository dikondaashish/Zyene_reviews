import { handleTeamInvite } from "@/services/team/invite-api";

export async function POST(request: Request) {
    return handleTeamInvite(request);
}
