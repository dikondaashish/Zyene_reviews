/** Restrict post-auth navigation to an in-app path, never an external origin. */
export function safeNextPath(raw: string | null, fallback = "/dashboard"): string {
    if (!raw) return fallback;
    const candidate = raw.startsWith("/") ? raw : `/${raw}`;
    if (candidate.startsWith("//") || candidate.includes("\\") || candidate.includes("://")) {
        return fallback;
    }
    return candidate;
}
