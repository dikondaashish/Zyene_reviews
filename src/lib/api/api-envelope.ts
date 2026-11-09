/**
 * Client-side reader for the `apiOk` envelope (`{ success: true, data }`) that
 * routes in `src/app/api/_shared/responses.ts` return. Reading fields off the top
 * level of that body yields `undefined`, which is how several buttons broke
 * silently; read them through this instead.
 */
export function apiData<T>(payload: unknown): T | undefined {
    if (!payload || typeof payload !== "object") return undefined;
    const body = payload as { success?: unknown; data?: unknown };
    if (body.success !== true || !("data" in body)) return undefined;
    return body.data as T;
}

/** The `error` string from an `apiError` / legacy `{ error }` body, if any. */
export function apiErrorMessage(payload: unknown, fallback: string): string {
    if (payload && typeof payload === "object") {
        const error = (payload as { error?: unknown }).error;
        if (typeof error === "string" && error.trim()) return error;
    }
    return fallback;
}
