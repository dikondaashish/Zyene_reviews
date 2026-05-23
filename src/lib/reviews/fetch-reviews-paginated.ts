const DEFAULT_PAGE = 1000;
const SAFETY_MAX_ROWS = 500_000;

export type ReviewPageRow = Record<string, unknown>;

/**
 * Fetches every row for a reviews query by paging `.range()` — PostgREST returns at most
 * ~1000 rows per request, so a single `.select()` under-counts for large businesses.
 */
export async function fetchAllReviewRowsPaginated<T extends ReviewPageRow = ReviewPageRow>(
    pageSize: number,
    runPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<{ data: T[]; error: { message: string } | null }> {
    const out: T[] = [];
    let offset = 0;
    const size = Math.max(1, Math.min(pageSize, 1000));
    for (;;) {
        const { data, error } = await runPage(offset, offset + size - 1);
        if (error) {
            return { data: out, error };
        }
        const batch = data ?? [];
        out.push(...batch);
        if (batch.length < size) break;
        offset += size;
        if (offset > SAFETY_MAX_ROWS) {
            console.error("[fetchAllReviewRowsPaginated] safety cap reached");
            break;
        }
    }
    return { data: out, error: null };
}

export async function fetchAllReviewsDefaultPage<T extends ReviewPageRow = ReviewPageRow>(
    runPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<{ data: T[]; error: { message: string } | null }> {
    return fetchAllReviewRowsPaginated(DEFAULT_PAGE, runPage);
}
