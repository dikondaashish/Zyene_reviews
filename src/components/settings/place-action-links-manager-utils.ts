export function unwrapPlaceActionApiData<T>(payload: unknown): T {
    const root = payload as { data?: T } & T;
    return (root?.data ?? root) as T;
}

export function prettyPlaceActionUrl(raw: string) {
    try {
        const u = new URL(raw);
        const host = u.hostname.replace(/^www\./, "");
        const path = `${u.pathname}${u.search}`;
        return { host, path: path.length > 70 ? `${path.slice(0, 67)}...` : path };
    } catch {
        return { host: raw, path: "" };
    }
}
