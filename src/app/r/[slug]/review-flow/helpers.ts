import { z } from "zod";

/** `?ref=` from the browser when SSR lost the query (e.g. old rewrite). */
export function parseReviewRefFromSearch(): string | undefined {
    if (typeof window === "undefined") return undefined;
    const raw = new URLSearchParams(window.location.search).get("ref")?.trim();
    if (!raw) return undefined;
    const parsed = z.string().uuid().safeParse(raw);
    return parsed.success ? parsed.data : undefined;
}
