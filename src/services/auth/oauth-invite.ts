import type { SupabaseClient, User } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

export async function resolveOAuthInviteParam(
    admin: SupabaseClient,
    user: User,
    queryInvite: string | null
): Promise<string> {
    const explicitInvite = queryInvite?.trim();
    const metadataInvite =
        typeof user.user_metadata?.invite_token === "string"
            ? user.user_metadata.invite_token.trim()
            : "";
    if (explicitInvite || metadataInvite) return explicitInvite || metadataInvite;
    if (!user.email) return "";

    try {
        const { data: pendingInvites } = await admin
            .from("invitations")
            .select("id, token, expires_at, created_at")
            .ilike("email", user.email)
            .is("accepted_at", null)
            .order("created_at", { ascending: false })
            .limit(10);
        const now = Date.now();
        const valid = (pendingInvites || []).find((invite) => {
            if (!invite) return false;
            if (!invite.expires_at) return true;
            const expiresAt = new Date(invite.expires_at).getTime();
            return Number.isFinite(expiresAt) && expiresAt > now;
        });
        return (valid?.token?.trim() || valid?.id?.trim()) ?? "";
    } catch (error) {
        logger.error({ err: error }, "[Auth] Failed to resolve invite fallback by email:");
        return "";
    }
}
