import { handleResendTeamInvite } from "@/services/team/resend-invite-api";

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return handleResendTeamInvite(id);
}
