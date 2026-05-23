import type { Json } from "@/lib/db/supabase/database.types";

const TEAM_EVENT_TYPES = [
    "team.invite_sent",
    "team.invite_resent",
    "team.member_joined",
    "team.role_changed",
    "team.member_removed",
    "team.invite_removed",
] as const;

export { TEAM_EVENT_TYPES };

export function mapTeamSettingsActivity(
    teamEvents: Array<{ id: string; event_type: string; created_at: string; metadata: Json | null }> | null
) {
    return (teamEvents || []).map((event) => {
        const rawMeta = event.metadata as Json | null;
        const meta =
            rawMeta && typeof rawMeta === "object" && !Array.isArray(rawMeta)
                ? (rawMeta as Record<string, unknown>)
                : {};
        const safe = (value: unknown, fallback: string) =>
            typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;

        let message = "Team activity updated";
        switch (event.event_type) {
            case "team.member_joined":
                message = `${safe(meta.member_email, "A teammate")} joined as ${safe(meta.role, "member")}`;
                break;
            case "team.role_changed":
                message = `${safe(meta.actor_name, "Someone")} changed ${safe(meta.target_name, "a member")}'s role from ${safe(meta.from_role, "member")} to ${safe(meta.to_role, "member")}`;
                break;
            case "team.invite_sent":
                message = `Invite sent to ${safe(meta.invited_email, "teammate")}`;
                break;
            case "team.invite_resent":
                message = `Invite resent to ${safe(meta.invited_email, "teammate")}`;
                break;
            case "team.member_removed":
                message = `${safe(meta.actor_name, "Someone")} removed ${safe(meta.target_name, "a member")}`;
                break;
            case "team.invite_removed":
                message = `${safe(meta.actor_name, "Someone")} canceled invite for ${safe(meta.invited_email, "teammate")}`;
                break;
            default:
                break;
        }
        return {
            id: event.id as string,
            message,
            createdAt: event.created_at as string,
        };
    });
}
