import { logger } from "@/lib/logger";
import { apiOk } from "@/app/api/_shared/responses";
import { deliverTeamInviteEmail } from "@/lib/team/deliver-team-invite-email";
import type { SupabaseClient } from "@supabase/supabase-js";

type InviteRow = Record<string, unknown> & { id: string; token: string };

export async function deliverTeamInviteAndLogEvent(
    supabase: SupabaseClient,
    params: {
        invite: InviteRow;
        email: string;
        role: string;
        inviterName: string;
        orgName: string;
        organizationId: string;
        businessId: string;
        userId: string;
    }
) {
    const { sendResult, inviteLink } = await deliverTeamInviteEmail({
        to: params.email,
        inviteToken: params.invite.token,
        inviterName: params.inviterName,
        orgName: params.orgName,
    });

    const payloadBase = {
        ...params.invite,
        invite_link: inviteLink,
        invited_email: params.email,
    };

    const eventPayload = {
        organization_id: params.organizationId,
        business_id: params.businessId,
        user_id: params.userId,
        event_type: "team.invite_sent",
        entity_type: "invitation",
        entity_id: params.invite.id,
        metadata: {
            invited_email: params.email,
            role: params.role,
            email_delivered: sendResult.sent,
            actor_name: params.inviterName,
        },
    };

    try {
        await supabase.from("events").insert(eventPayload);
    } catch (e) {
        logger.error({ err: e }, "[team/invite] Failed to write invite event:");
    }

    if (!sendResult.sent) {
        logger.error({ err: sendResult.error }, "[team/invite] Email delivery failed:");
        return apiOk({
            ...payloadBase,
            email_delivered: false as const,
            email_delivery_error: sendResult.error ?? "Email could not be sent",
        });
    }

    return apiOk({
        ...payloadBase,
        email_delivered: true as const,
        resend_email_id: sendResult.id,
    });
}
