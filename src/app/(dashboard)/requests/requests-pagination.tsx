import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Previous / next links that keep the current view and customer filter. */
export function RequestsPagination({
    page,
    hasNext,
    query,
}: {
    page: number;
    hasNext: boolean;
    /** Extra query string, already encoded, starting with "&" (or empty). */
    query: string;
}) {
    return (
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
            <div className="flex items-center justify-center gap-2 sm:justify-end">
                <Button variant="outline" size="sm" disabled={page <= 1} asChild>
                    {page > 1 ? <Link href={`/requests?page=${page - 1}${query}`}>Previous</Link> : <span>Previous</span>}
                </Button>
                <span className="text-sm text-muted-foreground">Page {page}</span>
                <Button variant="outline" size="sm" disabled={!hasNext} asChild>
                    {hasNext ? <Link href={`/requests?page=${page + 1}${query}`}>Next</Link> : <span>Next</span>}
                </Button>
            </div>
        </div>
    );
}
