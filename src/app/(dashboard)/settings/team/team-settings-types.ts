export type TeamPanelMember = {
    id: string;
    role: string;
    type: "member" | "invite";
    userId?: string;
    user?: { full_name: string; email: string; avatar_url?: string };
    email?: string;
    status: "active" | "invited";
};

export function memberUserFromJoin(
    users: unknown
): { full_name: string; email: string; avatar_url?: string } | undefined {
    if (!users || typeof users !== "object") return undefined;
    const u = users as Record<string, unknown>;
    const full_name = typeof u.full_name === "string" ? u.full_name : "";
    const email = typeof u.email === "string" ? u.email : "";
    if (!full_name && !email) return undefined;
    return {
        full_name,
        email,
        avatar_url: typeof u.avatar_url === "string" ? u.avatar_url : undefined,
    };
}
