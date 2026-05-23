import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";

export async function writeInviteResentEvent(
    supabase: Awaited<ReturnType<typeof createClient>>,
    params: {
        orgId: string;
        businessId: string;
        userId: string;
        invitationId: string;
        invitedEmail: string;
        emailDelivered: boolean;
        actorName: string;
    }
) {
    try {
        await supabase.from("events").insert({
            organization_id: params.orgId,
            business_id: params.businessId,
            user_id: params.userId,
            event_type: "team.invite_resent",
            entity_type: "invitation",
            entity_id: params.invitationId,
            metadata: {
                invited_email: params.invitedEmail,
                email_delivered: params.emailDelivered,
                actor_name: params.actorName,
            },
        });
    } catch (e) {
        logger.error({ err: e }, "[team/invites/resend] Failed to write event:");
    }
}
