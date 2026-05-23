export type GoogleAccountSummary = {
    resourceName: string;
    accountName: string;
    type?: string;
    verificationState?: string;
    locationCount: number;
    locations: Array<{ name: string; title: string }>;
    isLinkedToZyeneReviews: boolean;
};

export type GoogleAdminRow = {
    name?: string;
    admin?: string;
    role?: string;
    pendingInvitation?: boolean;
};

export function parseGoogleAdminIdentity(a: GoogleAdminRow): { label: string; email?: string } {
    const raw = (a.admin || a.name || "").trim();
    if (!raw) return { label: "—" };
    if (raw.includes("@")) return { label: raw };
    const email = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
    if (email) return { label: email, email };
    return { label: raw.replace(/^accounts\/[^/]+\/admins\//, "") || raw };
}

export function unwrapGoogleAccountAccessApiData<T>(payload: unknown): T {
    const root = payload as { data?: T } & T;
    return (root?.data ?? root) as T;
}
