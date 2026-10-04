/**
 * Retry helpers for transient Supabase/network failures during review sync.
 * Production has seen `TypeError: fetch failed` caused by `getaddrinfo EBUSY`
 * when too many concurrent upserts hit DNS/socket limits.
 */

const TRANSIENT_PATTERN =
    /fetch failed|EBUSY|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|socket hang up|UND_ERR_|EMFILE|ECONNREFUSED|network/i;

function errorText(error: unknown): string {
    if (error == null) return "";
    if (typeof error === "string") return error;
    if (error instanceof Error) {
        const cause =
            error.cause instanceof Error
                ? `${error.cause.message} ${String(error.cause)}`
                : error.cause != null
                  ? String(error.cause)
                  : "";
        return `${error.name} ${error.message} ${cause}`;
    }
    if (typeof error === "object") {
        const record = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
        return [record.message, record.details, record.hint, record.code].map(String).join(" ");
    }
    return String(error);
}

export function isTransientSupabaseError(error: unknown): boolean {
    return TRANSIENT_PATTERN.test(errorText(error));
}

export async function sleepMs(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run an async mapper over items with a fixed concurrency ceiling.
 * Preserves input order in the returned array.
 */
export async function mapWithConcurrency<T, R>(
    items: readonly T[],
    concurrency: number,
    mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
    if (items.length === 0) return [];
    const limit = Math.max(1, Math.min(concurrency, items.length));
    const results = new Array<R>(items.length);
    let nextIndex = 0;

    async function worker(): Promise<void> {
        while (true) {
            const index = nextIndex;
            nextIndex += 1;
            if (index >= items.length) return;
            results[index] = await mapper(items[index], index);
        }
    }

    await Promise.all(Array.from({ length: limit }, () => worker()));
    return results;
}
