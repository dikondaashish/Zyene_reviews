import type { InviteRole } from "@/lib/team/business-team";

export function inviteRoleLabel(role: InviteRole) {
    return role.charAt(0).toUpperCase() + role.slice(1);
}

export function parseInviteResponsePayload(payload: unknown): Record<string, unknown> | null {
    if (
        typeof payload === "object" &&
        payload !== null &&
        "data" in payload &&
        typeof (payload as { data: unknown }).data === "object" &&
        (payload as { data: unknown }).data !== null
    ) {
        return (payload as { data: Record<string, unknown> }).data;
    }
    return null;
}

export function parseInviteErrorMessage(payload: unknown, fallback: string): string {
    if (
        typeof payload === "object" &&
        payload !== null &&
        "error" in payload &&
        typeof (payload as { error: unknown }).error === "string"
    ) {
        return (payload as { error: string }).error;
    }
    return fallback;
}
